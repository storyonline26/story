import dotenv from 'dotenv';

dotenv.config();

const splitOrigins = (value) => (value || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const port = Number(process.env.PORT || 5000);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port,
  publicApiUrl: process.env.API_URL || process.env.BACKEND_URL || `http://localhost:${port}`,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'development-only-story-secret-change-before-deploy',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  origins: [
    ...splitOrigins(process.env.FRONTEND_URL),
    ...splitOrigins(process.env.ADMIN_FRONTEND_URL),
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM || 'STORY India <orders@story.in>',
  // Backblaze B2 Storage
  b2KeyId: process.env.B2_KEY_ID,
  b2AppKey: process.env.B2_APP_KEY,
  b2BucketName: process.env.B2_BUCKET_NAME || 'story-india-images',
  b2BucketId: process.env.B2_BUCKET_ID,
  imageBaseUrl: process.env.IMAGE_BASE_URL || '',
  maxImageWidth: Number(process.env.MAX_IMAGE_WIDTH || 1200),
  imageQuality: Number(process.env.IMAGE_QUALITY || 80)
};

export const isProduction = env.nodeEnv === 'production';
