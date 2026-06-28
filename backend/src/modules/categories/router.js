import express from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { requireAdminAuth } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { serializeCategory, serializeProduct } from '../../utils/serializers.js';
import { uniqueSlug } from '../../utils/slugify.js';
import { uploadToB2 } from '../../utils/b2Upload.js';

export const categoriesRouter = express.Router();
export const adminCategoriesRouter = express.Router();

const bodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  imageUrl: z.string().optional().nullable(),
  isActive: z.coerce.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().optional().default(0),
  isDynamic: z.coerce.boolean().optional().default(false),
  parent: z.string().optional().nullable(),
  sizes: z.any().optional().nullable(),
  genderFilter: z.string().optional().nullable()
});

categoriesRouter.get('/', asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  });
  res.json({ success: true, data: categories.map(serializeCategory) });
}));

categoriesRouter.get('/:slug', asyncHandler(async (req, res) => {
  const category = await prisma.category.findFirst({
    where: { slug: req.params.slug, isActive: true },
    include: {
      _count: { select: { products: true } },
      products: {
        where: { isActive: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({
    success: true,
    data: {
      ...serializeCategory(category),
      products: category.products.map(serializeProduct)
    }
  });
}));

adminCategoriesRouter.use(requireAdminAuth);

adminCategoriesRouter.get('/', asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  });
  res.json({ success: true, data: categories.map(serializeCategory) });
}));

adminCategoriesRouter.post('/', upload.single('image'), validate(z.object({ body: bodySchema })), asyncHandler(async (req, res) => {
  const uploaded = req.file ? await uploadToB2(req.file, 'categories') : undefined;
  const category = await prisma.category.create({
    data: {
      ...req.validated.body,
      slug: uniqueSlug(req.validated.body.name),
      imageUrl: uploaded || req.validated.body.imageUrl
    },
    include: { _count: { select: { products: true } } }
  });
  res.status(201).json({ success: true, data: serializeCategory(category) });
}));

adminCategoriesRouter.put('/:id', upload.single('image'), validate(z.object({
  params: z.object({ id: z.string().uuid() }),
  body: bodySchema.partial()
})), asyncHandler(async (req, res) => {
  const uploaded = req.file ? await uploadToB2(req.file, 'categories') : undefined;
  const data = {
    ...req.validated.body,
    ...(req.validated.body.name ? { slug: uniqueSlug(req.validated.body.name) } : {}),
    ...(uploaded ? { imageUrl: uploaded } : {})
  };

  const category = await prisma.category.update({
    where: { id: req.validated.params.id },
    data,
    include: { _count: { select: { products: true } } }
  });
  res.json({ success: true, data: serializeCategory(category) });
}));

adminCategoriesRouter.patch('/:id/sort', validate(z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ sortOrder: z.coerce.number().int() })
})), asyncHandler(async (req, res) => {
  const category = await prisma.category.update({
    where: { id: req.validated.params.id },
    data: { sortOrder: req.validated.body.sortOrder },
    include: { _count: { select: { products: true } } }
  });
  res.json({ success: true, data: serializeCategory(category) });
}));

adminCategoriesRouter.delete('/:id', validate(z.object({ params: z.object({ id: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  const category = await prisma.category.update({
    where: { id: req.validated.params.id },
    data: { isActive: false },
    include: { _count: { select: { products: true } } }
  });
  res.json({ success: true, data: serializeCategory(category) });
}));
