import path from 'node:path';
import dotenv from 'dotenv';
import { TEST_ADMIN, TEST_USER } from './fixtures';
import type { TestState } from './state';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

let prismaPromise: Promise<any> | null = null;

export async function getPrisma() {
  prismaPromise ??= import('../../backend/src/config/db.js').then((mod) => mod.prisma);
  return prismaPromise;
}

export async function cleanupTestData(state?: TestState) {
  const prisma = await getPrisma();
  const shouldCleanAdmin =
    state?.admin?.createdBySetup ||
    TEST_ADMIN.email === 'admin@storyindia.com' ||
    TEST_ADMIN.email.includes('story-e2e');
  const explicitEmails = [
    TEST_USER.email,
    shouldCleanAdmin ? TEST_ADMIN.email : undefined,
    state?.user?.email,
    state?.admin?.createdBySetup ? state.admin.email : undefined
  ].filter(Boolean);
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { in: explicitEmails } },
        { email: { contains: 'story-e2e+' } }
      ]
    },
    select: { id: true, email: true }
  });
  const userIds = users.map((user: { id: string }) => user.id);

  const products = await prisma.product.findMany({
    where: {
      OR: [
        ...(state?.product?.id ? [{ id: state.product.id }] : []),
        { sku: { startsWith: 'STORY-E2E-' } },
        { name: { startsWith: 'E2E ' } }
      ]
    },
    select: { id: true }
  });
  const productIds = products.map((product: { id: string }) => product.id);

  if (userIds.length || productIds.length) {
    await prisma.cartItem.deleteMany({
      where: {
        OR: [
          ...(userIds.length ? [{ userId: { in: userIds } }] : []),
          ...(productIds.length ? [{ productId: { in: productIds } }] : [])
        ]
      }
    });
    if (userIds.length) {
      await prisma.paymentTransaction.deleteMany({
        where: { order: { userId: { in: userIds } } }
      });
    }
    await prisma.orderItem.deleteMany({
      where: {
        OR: [
          ...(userIds.length ? [{ order: { userId: { in: userIds } } }] : []),
          ...(productIds.length ? [{ productId: { in: productIds } }] : [])
        ]
      }
    });
    if (userIds.length) {
      await prisma.order.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.address.deleteMany({ where: { userId: { in: userIds } } });
    }
  }

  if (productIds.length) {
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
  }

  await prisma.coupon.deleteMany({
    where: {
      OR: [
        { code: { startsWith: 'E2E' } },
        ...(state?.coupon?.code ? [{ code: state.coupon.code }] : [])
      ]
    }
  });

  await prisma.category.deleteMany({
    where: {
      OR: [
        { name: { startsWith: 'E2E ' } },
        { slug: { startsWith: 'e2e-' } },
        ...(state?.category?.id ? [{ id: state.category.id }] : [])
      ]
    }
  });

  if (userIds.length) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }

  if (state?.settings?.length) {
    for (const setting of state.settings) {
      if (setting.value === null) {
        await prisma.setting.deleteMany({ where: { key: setting.key } });
      } else {
        await prisma.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value }
        });
      }
    }
  }
}
