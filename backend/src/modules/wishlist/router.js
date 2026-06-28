import express from 'express';
import { prisma } from '../../config/db.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { serializeProduct } from '../../utils/serializers.js';

export const wishlistRouter = express.Router();

// GET /api/wishlist — get user's wishlist product IDs
wishlistRouter.get('/', requireAuth, asyncHandler(async (req, res) => {
  const items = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: {
      ids: items.map((item) => item.productId),
      products: items.map((item) => serializeProduct(item.product))
    }
  });
}));

// POST /api/wishlist/:productId — toggle wishlist (add if not exists, remove if exists)
wishlistRouter.post('/:productId', requireAuth, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } }
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    res.json({ success: true, data: { wishlisted: false, productId } });
  } else {
    await prisma.wishlist.create({ data: { userId, productId } });
    res.json({ success: true, data: { wishlisted: true, productId } });
  }
}));

// DELETE /api/wishlist/:productId — remove from wishlist
wishlistRouter.delete('/:productId', requireAuth, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  await prisma.wishlist.deleteMany({
    where: { userId: req.user.id, productId }
  });
  res.json({ success: true, data: { wishlisted: false, productId } });
}));
