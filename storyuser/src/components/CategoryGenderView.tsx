import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Grid2X2,
  Minus,
  PackageSearch,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Truck
} from 'lucide-react';
import { motion } from 'motion/react';
import { Category, ColorOption, Product } from '../types';
import { PRODUCTS } from '../data';
import { formatINR } from '../utils/currency';

interface CategoryGenderViewProps {
  categorySlug: string;
  categories?: Category[];
  products?: Product[];
  cartItems?: Array<{ id: string; product: Product; selectedSize: string; selectedColor: ColorOption; quantity: number }>;
  onBack: () => void;
  onOpenCategory?: (categorySlug: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemoveItem?: (id: string) => void;
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

const fallbackHeroImage = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85';

const normalize = (value = '') =>
  value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const singular = (value = '') => normalize(value).replace(/ies$/, 'y').replace(/s$/, '');

const displayCategoryName = (category?: Category, slug = '') => {
  const name = category?.name || slug.replace(/-/g, ' ');
  if (singular(name) === 'accessorie' || singular(name) === 'accessory') return 'Accessories';
  if (singular(name) === 'lower') return 'Lowers';
  if (singular(name) === 'upper') return 'Uppers';
  return name;
};

const productMatchesCategory = (product: Product, category?: Category, slug?: string) => {
  if (!category && !slug) return false;
  const productCategory = normalize(product.category);
  const productCategorySingular = singular(product.category);
  const categoryName = normalize(category?.name || '');
  const categoryNameSingular = singular(category?.name || '');
  const categorySlug = normalize(category?.slug || slug || '');
  const categorySlugSingular = singular(category?.slug || slug || '');

  return product.categoryId === category?.id
    || productCategory === categoryName
    || productCategory === categorySlug
    || productCategorySingular === categoryNameSingular
    || productCategorySingular === categorySlugSingular;
};

const compactCountLabel = (count: number, singularLabel: string, pluralLabel: string) =>
  `${count} ${count === 1 ? singularLabel : pluralLabel}`;

const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`h-9 shrink-0 rounded-full border px-4 text-xs font-medium uppercase tracking-[0.12em] transition ${
      selected
        ? 'border-black bg-black text-white'
        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
    }`}
  >
    {label}
  </button>
);

const ProductTile: React.FC<{
  product: Product;
  fallbackImage: string;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  cartQty?: number;
  cartItemId?: string;
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemoveItem?: (id: string) => void;
}> = ({ product, fallbackImage, onSelectProduct, onAddToCart, cartQty = 0, cartItemId, onUpdateQuantity, onRemoveItem }) => {
  const imageCandidates = React.useMemo(
    () => Array.from(new Set([product.image, product.secondaryImage, ...(product.listImages || []), fallbackImage].filter(Boolean))),
    [fallbackImage, product.image, product.listImages, product.secondaryImage]
  );
  const [imageIndex, setImageIndex] = React.useState(0);
  const [imageUnavailable, setImageUnavailable] = React.useState(false);
  const currentImage = imageCandidates[imageIndex];
  const sizes = product.sizes || [];
  const discounted = typeof product.originalPrice === 'number' && product.originalPrice > product.price;
  const discountPercent = discounted ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

  React.useEffect(() => {
    setImageIndex(0);
    setImageUnavailable(false);
  }, [product.id, imageCandidates]);

  const handleImageError = () => {
    if (imageIndex < imageCandidates.length - 1) {
      setImageIndex((index) => index + 1);
      return;
    }
    setImageUnavailable(true);
  };

  return (
    <div className="group w-full overflow-hidden rounded-lg border border-[#d8d3ca] bg-white text-left shadow-sm transition-transform duration-200 hover:-translate-y-1">
      <button
        type="button"
        onClick={() => onSelectProduct(product)}
        className="w-full text-left"
      >
        <span className="relative block aspect-[4/3] overflow-hidden bg-[#e9e4da]">
          {!imageUnavailable && currentImage ? (
            <img
              src={currentImage}
              alt={product.name}
              className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.035]"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={handleImageError}
            />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#eeeae1] px-6 text-center">
              <PackageSearch size={26} strokeWidth={1.4} className="text-[#111111]" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#5f5b52]">
                Image preview coming soon
              </span>
            </span>
          )}
          {discounted && (
            <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-[#111111] shadow-sm">
              {discountPercent}% off
            </span>
          )}
        </span>
        <span className="block p-3 sm:p-4">
          <span className="flex items-start justify-between gap-3">
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium uppercase tracking-wide text-gray-900 sm:text-sm">{product.name}</span>
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-[#6f6b62]">{product.category}</span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-sm font-semibold text-gray-900">{formatINR(product.price)}</span>
              {discounted && (
                <span className="mt-1 block font-mono text-[10px] text-[#8b877e] line-through">
                  {formatINR(product.originalPrice!)}
                </span>
              )}
            </span>
          </span>
          <span className="mt-3 block font-mono text-[10px] uppercase tracking-widest text-gray-400">
            {sizes.slice(0, 5).join(' / ') || 'One size'}
          </span>
        </span>
      </button>
      <span className="block border-t border-[#ece9e1] px-3 pb-3 pt-2 sm:px-4">
        {cartQty === 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart) {
                onAddToCart(product);
              } else {
                onSelectProduct(product);
              }
            }}
            className="flex h-9 w-full items-center justify-center gap-2 bg-[#111111] text-[11px] font-semibold uppercase tracking-wider text-white transition hover:bg-black"
          >
            <ShoppingBag size={14} strokeWidth={1.6} />
            Add to Bag
          </button>
        ) : (
          <div className="flex h-9 items-center overflow-hidden rounded border border-[#111111]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (cartQty === 1 && onRemoveItem && cartItemId) {
                  onRemoveItem(cartItemId);
                } else if (onUpdateQuantity && cartItemId) {
                  onUpdateQuantity(cartItemId, -1);
                }
              }}
              className="flex h-full w-10 items-center justify-center text-[#111111] transition hover:bg-[#f0ece4]"
            >
              <Minus size={14} />
            </button>
            <span className="flex-1 text-center text-[13px] font-semibold text-[#111111]">{cartQty}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onUpdateQuantity && cartItemId) {
                  onUpdateQuantity(cartItemId, 1);
                }
              }}
              className="flex h-full w-10 items-center justify-center text-[#111111] transition hover:bg-[#f0ece4]"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </span>
    </div>
  );
};

const TrustItem: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 border-t border-[#dedbd2] py-4 first:border-t-0">
    <Icon className="mt-0.5 shrink-0 text-[#111111]" size={17} strokeWidth={1.5} />
    <div>
      <p className="font-mono text-[9px] uppercase tracking-widest text-[#6f6b62]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#111111]">{value}</p>
    </div>
  </div>
);

const ServiceCard: React.FC<{ icon: React.ElementType; title: string; body: string }> = ({ icon: Icon, title, body }) => (
  <div className="flex min-w-[180px] shrink-0 items-start gap-2.5 rounded-lg border border-gray-100 bg-white px-3 py-2.5 shadow-sm sm:min-w-[200px] lg:min-w-0 lg:flex-1">
    <Icon size={15} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#111111]" />
    <div>
      <p className="text-[11px] font-semibold text-[#111111]">{title}</p>
      <p className="mt-0.5 text-[10px] leading-4 text-gray-500">{body}</p>
    </div>
  </div>
);

export const CategoryGenderView: React.FC<CategoryGenderViewProps> = ({
  categorySlug,
  categories = [],
  products,
  cartItems = [],
  onBack,
  onOpenCategory,
  onSelectProduct,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem
}) => {
  const category = React.useMemo(
    () => categories.find((item) => normalize(item.slug) === normalize(categorySlug) || singular(item.slug) === singular(categorySlug)),
    [categories, categorySlug]
  );
  const source = products && products.length > 0 ? products : PRODUCTS;
  const categoryProducts = React.useMemo(
    () => source.filter((product) => productMatchesCategory(product, category, categorySlug)),
    [category, categorySlug, source]
  );
  const [activeSize, setActiveSize] = React.useState('');
  const [activeGender, setActiveGender] = React.useState<'all' | 'men' | 'women'>(
    categorySlug === 'dresses' ? 'women' : 'all'
  );
  const [sortMode, setSortMode] = React.useState<'featured' | 'low' | 'high'>('featured');
  const heroImage = category?.image || fallbackHeroImage;
  const title = displayCategoryName(category, categorySlug);
  const categoryOptions = React.useMemo(
    () => categories
      .filter((item) => item.isActive !== false)
      .slice()
      .sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name)),
    [categories]
  );
  const selectedCategorySlug = category?.slug || categorySlug;

  React.useEffect(() => {
    setActiveSize('');
    setActiveGender(categorySlug === 'dresses' ? 'women' : 'all');
    setSortMode('featured');
  }, [categorySlug]);

  const sizeOptions = React.useMemo(
    () => Array.from(new Set(categoryProducts.flatMap((product) => product.sizes || []))),
    [categoryProducts]
  );

  const visibleProducts = React.useMemo(() => {
    let filtered = activeSize
      ? categoryProducts.filter((product) => product.sizes?.includes(activeSize))
      : categoryProducts;

    if (activeGender !== 'all') {
      filtered = filtered.filter((product) => {
        const gender = (product.gender || 'unisex').toLowerCase();
        if (gender === 'unisex') return true;
        return gender === activeGender;
      });
    }

    if (sortMode === 'low') return [...filtered].sort((a, b) => a.price - b.price);
    if (sortMode === 'high') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [activeSize, activeGender, categoryProducts, sortMode]);

  const productGridClass = React.useMemo(() => {
    return 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3';
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-[60vh] bg-[#f6f5f1] pb-10 text-[#111111]"
      id="category-gender-view"
    >
      {/* Breadcrumb / Back row */}
      <div className="mx-auto max-w-screen-xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#d6d2c8] bg-white px-3 font-mono text-[9px] uppercase tracking-widest text-[#5f5b52] transition hover:border-[#111111] hover:text-[#111111]"
          >
            <ArrowLeft size={12} strokeWidth={1.6} />
            Back
          </button>
          <p className="hidden font-mono text-[9px] uppercase tracking-widest text-[#6f6b62] sm:block">
            Home / {title}
          </p>
        </div>
      </div>

      {/* Compact Hero: 2 columns on desktop */}
      <section className="mx-auto max-w-screen-xl px-4 pt-3 sm:px-6 lg:px-8">
        <div className="grid gap-3 lg:grid-cols-[1fr_0.8fr]">
          {/* Left: Category info */}
          <div className="rounded-lg border border-[#d8d3ca] bg-white p-4 sm:p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#6f6b62]">Story category</p>
            <h1 className="mt-1.5 text-2xl font-semibold uppercase leading-tight text-[#111111] sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[#5f5b52]">
              {category?.description || 'Explore STORY pieces selected for this category.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 border-t border-[#ece9e1] pt-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#6f6b62]">
                <span className="font-semibold text-[#111111]">{categoryProducts.length}</span> {categoryProducts.length === 1 ? 'piece' : 'pieces'}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#6f6b62]">
                <span className="font-semibold text-[#111111]">{sizeOptions.length || 1}</span> {sizeOptions.length === 1 ? 'size' : 'sizes'}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#6f6b62]">
                Tracked India delivery
              </span>
            </div>
          </div>

          {/* Right: Category image */}
          <div className="relative h-[180px] overflow-hidden rounded-lg border border-[#d8d3ca] bg-[#e9e4da] sm:h-[220px] lg:h-full lg:max-h-[280px]">
            <img
              src={heroImage}
              alt={`${title} category`}
              className="h-full w-full object-cover object-center"
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      </section>

      {/* Compact Toolbar */}
      <section className="mx-auto max-w-screen-xl px-4 pt-3 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#d8d3ca] bg-white px-3 py-2.5 sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#6f6b62]">
                {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}
              </p>
              <h2 className="text-base font-semibold text-[#111111]">Shop {title}</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Gender filter */}
              <div className="flex rounded-full border border-[#d8d3ca] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveGender('all')}
                  className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${activeGender === 'all' ? 'bg-[#111111] text-white' : 'bg-white text-[#6f6b62] hover:text-[#111111]'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGender('men')}
                  className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider border-l border-[#d8d3ca] transition ${activeGender === 'men' ? 'bg-[#111111] text-white' : 'bg-white text-[#6f6b62] hover:text-[#111111]'}`}
                >
                  Men
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGender('women')}
                  className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider border-l border-[#d8d3ca] transition ${activeGender === 'women' ? 'bg-[#111111] text-white' : 'bg-white text-[#6f6b62] hover:text-[#111111]'}`}
                >
                  Women
                </button>
              </div>
              {sizeOptions.length > 0 && (
                <div className="scrollbar-hide flex flex-nowrap gap-1.5 overflow-x-auto">
                  <FilterChip label="All" selected={!activeSize} onClick={() => setActiveSize('')} />
                  {sizeOptions.map((size) => (
                    <FilterChip key={size} label={size} selected={activeSize === size} onClick={() => setActiveSize(size)} />
                  ))}
                </div>
              )}
              {categoryOptions.length > 1 && (
                <select
                  value={selectedCategorySlug}
                  onChange={(event) => onOpenCategory?.(event.target.value)}
                  className="h-8 rounded-lg border border-gray-300 bg-white px-2 text-xs text-[#111111] outline-none focus:border-[#111111]"
                >
                  {categoryOptions.map((item) => (
                    <option key={item.id} value={item.slug}>{displayCategoryName(item, item.slug)}</option>
                  ))}
                </select>
              )}
              <select
                aria-label="Sort products"
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as 'featured' | 'low' | 'high')}
                className="h-8 rounded-lg border border-gray-300 bg-white px-2 text-xs text-[#111111] outline-none focus:border-[#111111]"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: Low → High</option>
                <option value="high">Price: High → Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Trust cards — compact */}
      <section className="mx-auto max-w-screen-xl px-4 pt-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <ServiceCard icon={ShieldCheck} title="Verified pieces" body="Authenticated and quality checked." />
          <ServiceCard icon={Ruler} title="Size support" body="Filter by size, check fit details." />
          <ServiceCard icon={Truck} title="Fast checkout" body="Tracked shipping across India." />
        </div>
      </section>

      {/* Product Grid */}
      <section className="mx-auto max-w-screen-xl px-4 pt-4 sm:px-6 lg:px-8">
        {visibleProducts.length > 0 ? (
          <div className={productGridClass}>
            {visibleProducts.map((product) => {
              const defaultSize = product.sizes?.[0] || 'O/S';
              const defaultColor = product.colors?.[0] || { name: 'Default', hex: '#111111' };
              const itemId = `${product.id}-${defaultSize}-${defaultColor.name.toLowerCase()}`;
              const qty = cartItems.find(item => item.id === itemId)?.quantity || 0;
              return (
                <ProductTile
                  key={product.id}
                  product={product}
                  fallbackImage={heroImage}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={onAddToCart}
                  cartQty={qty}
                  cartItemId={itemId}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemoveItem={onRemoveItem}
                />
              );
            })}
            {visibleProducts.length < 3 && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#DDD8CF] bg-white p-6 text-center">
                <Sparkles size={20} strokeWidth={1.4} className="text-[#6B625A]" />
                <p className="mt-2 text-[13px] font-semibold text-[#111111]">More edits coming soon</p>
                <p className="mt-1 text-[11px] text-[#6B625A]">New drops added every week.</p>
                <button
                  type="button"
                  onClick={onBack}
                  className="mt-3 inline-flex h-8 items-center gap-1.5 border border-[#111111] px-3 text-[10px] font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white"
                >
                  View all collections
                  <ArrowRight size={11} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#cfcac0] bg-white px-6 py-12 text-center">
            <Sparkles className="mx-auto text-[#111111]" size={22} strokeWidth={1.4} />
            <p className="mt-3 text-base font-semibold text-[#111111]">No products in this selection</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-[#6a665d]">
              Try another size or switch category.
            </p>
            {activeSize && (
              <button
                type="button"
                onClick={() => setActiveSize('')}
                className="mt-4 h-8 rounded-full border border-[#111111] px-4 font-mono text-[10px] uppercase tracking-widest transition hover:bg-[#111111] hover:text-white"
              >
                Clear size filter
              </button>
            )}
          </div>
        )}

        {/* STORY Verified Seal */}
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#111111]" />
            <div className="absolute inset-2 rounded-full border border-[#111111]/50" />
            <svg className="absolute inset-0 h-full w-full animate-[spin_20s_linear_infinite]" viewBox="0 0 200 200">
              <defs>
                <path id="categorySealCircle" d="M100,100 m-68,0 a68,68 0 1,1 136,0 a68,68 0 1,1 -136,0" fill="none" />
              </defs>
              <text className="fill-[#111111]" style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                <textPath href="#categorySealCircle" startOffset="0%">Verified authentic • 100% original • Best price &amp; quality • </textPath>
              </text>
            </svg>
            <div className="flex flex-col items-center">
              <span className="font-display text-xl font-black tracking-[0.08em] text-[#111111] sm:text-2xl">STORY</span>
              <span className="mt-0.5 text-[7px] font-medium uppercase tracking-[0.18em] text-[#6B625A] sm:text-[8px]">Verified Garment</span>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-[12px] text-[#6B625A]">Every piece is authenticated and quality checked before it reaches you.</p>
        </div>
      </section>
    </motion.div>
  );
};
