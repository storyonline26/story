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

const app = express();
app.set('etag', false);
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uploadsDir = path.join(backendRoot, 'uploads');

const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.origins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
};

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());
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
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/cart', cartRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/contact', contactRouter);
app.use('/api/reviews', reviewsRouter);

app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/categories', adminCategoriesRouter);
app.use('/api/admin/coupons', adminCouponsRouter);
app.use('/api/admin/orders', adminOrdersRouter);
app.use('/api/admin/settings', adminSettingsRouter);
app.use('/api/admin/contact-requests', adminContactRouter);
app.use('/api/admin/reviews', adminReviewsRouter);
app.use('/api/admin', adminRouter);

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
