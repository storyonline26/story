import express from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { requireAdminAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { serializeProduct } from '../../utils/serializers.js';
import { uniqueSlug } from '../../utils/slugify.js';
import { uploadToB2, uploadBulkToB2 } from '../../utils/b2Upload.js';
import { upload, bulkUpload } from '../../middleware/upload.js';

export const productsRouter = express.Router();
export const adminProductsRouter = express.Router();
const productUpload = upload.fields([
  { name: 'images', maxCount: 4 },
  { name: 'secondaryImageFile', maxCount: 1 }
]);

const listSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    sort: z.enum(['price_asc', 'price_desc', 'newest', 'discount']).optional(),
    inStockOnly: z.coerce.boolean().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20)
  })
});

const productBody = z.object({
  name: z.string().min(1),
  categoryId: z.string().uuid().optional().nullable(),
  categorySlug: z.string().optional(),
  description: z.string().optional().default(''),
  price: z.coerce.number().positive(),
  originalPrice: z.coerce.number().positive().optional().nullable(),
  discountedPrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0).default(0),
  sku: z.string().optional().nullable(),
  isActive: z.coerce.boolean().optional().default(true),
  location: z.string().optional().default('Mumbai Hub'),
  images: z.union([z.array(z.string().min(1)), z.string()]).optional(),
  secondaryImage: z.string().optional().nullable(),
  sizes: z.union([z.array(z.string()), z.string()]).optional(),
  colors: z.union([z.array(z.object({ name: z.string(), hex: z.string() })), z.string()]).optional(),
  details: z.union([z.array(z.string()), z.string()]).optional(),
  composition: z.string().optional(),
  care: z.string().optional()
});

const createSchema = z.object({ body: productBody });
const updateSchema = z.object({ params: z.object({ id: z.string().uuid() }), body: productBody.partial() });
const stockSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ stock: z.coerce.number().int().min(0) })
});

const parseMaybeJson = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const resolveCategoryId = async ({ categoryId, categorySlug }) => {
  if (categoryId) return categoryId;
  if (!categorySlug) return undefined;
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  return category?.id;
};

const normalizeProductInput = async (body, imageFiles = [], secondaryImageFile) => {
  const uploadedImages = imageFiles.length
    ? await Promise.all(imageFiles.map((file) => uploadToB2(file, 'products')))
    : [];
  const uploadedSecondaryImage = secondaryImageFile
    ? await uploadToB2(secondaryImageFile, 'products')
    : undefined;
  const hasBodyImages = body.images !== undefined && body.images !== null && body.images !== '';
  const bodyImages = hasBodyImages ? parseMaybeJson(body.images, []) : undefined;

  // Reject base64 data URLs — require proper HTTP URLs
  if (bodyImages?.length) {
    const base64Image = bodyImages.find((img) => typeof img === 'string' && img.startsWith('data:'));
    if (base64Image) {
      throw new ApiError(400, 'Base64 image data is not allowed. Please provide a valid image URL (http:// or https://) or upload a file.');
    }
  }
  if (body.secondaryImage && body.secondaryImage.startsWith('data:')) {
    throw new ApiError(400, 'Base64 image data is not allowed for secondary image. Please provide a valid URL or upload a file.');
  }

  const images = hasBodyImages || uploadedImages.length
    ? [...(bodyImages || []), ...uploadedImages]
    : undefined;

  const hasPrice = body.price !== undefined && body.price !== null;
  const hasOriginalPrice = body.originalPrice !== undefined && body.originalPrice !== null && body.originalPrice !== '';
  const hasDiscountedPrice = body.discountedPrice !== undefined;
  const sellingPrice = hasPrice ? Number(body.price) : undefined;
  const originalPrice = hasOriginalPrice ? Number(body.originalPrice) : undefined;

  const data = {
    categoryId: await resolveCategoryId(body),
    name: body.name,
    slug: body.name ? uniqueSlug(body.name) : undefined,
    description: body.description,
    images,
    secondaryImage: uploadedSecondaryImage || body.secondaryImage,
    details: parseMaybeJson(body.details, undefined),
    composition: body.composition,
    care: body.care,
    sizes: parseMaybeJson(body.sizes, undefined),
    colors: parseMaybeJson(body.colors, undefined),
    gender: body.gender || undefined,
    sizeStock: parseMaybeJson(body.sizeStock, undefined),
    tags: body.tags ? (Array.isArray(body.tags) ? body.tags : String(body.tags).split(',').map(t => t.trim()).filter(Boolean)) : undefined,
    price: hasOriginalPrice ? originalPrice : body.price,
    discountedPrice: hasOriginalPrice
      ? (originalPrice > sellingPrice ? sellingPrice : null)
      : (hasDiscountedPrice ? body.discountedPrice : undefined),
    stock: body.stock,
    sku: body.sku,
    isActive: body.isActive,
    location: body.location
  };

  return data;
};

productsRouter.get('/', validate(listSchema), asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, sort, inStockOnly, page, limit } = req.validated.query;
  const where = {
    isActive: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } }
      ]
    } : {}),
    ...(inStockOnly ? { stock: { gt: 0 } } : {})
  };

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {})
    };
  }

  const orderBy = sort === 'price_asc' ? { price: 'asc' }
    : sort === 'price_desc' ? { price: 'desc' }
      : sort === 'discount' ? { discountedPrice: 'asc' }
        : { createdAt: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  res.json({
    success: true,
    data: products.map(serializeProduct),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

productsRouter.get('/:slug', asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, isActive: true },
    include: { category: true }
  });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, data: serializeProduct(product) });
}));

adminProductsRouter.use(requireAdminAuth);

adminProductsRouter.get('/', asyncHandler(async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: products.map(serializeProduct) });
}));

adminProductsRouter.post('/', productUpload, validate(createSchema), asyncHandler(async (req, res) => {
  const data = await normalizeProductInput(
    req.validated.body,
    req.files?.images || [],
    req.files?.secondaryImageFile?.[0]
  );
  const product = await prisma.product.create({
    data,
    include: { category: true }
  });
  res.status(201).json({ success: true, data: serializeProduct(product) });
}));

adminProductsRouter.put('/:id', productUpload, validate(updateSchema), asyncHandler(async (req, res) => {
  const data = await normalizeProductInput(
    req.validated.body,
    req.files?.images || [],
    req.files?.secondaryImageFile?.[0]
  );
  if (!req.validated.body.name) delete data.slug;
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

  const product = await prisma.product.update({
    where: { id: req.validated.params.id },
    data,
    include: { category: true }
  });
  res.json({ success: true, data: serializeProduct(product) });
}));

adminProductsRouter.patch('/:id/stock', validate(stockSchema), asyncHandler(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.validated.params.id },
    data: { stock: req.validated.body.stock },
    include: { category: true }
  });
  res.json({ success: true, data: serializeProduct(product) });
}));

adminProductsRouter.delete('/:id', validate(z.object({ params: z.object({ id: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.validated.params.id },
    data: { isActive: false },
    include: { category: true }
  });
  res.json({ success: true, data: serializeProduct(product) });
}));

// Bulk register products (up to 10 at once)
const bulkProductUpload = bulkUpload.array('images', 40);

adminProductsRouter.post('/bulk', bulkProductUpload, asyncHandler(async (req, res) => {
  const productsInput = parseMaybeJson(req.body.products, []);
  if (!Array.isArray(productsInput) || productsInput.length === 0) {
    throw new ApiError(400, 'Provide a "products" JSON array in the request body');
  }
  if (productsInput.length > 10) {
    throw new ApiError(400, 'Maximum 10 products per bulk request');
  }

  const allFiles = req.files || [];
  let fileIndex = 0;

  const created = [];
  for (const input of productsInput) {
    const imageCount = Number(input.imageCount || 0);
    const productFiles = allFiles.slice(fileIndex, fileIndex + imageCount);
    fileIndex += imageCount;

    const uploadedUrls = await uploadBulkToB2(productFiles, 'products');
    const bodyImages = parseMaybeJson(input.images, []);
    const images = [...bodyImages, ...uploadedUrls].filter(Boolean);

    const categoryId = await resolveCategoryId(input);
    const product = await prisma.product.create({
      data: {
        categoryId,
        name: input.name || 'Untitled Product',
        slug: uniqueSlug(input.name || 'product'),
        description: input.description || '',
        images: images.length ? images : [],
        secondaryImage: input.secondaryImage || null,
        details: parseMaybeJson(input.details, null),
        composition: input.composition || null,
        care: input.care || null,
        sizes: parseMaybeJson(input.sizes, null),
        colors: parseMaybeJson(input.colors, null),
        price: Number(input.price || 0),
        discountedPrice: input.originalPrice && Number(input.originalPrice) > Number(input.price)
          ? Number(input.price) : null,
        stock: Number(input.stock || 0),
        sku: input.sku || null,
        isActive: input.isActive !== false,
        location: input.location || 'Mumbai Hub'
      },
      include: { category: true }
    });
    created.push(serializeProduct(product));
  }

  res.status(201).json({ success: true, data: created, message: `${created.length} products created` });
}));
