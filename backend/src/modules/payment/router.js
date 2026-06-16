import crypto from 'crypto';
import express from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { fromPaise, toNumber } from '../../utils/money.js';
import { serializeOrder } from '../../utils/serializers.js';
import { sendEmail } from '../../utils/sendEmail.js';

export const paymentRouter = express.Router();

const orderInclude = { items: true, user: true };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const orderIdentityFilter = (id) => (uuidPattern.test(id)
  ? { OR: [{ id }, { publicId: id }] }
  : { publicId: id });

const hmac = (payload, secret) =>
  crypto.createHmac('sha256', secret).update(payload).digest('hex');

const markOrderPaid = async ({ order, razorpayPaymentId, razorpaySignature, method = 'Razorpay' }) => {
  if (order.paymentStatus === 'paid') {
    return prisma.order.findUnique({ where: { id: order.id }, include: orderInclude });
  }

  return prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (!item.productId) continue;
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        throw new ApiError(400, `${item.name} does not have enough stock`);
      }
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
      // Decrement size-level stock if sizeStock exists
      if (product.sizeStock && item.size) {
        const sizeStock = { ...(product.sizeStock || {}) };
        if (sizeStock[item.size] !== undefined) {
          sizeStock[item.size] = Math.max(0, sizeStock[item.size] - item.quantity);
          await tx.product.update({ where: { id: item.productId }, data: { sizeStock } });
        }
      }
    }

    if (order.couponId) {
      await tx.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { increment: 1 } }
      });
    }

    await tx.cartItem.deleteMany({ where: { userId: order.userId } });

    await tx.paymentTransaction.create({
      data: {
        orderId: order.id,
        gatewayId: razorpayPaymentId,
        amount: toNumber(order.total),
        currency: 'INR',
        method,
        status: 'Settled'
      }
    });

    return tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'paid',
        status: 'confirmed',
        razorpayPaymentId,
        razorpaySignature
      },
      include: orderInclude
    });
  }, { timeout: 15000 });
};

paymentRouter.post('/verify', requireAuth, validate(z.object({
  body: z.object({
    orderId: z.string(),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1)
  })
})), asyncHandler(async (req, res) => {
  if (!env.razorpayKeySecret) throw new ApiError(500, 'Razorpay is not configured');
  const order = await prisma.order.findFirst({
    where: {
      userId: req.user.id,
      ...orderIdentityFilter(req.validated.body.orderId)
    },
    include: orderInclude
  });
  if (!order) throw new ApiError(404, 'Order not found');

  const expected = hmac(`${order.razorpayOrderId}|${req.validated.body.razorpayPaymentId}`, env.razorpayKeySecret);
  if (expected !== req.validated.body.razorpaySignature) {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'failed' } });
    throw new ApiError(400, 'Payment verification failed');
  }

  const updated = await markOrderPaid({
    order,
    razorpayPaymentId: req.validated.body.razorpayPaymentId,
    razorpaySignature: req.validated.body.razorpaySignature
  });

  sendEmail({
    to: updated.user.email,
    subject: `STORY India order ${updated.publicId} confirmed`,
    text: `Your STORY India order ${updated.publicId} has been confirmed.`
  }).catch(() => {});

  res.json({ success: true, data: serializeOrder(updated) });
}));

export const razorpayWebhookHandler = asyncHandler(async (req, res) => {
  if (!env.razorpayWebhookSecret) {
    res.status(200).json({ success: true, data: { ignored: true } });
    return;
  }

  const signature = req.headers['x-razorpay-signature'];
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
  const expected = hmac(raw, env.razorpayWebhookSecret);
  if (expected !== signature) throw new ApiError(400, 'Invalid webhook signature');

  const event = JSON.parse(raw.toString('utf8'));
  const payment = event.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;
  if (!razorpayOrderId) {
    res.json({ success: true, data: { ignored: true } });
    return;
  }

  const order = await prisma.order.findFirst({
    where: { razorpayOrderId },
    include: orderInclude
  });
  if (!order) {
    res.json({ success: true, data: { ignored: true } });
    return;
  }

  if (event.event === 'payment.captured') {
    await markOrderPaid({
      order,
      razorpayPaymentId: payment.id,
      razorpaySignature: signature,
      method: payment.method || 'Razorpay'
    });
  }

  if (event.event === 'payment.failed') {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'failed' }
    });
    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        gatewayId: payment.id,
        amount: fromPaise(payment.amount || 0),
        currency: payment.currency || 'INR',
        method: payment.method || 'Razorpay',
        status: 'Failed'
      }
    });
  }

  res.json({ success: true, data: { received: true } });
});
