import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categorySeeds = [
  { name: 'Uppers', slug: 'uppers', sortOrder: 1, description: 'Shirts, jackets, tees and layers built for polished everyday dressing.', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80' },
  { name: 'Lowers', slug: 'lowers', sortOrder: 2, description: 'Trousers, denim and relaxed fits with clean lines and wearable structure.', imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80' },
  { name: 'Dresses', slug: 'dresses', sortOrder: 3, description: 'Statement silhouettes for women, edited for dinners, events and city days.', imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80' },
  { name: 'Co-ords', slug: 'co-ords', sortOrder: 4, description: 'Coordinated sets that make complete styling feel intentional and effortless.', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80' },
  { name: 'Footwear', slug: 'footwear', sortOrder: 5, description: 'Sneakers, sandals and premium pairs selected to anchor the full look.', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80' },
  { name: 'Accessories', slug: 'accessories', sortOrder: 6, description: 'Socks, bags and finishing details that complete the STORY wardrobe.', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80' },
  { name: 'Inners', slug: 'inners', sortOrder: 7, description: 'Everyday comfort essentials made to sit quietly under every outfit.', imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80' }
];

const productSeeds = [
  {
    name: 'Wide Leg Pants',
    slug: 'wide-leg-pants',
    sku: 'BTM-349-WHT',
    categorySlug: 'lowers',
    price: 3490,
    stock: 34,
    location: 'Mumbai Hub',
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80'],
    description: 'Flowing wide-leg trousers constructed from fine fluid cotton twill.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Off-White', hex: '#ECEBE4' }, { name: 'Pristine Black', hex: '#111111' }]
  },
  {
    name: 'Relaxed Linen Shirt',
    slug: 'relaxed-linen-shirt',
    sku: 'TOP-449-LIN',
    categorySlug: 'uppers',
    price: 4490,
    stock: 41,
    location: 'Bengaluru Hub',
    images: ['https://lh3.googleusercontent.com/aida/ADBb0uhp1lIVLofZ-7q0fuYMS6y1XarcOncWOQQP2IlXAyv0CtWaOjKcrj-Z-B74Td-W4GE4DVL9JiuOSnNzonOYTAPXDd_A_lIKTl-FzUHssl6TUarX98i__1FAAYYS0ivhiF5d4Pnb_BUXgbfoB3tMIslnUyHK90wo0N1u9DO54GSw4Y-05cx7M8TJxRSVl4f_ngK7ZoXnYRGEl8nDi_954jwzOY-cp7rHDfRKIhPD07_KoSMsk9dOnpWOP04'],
    description: 'Breathable pure linen shirt with raw horn-inspired buttons.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Flax Linen', hex: '#ECEBE4' }, { name: 'Chalk Black', hex: '#1D1C1E' }]
  },
  {
    name: 'Crew Neck Sweater',
    slug: 'crew-neck-sweater',
    sku: 'KNT-599-OAT',
    categorySlug: 'uppers',
    price: 5990,
    stock: 18,
    location: 'Delhi Hub',
    images: ['https://lh3.googleusercontent.com/aida/ADBb0uj8FLb9bsGlG-6QGa20qiQ81oAa0vcQuHGhzq_f4CIIwrMzW9OkwagBvsJmo4mpW_iicufR8hvZ1KpdMVrO-T-hhPyWy17jJ3LNS9VnMCgVjKqvaY_RuXXOCqg46YXyJmwH7RvA6r68Y37qp10t2ua_M7PK6hQiHt6lC3rmCvExbS80JE3Ro2UStfoe_h2HyGaSe7YylrVkinm7Przl1T0AJ84AgHMAuVQUcGhTM4Zy1dXucqx4Y5MFg2Y'],
    description: 'Medium knit flat rib sweater in supreme alpaca and extra-fine wool.',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Oatmeal Melange', hex: '#E3DFD5' }, { name: 'Anthracite', hex: '#222222' }]
  },
  {
    name: 'Classic Mini Dress',
    slug: 'classic-mini-dress',
    sku: 'DRS-699-BLK',
    categorySlug: 'dresses',
    price: 6990,
    stock: 22,
    location: 'Mumbai Hub',
    images: ['https://lh3.googleusercontent.com/aida/ADBb0uhyN0ftTAWh3Tfh0E5N4fdflr5eATKQ6Jfc7jugTq3U765-hyIgutRYp_02cCEmXLJveugetSTJM01H7dBUw7yplboo_KxK2b9G0QXcMTVXHxB9iWO5dBOX-gfDZZwuL2sTIKKcxzClyAxPnaAg5F7Nk4BEBHeTgMW9ZgPoXdhqFf7vvpv86Ds4CTmSFlQhM8i5QpOghUiu_f9PC3wvvC9XbRG7CchaPTUVmperlJtYFISoe1-g-cgeGnk'],
    description: 'Sleek shift mini dress featuring clean structured seams.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Cream White', hex: '#FAF8F5' }, { name: 'Charcoal Obsidian', hex: '#232325' }]
  },
  {
    name: 'Canvas Tote Bag',
    slug: 'canvas-tote-bag',
    sku: 'ACC-249-ECR',
    categorySlug: 'accessories',
    price: 2490,
    stock: 56,
    location: 'Jaipur Studio',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80'],
    description: 'Durable untreated organic cotton canvas tote.',
    sizes: ['O/S'],
    colors: [{ name: 'Natural Ecru', hex: '#EEEDE8' }, { name: 'Raw Charcoal', hex: '#3A3A3C' }]
  },
  {
    name: 'Structured Blazer',
    slug: 'structured-blazer',
    sku: 'OUT-899-TPE',
    categorySlug: 'uppers',
    price: 8990,
    discountedPrice: 8490,
    stock: 9,
    location: 'Mumbai Atelier',
    images: ['https://lh3.googleusercontent.com/aida/AP1WRLveJxgRKIHtwz-3sZdDZvaJsSy38nuzmnm1nci4mczoaSZf5MKt1locLHdleI70qmFh-L9WXz4eZGUHWFHTBvvBAIvn7ntErcg7wSW-IXKDHBiHRyem_ajfNRO8zvtuUEyv0DHrUP8jp7vPNOAbBgv6VAQ24oy61g2eF1HBJRSV2Vztnvzwg310u0_0R_WqW22Lz7l67ahFmQQPKa5CZ91TDyasxjhIRuA3lIoeXk-dWLEEY9TTdzqoojo'],
    description: 'Single-breasted elongated blazer in lightweight wool blend.',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Taupe Camel', hex: '#A89B8D' }, { name: 'Obsidian', hex: '#121212' }]
  },
  {
    name: 'Oversized Wool Coat',
    slug: 'oversized-wool-coat',
    sku: 'OUT-129-WOL',
    categorySlug: 'uppers',
    price: 12990,
    stock: 4,
    location: 'Delhi Hub',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC7GsO4SZpGyttxO7Ilf7Gv1HBIYDIxwnUpkjovYDaM3r5cs8IBWeIIeg3goVCtcNHA-FMUL52zkbB6uPyaqLzlAqfYGXlENw8MbSaEvVTjzkCnTazi9z7_-4UKeOAPNHlgI_lpNawrnPvs5wuzg614j78QlEWBL3cb6lBxh5zeydhbS5aq2rTmZJJcUfMnJW1b0IcENzpspGlbyzvx7D8NjQwTlMwP-OfE8JDT455Kuv7AkWtV9jF90LPM_FAALAOsW29NnHE2Ans'],
    description: 'Generously cut double-wool luxury coat with drop shoulders.',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Flax Ecru', hex: '#EAE6DF' }, { name: 'Dark Onyx', hex: '#1C1C1D' }]
  },
  {
    name: 'Rib-Knit Tank Top',
    slug: 'rib-knit-tank-top',
    sku: 'TOP-199-RIB',
    categorySlug: 'inners',
    price: 1990,
    stock: 48,
    location: 'Bengaluru Hub',
    images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80'],
    description: 'Fine-gauge rib knit organic cotton tank top.',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Chalk White', hex: '#FFFFFF' }, { name: 'Dark Carbon', hex: '#1A1A1C' }]
  },
  {
    name: 'Linen Co-ord Set',
    slug: 'linen-co-ord-set',
    sku: 'CRD-749-LIN',
    categorySlug: 'co-ords',
    price: 7490,
    discountedPrice: 6990,
    stock: 16,
    location: 'Jaipur Studio',
    images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'],
    description: 'Matched linen shirt and trouser set with relaxed resort tailoring.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Sand Linen', hex: '#D8CCB8' }, { name: 'Ink Black', hex: '#111111' }]
  },
  {
    name: 'Minimal Leather Sandals',
    slug: 'minimal-leather-sandals',
    sku: 'FTW-399-TAN',
    categorySlug: 'footwear',
    price: 3990,
    stock: 28,
    location: 'Delhi Hub',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'],
    description: 'Clean leather sandals with padded straps and a gripped sole.',
    sizes: ['36', '37', '38', '39', '40'],
    colors: [{ name: 'Warm Tan', hex: '#9A6A43' }, { name: 'Black', hex: '#111111' }]
  }
];

const detailFallbacks = [
  'Tailored everyday silhouette',
  'Soft structured finish',
  'Designed for Indian city wardrobes'
];

const secondaryImageFallback = 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85';

const enrichedProductSeeds = productSeeds.map((product) => ({
  ...product,
  images: product.images.length > 1 ? product.images : [...product.images, secondaryImageFallback],
  secondaryImage: product.secondaryImage || product.images[1] || secondaryImageFallback,
  details: product.details || detailFallbacks,
  composition: product.composition || '90% organic cotton, 10% linen',
  care: product.care || 'Dry clean only'
}));

const storyCategorySettings = [
  { key: 'uppers', label: 'Uppers', eyebrow: 'Sharp layers', description: 'Shirts, jackets, tees and layers built for polished everyday dressing.', cta: 'Shop Uppers', categories: ['TOP', 'SHIRTS', 'KNITWEAR', 'OUTERWEAR'], imageFallback: '/category/women/uppers.png', images: { men: '/category/men/uppers.png', women: '/category/women/uppers.png' } },
  { key: 'lowers', label: 'Lowers', eyebrow: 'Tailored ease', description: 'Trousers, denim and relaxed fits with clean lines and wearable structure.', cta: 'Shop Lowers', categories: ['BOTTOM'], imageFallback: '/category/women/lowers.png', images: { men: '/category/men/lowers.png', women: '/category/women/lowers.png' } },
  { key: 'dresses', label: 'Dresses', eyebrow: 'Evening lines', description: 'Statement silhouettes for women, edited for dinners, events and city days.', cta: 'Shop Dresses', categories: ['DRESSES'], imageFallback: '/category/women/dresses.png', images: { women: '/category/women/dresses.png' } },
  { key: 'co-ords', label: 'Co-ords', eyebrow: 'Matched sets', description: 'Coordinated sets that make complete styling feel intentional and effortless.', cta: 'Shop Co-ords', categories: ['CO-ORDS', 'COORDS', 'SETS'], imageFallback: '/category/women/co-ords.png', images: { men: '/category/men/co-ords.png', women: '/category/women/co-ords.png' } },
  { key: 'footwear', label: 'Footwear', eyebrow: 'Grounded polish', description: 'Sneakers, shoes and premium pairs selected to anchor the full look.', cta: 'Shop Footwear', categories: ['SHOES', 'FOOTWEAR'], imageFallback: '/category/women/footwear.png', images: { men: '/category/men/footwear.png', women: '/category/women/footwear.png' } },
  { key: 'accessories', label: 'Accessories', eyebrow: 'Finishing codes', description: 'Socks, bags and finishing details that complete the STORY wardrobe.', cta: 'Shop Accessories', categories: ['ACCESSORY', 'ACCESSORIES', 'SOCKS'], imageFallback: '/category/accessories.png', images: { default: '/category/accessories.png' }, subcategories: ['Socks'] },
  { key: 'inners', label: 'Inners', eyebrow: 'Daily foundation', description: 'Everyday comfort essentials made to sit quietly under every outfit.', cta: 'Shop Inners', categories: ['INNER', 'INNERS', 'UNDERWEAR'], imageFallback: '/category/women/inners.png', images: { men: '/category/men/inners.png', women: '/category/women/inners.png' } }
];

const settings = {
  delivery_fee: '149',
  free_delivery_above: '5000',
  gst_percentage: '18',
  gst_included_in_price: 'false',
  store_name: 'STORY India',
  store_phone: '+91 98765 43210',
  store_email: 'care@story.in',
  razorpay_currency: 'INR',
  razorpay_active: 'true',
  razorpay_key_id: '',
  cod_enabled: 'false',
  announcement_ticker_items: 'FREE SHIPPING ON ORDERS ABOVE INR 999,SALE 20% OFF,100% AUTHENTIC BRANDED FASHION,NEW ARRIVALS EVERY WEEK,EASY RETURNS & EXCHANGES,CURATED IN INDIA FOR YOU',
  home_hero_eyebrow: 'New editorial capsule',
  home_hero_title: 'Our Latest Story',
  home_hero_body: 'Discover timeless fashion pieces crafted in India for everyday elegance.',
  home_hero_primary_cta: 'Shop Edit',
  home_hero_secondary_cta: 'View Lookbook',
  home_hero_image_primary: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1100&q=85',
  home_hero_image_secondary: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85',
  home_hero_image_detail: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85',
  home_hero_image_fourth: '',
  home_hero_image_fifth: '',
  home_hero_image_sixth: '',
  home_hero_badge_eyebrow: 'Story India 2026',
  home_hero_badge_text: 'Tailored quiet luxury',
  home_products_eyebrow: 'Seasonal selection',
  home_products_title: 'Our Products',
  home_products_body: 'Explore curated essentials across clothing, footwear, and everyday luxury.',
  home_products_ids: 'wide-leg-pants,relaxed-linen-shirt,crew-neck-sweater,classic-mini-dress,canvas-tote-bag',
  home_collection_eyebrow: 'Curated combinations',
  home_collection_title: 'Perfect Match',
  home_collection_body: 'Explore curated collections designed to complement your style with comfort and confidence.',
  home_collection_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
  home_collection_product_ids: 'linen-co-ord-set,minimal-leather-sandals',
  discover_eyebrow: 'Our complete codes',
  discover_title: 'Collections',
  discover_search_placeholder: 'Search products, styling or releases...',
  discover_tag_label: 'Styling diary:',
  home_jewelry_eyebrow: 'Accessories edit',
  home_jewelry_title: 'Story Jewelry',
  home_jewelry_body: 'Adorn yourself with timeless accessories that complete every look.',
  home_recommendation_eyebrow: 'Selected next',
  home_recommendation_title: 'Recommendation',
  home_recommendation_ids: 'wide-leg-pants,structured-blazer,rib-knit-tank-top',
  story_categories: JSON.stringify(storyCategorySettings),
  privacy_policy: 'We respect your privacy and use customer information only to process orders, provide support, improve the shopping experience, and meet legal or payment requirements. We do not sell customer data. Payment information is processed securely by our payment partners.',
  terms_conditions: 'By using STORY India, you agree to provide accurate account, delivery, and payment information. Product availability, pricing, promotions, and delivery timelines may change without prior notice. Orders are confirmed only after successful payment and verification.',
  return_refund_policy: 'Returns or exchanges may be requested for eligible unused products within the return window shown at purchase. Items must be returned with tags, packaging, and invoice. Refunds are processed to the original payment method after quality check approval.'
};

const reviewSeeds = [
  {
    name: 'Sanjay Gupta',
    tag: 'FAST DELIVERY',
    rating: 5,
    review: 'Liked the delivery speed. Got my order in 4 days. Good product.'
  },
  {
    name: 'Vishal Singh',
    tag: 'PREMIUM QUALITY',
    rating: 5,
    review: "I shopped here for my birthday and couldn't be happier. Loved my Tommy t-shirt."
  },
  {
    name: 'Rahul Mehta',
    tag: 'PERFECT FIT',
    rating: 5,
    review: 'The fit was clean and the quality felt premium. Definitely ordering again.'
  },
  {
    name: 'Ananya Rao',
    tag: 'VERIFIED PURCHASE',
    rating: 5,
    review: 'Packaging was neat, and the product looked exactly like the photos.'
  },
  {
    name: 'Karan Shah',
    tag: 'BEST VALUE',
    rating: 5,
    review: 'Best place for branded fashion at a good price.'
  }
];

async function main() {
  const categoryBySlug = new Map();

  for (const category of categorySeeds) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
    categoryBySlug.set(saved.slug, saved);
  }

  for (const product of enrichedProductSeeds) {
    const { categorySlug, ...data } = product;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {
        ...data,
        categoryId: categoryBySlug.get(categorySlug)?.id
      },
      create: {
        ...data,
        categoryId: categoryBySlug.get(categorySlug)?.id
      }
    });
  }

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  for (const review of reviewSeeds) {
    const existing = await prisma.customerReview.findFirst({
      where: { name: review.name, review: review.review }
    });
    if (!existing) {
      await prisma.customerReview.create({
        data: { ...review, status: 'approved' }
      });
    }
  }

  await prisma.coupon.upsert({
    where: { code: 'INDIA10' },
    update: {},
    create: {
      code: 'INDIA10',
      type: 'percentage',
      value: 10,
      minOrderValue: 2000,
      maxDiscount: 1000,
      usageLimit: 500,
      expiresAt: new Date('2026-06-30T23:59:59.000Z')
    }
  });

  await prisma.coupon.upsert({
    where: { code: 'STORY15' },
    update: {},
    create: {
      code: 'STORY15',
      type: 'percentage',
      value: 15,
      minOrderValue: 5000,
      maxDiscount: 1500,
      usageLimit: 300,
      expiresAt: new Date('2026-07-31T23:59:59.000Z')
    }
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.warn('Skipping admin seed: ADMIN_EMAIL and ADMIN_PASSWORD env vars not set.');
    return;
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'admin', isActive: true },
    create: {
      firstName: 'STORY',
      lastName: 'Admin',
      email: adminEmail,
      phone: '+91 98765 43210',
      passwordHash,
      role: 'admin'
    }
  });

  console.log(`Seeded STORY India data. Admin email: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
