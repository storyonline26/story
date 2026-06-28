import React from 'react';
import { ArrowLeft, Heart, Minus, PackageSearch, Plus, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { Category, ColorOption, Product } from '../types';
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
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: (productId: string) => boolean;
}

const ITEMS_PER_PAGE = 12;

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
  const pc = normalize(product.category);
  const pcs = singular(product.category);
  const cn = normalize(category?.name || '');
  const cns = singular(category?.name || '');
  const cs = normalize(category?.slug || slug || '');
  const css = singular(category?.slug || slug || '');
  return product.categoryId === category?.id || pc === cn || pc === cs || pcs === cns || pcs === css;
};

/* ─── Product Card ─── */
const ProductCard: React.FC<{
  product: Product;
  onSelect: (p: Product) => void;
  onAddToCart?: (p: Product) => void;
  cartQty: number;
  cartItemId: string;
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemoveItem?: (id: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: boolean;
}> = ({ product, onSelect, onAddToCart, cartQty, cartItemId, onUpdateQuantity, onRemoveItem, onToggleWishlist, isWishlisted }) => {
  const discounted = typeof product.originalPrice === 'number' && product.originalPrice > product.price;
  const discountPercent = discounted ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-[#DDD8CF] bg-white">
      {/* Image */}
      <button type="button" onClick={() => onSelect(product)} className="relative aspect-[3/4] overflow-hidden bg-[#EFECE6]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-[center_top] transition duration-300 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <PackageSearch size={24} className="text-[#6B625A]" />
          </span>
        )}
        {/* Discount badge */}
        {discounted && (
          <span className="absolute left-2 top-2 rounded bg-[#111111] px-1.5 py-0.5 text-[10px] font-bold text-white">
            {discountPercent}% OFF
          </span>
        )}
        {/* Wishlist heart */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(product.id); }}
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition ${isWishlisted ? 'text-red-500' : 'text-[#6B625A] hover:text-red-500'}`}
        >
          <Heart size={16} strokeWidth={1.5} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </button>

      {/* Info */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <button type="button" onClick={() => onSelect(product)} className="text-left">
          <p className="truncate text-[12px] font-semibold text-[#111111] sm:text-[13px]">{product.name}</p>
          <p className="mt-0.5 text-[10px] uppercase text-[#6B625A]">{product.category}</p>
        </button>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[14px] font-bold text-[#111111]">{formatINR(product.price)}</span>
          {discounted && (
            <span className="text-[11px] text-[#6B625A] line-through">{formatINR(product.originalPrice!)}</span>
          )}
        </div>

        {/* Add to Bag / Qty stepper */}
        <div className="mt-auto pt-2.5">
          {cartQty === 0 ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
              className="flex h-9 w-full items-center justify-center gap-1.5 border border-[#111111] text-[10px] font-semibold uppercase tracking-wider text-[#111111] transition hover:bg-[#111111] hover:text-white"
            >
              <ShoppingBag size={13} strokeWidth={1.6} />
              Add to Bag
            </button>
          ) : (
            <div className="flex h-9 items-center overflow-hidden border border-[#111111]">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); cartQty === 1 && onRemoveItem ? onRemoveItem(cartItemId) : onUpdateQuantity?.(cartItemId, -1); }}
                className="flex h-full w-9 items-center justify-center text-[#111111] hover:bg-[#f0ece4]"
              >
                <Minus size={13} />
              </button>
              <span className="flex-1 text-center text-[12px] font-bold text-[#111111]">{cartQty}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onUpdateQuantity?.(cartItemId, 1); }}
                className="flex h-full w-9 items-center justify-center text-[#111111] hover:bg-[#f0ece4]"
              >
                <Plus size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Filter Chip ─── */
const Chip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`h-8 shrink-0 rounded-full border px-3 text-[11px] font-medium transition ${
      active ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#DDD8CF] bg-white text-[#6B625A] hover:border-[#111111]'
    }`}
  >
    {label}
  </button>
);

/* ─── Main Component ─── */
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
  onRemoveItem,
  onToggleWishlist,
  isWishlisted
}) => {
  const category = React.useMemo(
    () => categories.find((item) => normalize(item.slug) === normalize(categorySlug) || singular(item.slug) === singular(categorySlug)),
    [categories, categorySlug]
  );
  const source = products && products.length > 0 ? products : [];
  const categoryProducts = React.useMemo(
    () => source.filter((p) => productMatchesCategory(p, category, categorySlug)),
    [category, categorySlug, source]
  );

  const [activeSize, setActiveSize] = React.useState('');
  const [activeTag, setActiveTag] = React.useState('');
  const [activeGender, setActiveGender] = React.useState<'all' | 'men' | 'women'>(
    (category?.genderFilter as 'all' | 'men' | 'women') || 'all'
  );
  const [sortMode, setSortMode] = React.useState('featured');
  const [visibleCount, setVisibleCount] = React.useState(ITEMS_PER_PAGE);

  const title = displayCategoryName(category, categorySlug);

  React.useEffect(() => {
    setActiveSize('');
    setActiveTag('');
    setActiveGender((category?.genderFilter as 'all' | 'men' | 'women') || 'all');
    setSortMode('featured');
    setVisibleCount(ITEMS_PER_PAGE);
  }, [categorySlug, category?.genderFilter]);

  const sizeOptions = React.useMemo(
    () => (category?.sizes?.length ? category.sizes : Array.from(new Set(categoryProducts.flatMap((p) => p.sizes || [])))) as string[],
    [category?.sizes, categoryProducts]
  );

  const tagOptions = React.useMemo(
    () => Array.from(new Set(categoryProducts.flatMap((p) => p.tags || []))).filter(Boolean),
    [categoryProducts]
  );

  const filteredProducts = React.useMemo(() => {
    let list = [...categoryProducts];
    if (activeSize) list = list.filter((p) => p.sizes?.includes(activeSize));
    if (activeTag) list = list.filter((p) => p.tags?.includes(activeTag));
    if (activeGender !== 'all') {
      list = list.filter((p) => { const g = (p.gender || 'unisex').toLowerCase(); return g === 'unisex' || g === activeGender; });
    }
    if (sortMode === 'low') list.sort((a, b) => a.price - b.price);
    if (sortMode === 'high') list.sort((a, b) => b.price - a.price);
    return list;
  }, [activeSize, activeTag, activeGender, categoryProducts, sortMode]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#F8F6F1] text-[#111111]"
      id="category-gender-view"
    >
      {/* ─── Slim Category Banner ─── */}
      <div className="border-b border-[#DDD8CF] bg-white">
        <div className="mx-auto flex h-[70px] max-w-screen-xl items-center gap-3 px-4 sm:h-[80px] sm:px-6 lg:px-8">
          <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DDD8CF] text-[#6B625A] transition hover:border-[#111111] hover:text-[#111111]">
            <ArrowLeft size={16} strokeWidth={1.8} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-bold text-[#111111] sm:text-[22px]">{title}</h1>
            <p className="text-[11px] text-[#6B625A]">{filteredProducts.length} Products</p>
          </div>
          {onOpenCategory && categories.length > 1 && (
            <select
              value={category?.slug || categorySlug}
              onChange={(e) => onOpenCategory(e.target.value)}
              className="h-9 rounded-lg border border-[#DDD8CF] bg-white px-2 text-[12px] text-[#111111] outline-none"
            >
              {categories.filter((c) => c.isActive !== false).map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ─── Sticky Filter Bar ─── */}
      <div className="sticky top-0 z-30 border-b border-[#DDD8CF] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-screen-xl px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto">
            {/* Gender */}
            {category?.genderFilter !== 'none' && (
              <>
                <Chip label="All" active={activeGender === 'all'} onClick={() => setActiveGender('all')} />
                <Chip label="Men" active={activeGender === 'men'} onClick={() => setActiveGender('men')} />
                <Chip label="Women" active={activeGender === 'women'} onClick={() => setActiveGender('women')} />
                <span className="mx-1 h-5 w-px bg-[#DDD8CF]" />
              </>
            )}
            {/* Sizes */}
            {sizeOptions.length > 0 && sizeOptions.map((s) => (
              <Chip key={s} label={s} active={activeSize === s} onClick={() => setActiveSize(activeSize === s ? '' : s)} />
            ))}
            {/* Sort */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              className="ml-auto h-8 shrink-0 rounded-lg border border-[#DDD8CF] bg-white px-2 text-[11px] text-[#111111] outline-none"
            >
              <option value="featured">Sort: Featured</option>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
            </select>
          </div>

          {/* Tags row */}
          {tagOptions.length > 0 && (
            <div className="scrollbar-hide mt-2 flex gap-1.5 overflow-x-auto">
              <Chip label="All" active={!activeTag} onClick={() => setActiveTag('')} />
              {tagOptions.map((t) => (
                <Chip key={t} label={t} active={activeTag === t} onClick={() => setActiveTag(activeTag === t ? '' : t)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Product Count ─── */}
      <div className="mx-auto max-w-screen-xl px-4 pt-4 sm:px-6 lg:px-8">
        <p className="text-[12px] text-[#6B625A]">
          Showing {visibleProducts.length} of {filteredProducts.length} Products
        </p>
      </div>

      {/* ─── Product Grid ─── */}
      <div className="mx-auto max-w-screen-xl px-4 pt-3 pb-8 sm:px-6 lg:px-8">
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              {visibleProducts.map((product) => {
                const sz = product.sizes?.[0] || 'O/S';
                const cl = product.colors?.[0] || { name: 'Default', hex: '#111111' };
                const itemId = `${product.id}-${sz}-${cl.name.toLowerCase()}`;
                const qty = cartItems.find((i) => i.id === itemId)?.quantity || 0;
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                    onAddToCart={onAddToCart}
                    cartQty={qty}
                    cartItemId={itemId}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemoveItem={onRemoveItem}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={isWishlisted?.(product.id)}
                  />
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                  className="h-11 rounded-lg border border-[#111111] px-8 text-[13px] font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <PackageSearch size={32} className="text-[#6B625A]" />
            <p className="mt-4 text-[15px] font-semibold text-[#111111]">No products found</p>
            <p className="mt-1 text-[13px] text-[#6B625A]">Try changing filters or browse another category.</p>
            <button
              type="button"
              onClick={() => { setActiveSize(''); setActiveTag(''); setActiveGender('all'); }}
              className="mt-4 h-9 rounded-full border border-[#111111] px-5 text-[12px] font-semibold text-[#111111] transition hover:bg-[#111111] hover:text-white"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
