import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { authRouter } from './modules/auth/router.js';
import { productsRouter, adminProductsRouter } from './modules/products/router.js';
import { categoriesRouter, adminCategoriesRouter } from './modules/categories/router.js';
import { cartRouter } from './modules/cart/router.js';
import { couponsRouter, adminCouponsRouter } from './modules/coupons/router.js';
import { ordersRouter, adminOrdersRouter } from './modules/orders/router.js';
import { paymentRouter, razorpayWebhookHandler } from './modules/payment/router.js';
import { settingsRouter, adminSettingsRouter } from './modules/settings/router.js';
import { profileRouter } from './modules/profile/router.js';
import { wishlistRouter } from './modules/wishlist/router.js';
import { adminRouter } from './modules/admin/router.js';
import { contactRouter, adminContactRouter } from './modules/contact/router.js';
import { reviewsRouter, adminReviewsRouter } from './modules/reviews/router.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import {
  apiKeyGuard,
  loginLimiter,
  registerLimiter,
  transactionLimiter,
  publicLimiter,
  adminLimiter,
  sanitizeInput,
  extraSecurityHeaders,
  requestId
} from './middleware/security.js';

const app = express();
app.set('etag', false);
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uploadsDir = path.join(backendRoot, 'uploads');

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (server-to-server, curl, etc)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      ...env.origins,
      process.env.FRONTEND_URL,
      process.env.ADMIN_FRONTEND_URL
    ].filter(Boolean).map(o => o.replace(/\/$/, ''));

    // Block raw IP access
    if (/^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(origin)) return callback(null, false);

    // Exact match or same domain with any port
    const isAllowed = allowedOrigins.some(allowed => {
      const allowedDomain = allowed.replace(/^https?:\/\//, '').split(':')[0];
      const originDomain = origin.replace(/^https?:\/\//, '').split(':')[0];
      return origin === allowed || originDomain === allowedDomain;
    });

    if (isAllowed) return callback(null, true);
    callback(null, false); // silent deny — no error log spam
  },
  credentials: true
};

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(requestId);
app.use(extraSecurityHeaders);
app.use(sanitizeInput);
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(uploadsDir, {
  etag: true,
  maxAge: '7d',
  immutable: true,
  setHeaders(res, filePath) {
    if (/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(filePath)) {
      res.set('Cache-Control', 'public, max-age=604800, immutable');
    }
  }
}));
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), razorpayWebhookHandler);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// API Key guard — all /api routes require valid key
app.use('/api', apiKeyGuard);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: () => process.env.DISABLE_RATE_LIMIT === 'true',
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  skip: () => process.env.DISABLE_RATE_LIMIT === 'true',
  standardHeaders: true,
  legacyHeaders: false
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'story-india-api' } });
});

app.use('/api/auth', authLimiter, authRouter);
app.use('/api', apiLimiter);
app.use('/api/products', publicLimiter, productsRouter);
app.use('/api/categories', publicLimiter, categoriesRouter);
app.use('/api/cart', transactionLimiter, cartRouter);
app.use('/api/coupons', publicLimiter, couponsRouter);
app.use('/api/orders', transactionLimiter, ordersRouter);
app.use('/api/payment', transactionLimiter, paymentRouter);
app.use('/api/settings', publicLimiter, settingsRouter);
app.use('/api/profile', transactionLimiter, profileRouter);
app.use('/api/wishlist', transactionLimiter, wishlistRouter);
app.use('/api/contact', transactionLimiter, contactRouter);
app.use('/api/reviews', publicLimiter, reviewsRouter);

app.use('/api/admin/products', adminLimiter, adminProductsRouter);
app.use('/api/admin/categories', adminLimiter, adminCategoriesRouter);
app.use('/api/admin/coupons', adminLimiter, adminCouponsRouter);
app.use('/api/admin/orders', adminLimiter, adminOrdersRouter);
app.use('/api/admin/settings', adminLimiter, adminSettingsRouter);
app.use('/api/admin/contact-requests', adminLimiter, adminContactRouter);
app.use('/api/admin/reviews', adminLimiter, adminReviewsRouter);
app.use('/api/admin', adminLimiter, adminRouter);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.log(`STORY India API listening on http://localhost:${env.port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${env.port} is in use. Retrying in 1s...`);
    setTimeout(() => server.listen(env.port), 1000);
  } else {
    throw err;
  }
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 3000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.once('SIGUSR2', async () => {
  await prisma.$disconnect();
  process.kill(process.pid, 'SIGUSR2');
});
