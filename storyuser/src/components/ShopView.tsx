import React from 'react';
import { ArrowRight, CheckCircle2, Truck, RotateCcw, Headphones, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Category, Product, StorefrontContent } from '../types';
import { PRODUCTS } from '../data';
import { formatINR } from '../utils/currency';
import { HeroSection } from './HeroSection';
import { BrandLogoMarquee } from './BrandLogoMarquee';
import { CustomerNotesSection } from './CustomerNotesSection';

interface ShopViewProps {
  onSelectProduct: (product: Product) => void;
  setActiveScreen: (screen: any) => void;
  onOpenCategory: (categorySlug: string) => void;
  products?: Product[];
  categories?: Category[];
  content: StorefrontContent;
}

const productMatchesCategory = (product: Product, category: Category) =>
  product.categoryId === category.id || product.category.toLowerCase() === category.name.toLowerCase();

export const ShopView: React.FC<ShopViewProps> = ({ onSelectProduct, setActiveScreen, onOpenCategory, products, categories = [], content }) => {
  const productSource = products && products.length > 0 ? products : PRODUCTS;

  const scrollToProducts = () => {
    window.setTimeout(() => {
      document.getElementById('our-products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 20);
  };

  const categoryTiles = React.useMemo(() => categories
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name))
    .map((c) => ({
      ...c,
      count: productSource.filter((p) => productMatchesCategory(p, c)).length
    })), [categories, productSource]);

  const featuredProducts = productSource.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      id="shop-view-container"
      className="bg-[#F8F6F1] text-[#111111]"
    >
      {/* 1. Hero */}
      <HeroSection content={content} onShopEdit={scrollToProducts} onViewLookbook={() => setActiveScreen('discover')} />

      {/* 2. Brand trust strip */}
      <BrandLogoMarquee />

      {/* 3. Shop by Category */}
      <section className="mx-auto max-w-[1280px] px-5 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16" id="our-products-section">
        <SectionHeader
          eyebrow={content.productsEyebrow || 'Shop by Category'}
          title={content.productsTitle || 'Our Products'}
          description={content.productsBody || 'Explore curated essentials across clothing, footwear, and everyday luxury.'}
        />

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {categoryTiles.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onOpenCategory(category.slug)}
              className="group relative overflow-hidden rounded-lg bg-white border border-[#DDD8CF] text-left transition duration-300 hover:border-[#111111] hover:shadow-lg"
            >
              <div className="aspect-square overflow-hidden bg-[#EFECE6] sm:aspect-[4/3]">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#6B625A]">
                    <span className="font-display text-2xl font-bold">{category.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-[13px] font-semibold text-[#111111] sm:text-[15px]">{category.name}</h3>
                    <p className="mt-0.5 text-[10px] text-[#6B625A] sm:mt-1 sm:text-[12px]">
                      {category.count > 0 ? `${category.count} pieces` : 'Coming soon'}
                    </p>
                  </div>
                  <ArrowRight size={14} className="mt-0.5 shrink-0 text-[#6B625A] transition group-hover:translate-x-1 group-hover:text-[#111111] sm:mt-1" />
                </div>
                {category.description && (
                  <p className="mt-2 line-clamp-2 hidden text-[13px] leading-relaxed text-[#6B625A] sm:block">
                    {category.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>


      {/* 5. Trust Strip */}
      <section className="bg-[#F5F5F3] py-6">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-[#DDD8CF] bg-white p-4 text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#EFECE6]">
                <CheckCircle2 size={16} strokeWidth={1.5} className="text-[#111111]" />
              </div>
              <p className="mt-2 text-[12px] font-semibold text-[#111111]">Verified</p>
              <p className="mt-1 text-[11px] text-[#6B625A]">Brand authenticated</p>
            </div>
            <div className="rounded-lg border border-[#DDD8CF] bg-white p-4 text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#EFECE6]">
                <Truck size={16} strokeWidth={1.5} className="text-[#111111]" />
              </div>
              <p className="mt-2 text-[12px] font-semibold text-[#111111]">Fast Delivery</p>
              <p className="mt-1 text-[11px] text-[#6B625A]">All India shipping</p>
            </div>
            <div className="rounded-lg border border-[#DDD8CF] bg-white p-4 text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#EFECE6]">
                <RotateCcw size={16} strokeWidth={1.5} className="text-[#111111]" />
              </div>
              <p className="mt-2 text-[12px] font-semibold text-[#111111]">Easy Returns</p>
              <p className="mt-1 text-[11px] text-[#6B625A]">Hassle-free policy</p>
            </div>
            <div className="rounded-lg border border-[#DDD8CF] bg-white p-4 text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#EFECE6]">
                <Star size={16} strokeWidth={1.5} className="text-[#111111]" />
              </div>
              <p className="mt-2 text-[12px] font-semibold text-[#111111]">Best Price</p>
              <p className="mt-1 text-[11px] text-[#6B625A]">Premium at fair value</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews */}
      <CustomerNotesSection />

      {/* 7. Editorial CTA */}
      <section className="bg-[#111111] py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-[12px] uppercase tracking-[0.2em] text-white/50">Our Story</p>
              <h2 className="mt-4 font-display text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                Designed in studio.<br />Made to outlast trend.
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/65">
                Constructed by hand with quiet detail and everyday endurance. Real branded fashion for modern Indian wardrobes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveScreen('about')}
              className="group inline-flex items-center gap-3 border border-white px-7 py-4 text-[13px] font-semibold tracking-wide text-white transition hover:bg-white hover:text-[#111111]"
            >
              Read Our Story
              <ArrowRight size={16} strokeWidth={1.8} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

/* --- Subcomponents --- */

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#6B625A]">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-black text-[#111111] sm:text-4xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#6B625A]">{description}</p>
    </div>
  );
}

function ProductCard({ product, onSelect }: { product: Product; onSelect: (p: Product) => void }) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="group rounded-lg border border-[#DDD8CF] bg-white text-left transition duration-300 hover:border-[#111111] hover:shadow-md"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-[#EFECE6]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded bg-[#111111] px-2 py-1 text-[10px] font-semibold text-white">
            SALE
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wide text-[#6B625A]">{product.category}</p>
        <h3 className="mt-1 text-[14px] font-semibold text-[#111111] line-clamp-1">{product.name}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[15px] font-bold text-[#111111]">{formatINR(product.price)}</span>
          {hasDiscount && (
            <span className="text-[12px] text-[#6B625A] line-through">{formatINR(product.originalPrice!)}</span>
          )}
        </div>
        {product.sizes && product.sizes.length > 0 && (
          <p className="mt-2 text-[11px] text-[#6B625A]">{product.sizes.join(' Â· ')}</p>
        )}
      </div>
    </button>
  );
}

function TrustCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-[#DDD8CF] bg-white p-5 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#EFECE6]">
        <Icon size={18} strokeWidth={1.5} className="text-[#111111]" />
      </div>
      <h3 className="mt-3 text-[13px] font-semibold text-[#111111]">{title}</h3>
      <p className="mt-1.5 text-[12px] leading-relaxed text-[#6B625A]">{description}</p>
    </div>
  );
}
