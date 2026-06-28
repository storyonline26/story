import express from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { razorpay } from '../../config/razorpay.js';
import { env } from '../../config/env.js';
import { requireAdminAuth, requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { calculateOrderTotals } from '../../utils/orderTotals.js';
import { paise, toNumber } from '../../utils/money.js';
import { serializeOrder } from '../../utils/serializers.js';

export const ordersRouter = express.Router();
export const adminOrdersRouter = express.Router();

const orderInclude = {
  items: true,
  user: true,
  transactions: true
};

const generatePublicId = () => `ST-IN-${Math.floor(10000 + Math.random() * 90000)}`;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const orderIdentityFilter = (id) => (uuidPattern.test(id)
  ? { OR: [{ id }, { publicId: id }] }
  : { publicId: id });
const settingsToObject = (settings) => Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
const settingEnabled = (settings, key, fallback = false) => {
  const value = settings[key];
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

const validateCoupon = async (couponCode, subtotal) => {
  if (!couponCode) return null;
  const coupon = await prisma.coupon.findFirst({ where: { code: couponCode.trim().toUpperCase(), isActive: true } });
  if (!coupon) throw new ApiError(400, 'Invalid coupon code');
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ApiError(400, 'Coupon expired');
  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit reached');
  }
  if (subtotal < toNumber(coupon.minOrderValue)) throw new ApiError(400, `Minimum order INR ${toNumber(coupon.minOrderValue)} required`);
  return coupon;
};

ordersRouter.use(requireAuth);

ordersRouter.post('/', validate(z.object({
  body: z.object({
    addressId: z.string().uuid(),
    paymentMethod: z.enum(['online', 'cod']).optional().default('online'),
    couponCode: z.string().optional(),
    notes: z.string().optional()
  })
})), asyncHandler(async (req, res) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { product: true }
  });
  if (cartItems.length === 0) throw new ApiError(400, 'Cart is empty');

  for (const item of cartItems) {
    if (!item.product.isActive) throw new ApiError(400, `${item.product.name} is unavailable`);
    if (item.quantity > item.product.stock) throw new ApiError(400, `${item.product.name} has only ${item.product.stock} in stock`);
  }

  const address = await prisma.address.findFirst({
    where: { id: req.validated.body.addressId, userId: req.user.id }
  });
  if (!address) throw new ApiError(404, 'Address not found');

  const settings = await prisma.setting.findMany();
  const settingsObject = settingsToObject(settings);
  const onlinePaymentEnabled = settingEnabled(settingsObject, 'online_payment_enabled', true) && settingEnabled(settingsObject, 'razorpay_active', true);
  const codEnabled = settingEnabled(settingsObject, 'cod_enabled', false);
  const paymentMethod = req.validated.body.paymentMethod;

  if (paymentMethod === 'online' && !onlinePaymentEnabled) throw new ApiError(400, 'Online payment is currently disabled');
  if (paymentMethod === 'cod' && !codEnabled) throw new ApiError(400, 'Pay on delivery is currently disabled');
  if (paymentMethod === 'online' && !razorpay) throw new ApiError(500, 'Razorpay is not configured');

  const subtotalPreview = cartItems.reduce((sum, item) => sum + toNumber(item.product.discountedPrice || item.product.price) * item.quantity, 0);
  const coupon = await validateCoupon(req.validated.body.couponCode, subtotalPreview);
  const totals = calculateOrderTotals({ items: cartItems, coupon, settings });
  const publicId = generatePublicId();
  const razorpayOrder = paymentMethod === 'online'
    ? await razorpay.orders.create({
        amount: paise(totals.total),
        currency: 'INR',
        receipt: publicId,
        notes: {
          publicId,
          userId: req.user.id
        }
      })
    : null;

  const addressSnapshot = {
    id: address.id,
    fullName: address.name,
    phone: address.phone,
    street: [address.line1, address.line2].filter(Boolean).join(', '),
    city: `${address.city}, ${address.state} ${address.pincode}`,
    country: address.country
  };

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        publicId,
        userId: req.user.id,
        addressSnapshot,
        subtotal: totals.subtotal,
        couponId: coupon?.id,
        couponCode: coupon?.code,
        couponDiscount: totals.couponDiscount,
        deliveryFee: totals.deliveryFee,
        gstPercentage: totals.gstPercentage,
        gstAmount: totals.gstAmount,
        total: totals.total,
        paymentStatus: 'pending',
        status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
        razorpayOrderId: razorpayOrder?.id,
        notes: req.validated.body.notes,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            imageUrl: item.product.images[0],
            price: toNumber(item.product.discountedPrice || item.product.price),
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColorName: item.selectedColorName,
            selectedColorHex: item.selectedColorHex,
            subtotal: toNumber(item.product.discountedPrice || item.product.price) * item.quantity
          }))
        }
      },
      include: orderInclude
    });

    if (paymentMethod === 'cod') {
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      if (coupon?.id) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: req.user.id } });
      await tx.paymentTransaction.create({
        data: {
          orderId: created.id,
          amount: totals.total,
          currency: 'INR',
          method: 'Pay on delivery',
          status: 'Pending'
        }
      });
    }

    return created;
  });

  res.status(201).json({
    success: true,
    data: {
      order: serializeOrder(order),
      orderId: order.id,
      publicId: order.publicId,
      paymentMethod,
      requiresOnlinePayment: paymentMethod === 'online',
      razorpayOrderId: razorpayOrder?.id || '',
      amount: razorpayOrder?.amount || paise(totals.total),
      currency: razorpayOrder?.currency || 'INR',
      keyId: paymentMethod === 'online' ? env.razorpayKeyId : ''
    }
  });
}));

ordersRouter.get('/', validate(z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(50).optional().default(10)
  })
})), asyncHandler(async (req, res) => {
  const { page, limit } = req.validated.query;
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const where = { userId: req.user.id, createdAt: { gte: since } };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.order.count({ where })
  ]);
  res.json({
    success: true,
    data: orders.map(serializeOrder),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
}));

ordersRouter.get('/:id', asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: {
      userId: req.user.id,
      ...orderIdentityFilter(req.params.id)
    },
    include: orderInclude
  });
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, data: serializeOrder(order) });
}));

ordersRouter.post('/:id/cancel', asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { userId: req.user.id, ...orderIdentityFilter(req.params.id) },
    include: { items: true }
  });
  if (!order) throw new ApiError(404, 'Order not found');
  if (!['pending', 'confirmed'].includes(order.status)) throw new ApiError(400, 'Order can no longer be cancelled');

  const updated = await prisma.$transaction(async (tx) => {
    if (order.paymentStatus === 'paid' || !order.razorpayOrderId) {
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }
    }
    return tx.order.update({
      where: { id: order.id },
      data: { status: 'cancelled' },
      include: orderInclude
    });
  });
  res.json({ success: true, data: serializeOrder(updated) });
}));

adminOrdersRouter.use(requireAdminAuth);

adminOrdersRouter.get('/', asyncHandler(async (req, res) => {
  const { status, paymentStatus, search } = req.query;
  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: String(status) } : {}),
      ...(paymentStatus ? { paymentStatus: String(paymentStatus) } : {}),
      ...(search ? {
        OR: [
          { publicId: { contains: String(search), mode: 'insensitive' } },
          { user: { email: { contains: String(search), mode: 'insensitive' } } },
          { user: { firstName: { contains: String(search), mode: 'insensitive' } } }
        ]
      } : {})
    },
    include: orderInclude,
    orderBy: { createdAt: 'desc' }
  });
  res.json({
    success: true,
    data: orders.map((order) => ({
      ...serializeOrder(order),
      customerName: order.user
        ? `${order.user.firstName}${order.user.lastName ? ` ${order.user.lastName}` : ''}`
        : order.addressSnapshot?.fullName || order.addressSnapshot?.name || 'Customer',
      customerEmail: order.user?.email || '',
      amount: toNumber(order.total),
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.status
    }))
  });
}));

adminOrdersRouter.get('/:id', asyncHandler(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: orderIdentityFilter(req.params.id),
    include: orderInclude
  });
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, data: serializeOrder(order) });
}));

adminOrdersRouter.patch('/:id/status', validate(z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
    trackingUrl: z.string().trim().url().or(z.literal('')).optional()
  })
})), asyncHandler(async (req, res) => {
  const existing = await prisma.order.findFirst({ where: orderIdentityFilter(req.validated.params.id) });
  if (!existing) throw new ApiError(404, 'Order not found');
  const data = {
    ...req.validated.body,
    ...(req.validated.body.trackingUrl === '' ? { trackingUrl: null } : {})
  };
  const order = await prisma.order.update({
    where: { id: existing.id },
    data,
    include: orderInclude
  });
  res.json({ success: true, data: serializeOrder(order) });
}));

adminOrdersRouter.patch('/:id/tracking', validate(z.object({
  params: z.object({ id: z.string() }),
  body: z.object({ trackingUrl: z.string().min(1) })
})), asyncHandler(async (req, res) => {
  const existing = await prisma.order.findFirst({ where: orderIdentityFilter(req.validated.params.id) });
  if (!existing) throw new ApiError(404, 'Order not found');
  const order = await prisma.order.update({
    where: { id: existing.id },
    data: { trackingUrl: req.validated.body.trackingUrl },
    include: orderInclude
  });
  res.json({ success: true, data: serializeOrder(order) });
}));
