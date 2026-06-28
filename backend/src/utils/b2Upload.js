import crypto from 'node:crypto';
import B2 from 'backblaze-b2';
import sharp from 'sharp';
import { env } from '../config/env.js';
import { ApiError } from './ApiError.js';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB raw upload limit

// B2 client (initialized lazily)
let b2Client = null;
let b2Authorized = false;
let uploadUrl = null;
let uploadAuthToken = null;

const getB2 = async () => {
  if (!env.b2KeyId || !env.b2AppKey) return null;

  if (!b2Client) {
    b2Client = new B2({
      applicationKeyId: env.b2KeyId,
      applicationKey: env.b2AppKey
    });
  }

  if (!b2Authorized) {
    await b2Client.authorize();
    b2Authorized = true;
  }

  return b2Client;
};

const getUploadUrl = async (b2) => {
  if (uploadUrl && uploadAuthToken) return { uploadUrl, uploadAuthToken };
  const response = await b2.getUploadUrl({ bucketId: env.b2BucketId });
  uploadUrl = response.data.uploadUrl;
  uploadAuthToken = response.data.authorizationToken;
  return { uploadUrl, uploadAuthToken };
};

const resetUploadUrl = () => {
  uploadUrl = null;
  uploadAuthToken = null;
};

/**
 * Compress image using Sharp:
 * - Convert to WebP
 * - Resize to max width (keeps aspect ratio)
 * - Strip EXIF metadata
 * - Quality: configurable (default 80)
 */
const compressImage = async (buffer, options = {}) => {
  const width = options.width || env.maxImageWidth || 1200;
  const quality = options.quality || env.imageQuality || 80;

  return sharp(buffer)
    .rotate() // auto-rotate based on EXIF
    .resize(width, null, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality, effort: 4 })
    .toBuffer();
};

/**
 * Upload image buffer to Backblaze B2 + keep local backup.
 * Returns the public CDN URL (B2) but also saves locally for disaster recovery.
 * 
 * Flow:
 * 1. Validate file
 * 2. Compress with Sharp → WebP
 * 3. Save to local /uploads (backup)
 * 4. Upload to B2 (primary CDN)
 * 5. Return B2 CDN URL
 * 
 * If B2 fails → returns local URL (site still works)
 * If B2 suspended → change IMAGE_BASE_URL in .env → serves from local
 */
export const uploadToB2 = async (file, folder = 'products') => {
  if (!file?.buffer) throw new ApiError(400, 'Image file is required');
  if (!allowedTypes.has(file.mimetype)) throw new ApiError(400, 'Only image files (jpeg, png, webp, gif, avif) are allowed');
  if (file.buffer.length > MAX_FILE_SIZE) throw new ApiError(400, 'Image must be under 10MB');

  // Compress image
  const compressed = await compressImage(file.buffer);
  
  // Generate unique filename
  const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const fileName = `${folder}/${id}.webp`;

  // ALWAYS save locally first (backup)
  const localUrl = await uploadToLocal(compressed, fileName);

  // Try B2 upload
  const b2 = await getB2();
  if (!b2) return localUrl; // B2 not configured, use local

  let attempts = 0;
  while (attempts < 2) {
    try {
      const { uploadUrl: url, uploadAuthToken: token } = await getUploadUrl(b2);
      
      await b2.uploadFile({
        uploadUrl: url,
        uploadAuthToken: token,
        fileName,
        data: compressed,
        mime: 'image/webp'
      });

      // Return B2 CDN URL
      const baseUrl = env.imageBaseUrl || `https://f005.backblazeb2.com/file/${env.b2BucketName}`;
      return `${baseUrl}/${fileName}`;
    } catch (error) {
      attempts++;
      resetUploadUrl();
      if (attempts >= 2) {
        console.error('B2 upload failed, using local fallback:', error.message);
        return localUrl; // Fall back to local URL
      }
    }
  }
  return localUrl;
};

/**
 * Upload multiple images to B2.
 * Processes in parallel batches of 3.
 */
export const uploadBulkToB2 = async (files, folder = 'products') => {
  if (!files?.length) return [];

  const CONCURRENCY = 3;
  const results = [];

  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    const urls = await Promise.all(batch.map((file) => uploadToB2(file, folder)));
    results.push(...urls);
  }

  return results;
};

/**
 * Delete a file from B2 by its URL.
 */
export const deleteFromB2 = async (publicUrl) => {
  if (!publicUrl) return;
  
  const b2 = await getB2();
  if (!b2) return;

  try {
    // Extract fileName from URL
    const bucketName = env.b2BucketName;
    const urlParts = publicUrl.split(`/${bucketName}/`);
    if (urlParts.length < 2) return;
    
    const fileName = urlParts[1];
    
    // List file versions to get fileId
    const response = await b2.listFileNames({
      bucketId: env.b2BucketId,
      prefix: fileName,
      maxFileCount: 1
    });

    const file = response.data.files[0];
    if (file) {
      await b2.deleteFileVersion({
        fileId: file.fileId,
        fileName: file.fileName
      });
    }
  } catch (error) {
    console.error('B2 delete failed:', error.message);
  }
};

/**
 * Local fallback — saves to disk when B2 is not configured.
 * Used in development or when B2 credentials are missing.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const uploadsRoot = path.join(backendRoot, 'uploads');

const uploadToLocal = async (buffer, fileName) => {
  const filePath = path.join(uploadsRoot, fileName);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
  
  const baseUrl = env.publicApiUrl.replace(/\/$/, '');
  return `${baseUrl}/uploads/${fileName}`;
};
