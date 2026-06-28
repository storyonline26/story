import React from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Heart, Minus, Plus, ShoppingBag, Truck, RotateCcw, PackageSearch, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, ColorOption } from '../types';
import { formatINR } from '../utils/currency';
import { useRecentlyViewed } from '../utils/useShopFeatures';

interface ProductDetailViewProps {
  product: Product;
  onAddToCart: (product: Product, size: string, color: ColorOption) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  cartItems: Array<{ id: string; product: Product; selectedSize: string; selectedColor: ColorOption; quantity: number }>;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  products?: Product[];
}

const getDeliveryDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  cartItems,
  onBack,
  onSelectProduct,
  products
}) => {
  const [selectedSize, setSelectedSize] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState<ColorOption>(
    product.colors?.[0] || { name: 'Default', hex: '#111111' }
  );
  const [expandedSection, setExpandedSection] = React.useState<string | null>('details');
  const [sizeError, setSizeError] = React.useState(false);
  const [activeImageIdx, setActiveImageIdx] = React.useState(0);
  const touchStartX = React.useRef(0);

  const cartItemId = `${product.id}-${selectedSize || 'O/S'}-${selectedColor.name.toLowerCase()}`;
  const cartItem = cartItems.find((item) => item.id === cartItemId);
  const cartQty = cartItem?.quantity || 0;

  const gallery = React.useMemo(() => {
    const images: string[] = [];
    if (product.image) images.push(product.image);
    if (product.listImages?.length) {
      product.listImages.forEach((img) => { if (img && !images.includes(img)) images.push(img); });
    }
    if (product.secondaryImage && !images.includes(product.secondaryImage)) {
      images.push(product.secondaryImage);
    }
    return images;
  }, [product]);

  React.useEffect(() => {
    setSelectedSize('');
    setSelectedColor(product.colors?.[0] || { name: 'Default', hex: '#111111' });
    setSizeError(false);
    setActiveImageIdx(0);
  }, [product]);

  const handleAdd = () => {
    if (product.sizes?.length && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    onAddToCart(product, selectedSize || 'O/S', selectedColor);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;
  const lowStock = (product.stock ?? 999) < 10 && (product.stock ?? 999) > 0;

  const { recentIds } = useRecentlyViewed();
  const relatedProducts = React.useMemo(() => {
    const source = products || [];
    return source.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  }, [product, products]);
  const recentProducts = React.useMemo(() => {
    const source = products || [];
    return recentIds
      .filter((id) => id !== product.id)
      .map((id) => source.find((p) => p.id === id))
      .filter(Boolean)
      .slice(0, 6) as Product[];
  }, [recentIds, product.id, products]);

  const toggleAccordion = (key: string) => setExpandedSection(expandedSection === key ? null : key);

  // Swipe handlers for mobile gallery
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50 && gallery.length > 1) {
      setActiveImageIdx((c) => diff > 0 ? (c + 1) % gallery.length : (c - 1 + gallery.length) % gallery.length);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white pb-20 lg:pb-8"
      id="product-detail-view-container"
    >
      <div className="mx-auto max-w-[1200px] px-4 pt-3 sm:px-6 lg:px-8 lg:pt-6">
        {/* Back */}
        <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-[#6B625A] transition hover:text-[#111111]">
          <ArrowLeft size={15} strokeWidth={1.6} /> Back
        </button>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">

          {/* Gallery */}
          <div className="lg:sticky lg:top-20 lg:self-start" id="detail-images-rack">
            {gallery.length > 0 ? (
              <div className="space-y-2">
                <div
                  className="relative overflow-hidden rounded-lg bg-[#EFECE6]"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={gallery[activeImageIdx]}
                    alt={product.name}
                    className="w-full object-cover object-[center_top]"
                    style={{ aspectRatio: '4/5', maxHeight: '60vh' }}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  {/* Wishlist */}
                  <button type="button" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#6B625A] shadow transition hover:text-red-500">
                    <Heart size={18} strokeWidth={1.5} />
                  </button>
                  {/* Dots */}
                  {gallery.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {gallery.map((_, i) => (
                        <span key={i} className={`h-1.5 rounded-full transition-all ${i === activeImageIdx ? 'w-5 bg-[#111111]' : 'w-1.5 bg-[#111111]/30'}`} />
                      ))}
                    </div>
                  )}
                </div>
                {/* Thumbnails (desktop) */}
                {gallery.length > 1 && (
                  <div className="hidden gap-2 lg:flex">
                    {gallery.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIdx(idx)}
                        className={`h-16 w-14 shrink-0 overflow-hidden rounded border transition ${idx === activeImageIdx ? 'border-[#111111]' : 'border-[#DDD8CF] hover:border-[#111111]'}`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg bg-[#EFECE6]" style={{ aspectRatio: '4/5' }}>
                <PackageSearch size={32} className="text-[#6B625A]" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div id="detail-options-panel" className="space-y-5">
            {/* Category */}
            <p className="text-[11px] uppercase tracking-[0.15em] text-[#6B625A]">{product.category}</p>

            {/* Name */}
            <h1 className="font-display text-2xl font-bold text-[#111111] sm:text-3xl">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-2.5">
              <span className="text-xl font-bold text-[#111111]">{formatINR(product.price)}</span>
              {hasDiscount && (
                <>
                  <span className="text-[14px] text-[#6B625A] line-through">{formatINR(product.originalPrice!)}</span>
                  <span className="rounded bg-green-100 px-1.5 py-0.5 text-[11px] font-semibold text-green-700">{discountPercent}% OFF</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[#6B625A]">Inclusive of all taxes</p>

            {/* Urgency: Low stock */}
            {lowStock && (
              <div className="flex items-center gap-2 text-[13px] font-medium text-orange-600">
                <Zap size={14} strokeWidth={2} />
                Only {product.stock} left in stock
              </div>
            )}

            {/* Delivery estimate */}
            <div className="flex items-center gap-2 text-[13px] text-[#6B625A]">
              <Truck size={15} strokeWidth={1.5} className="text-[#111111]" />
              Delivery by <span className="font-semibold text-[#111111]">{getDeliveryDate()}</span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-[14px] leading-relaxed text-[#6B625A]">{product.description}</p>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="mb-2 text-[12px] font-medium text-[#111111]">Color: <span className="text-[#6B625A]">{selectedColor.name}</span></p>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button key={c.name} type="button" onClick={() => setSelectedColor(c)} title={c.name}
                      className={`h-8 w-8 rounded-full border-2 transition ${selectedColor.name === c.name ? 'border-[#111111]' : 'border-[#DDD8CF] hover:border-[#111111]'}`}
                    >
                      <span className="block h-full w-full rounded-full" style={{ backgroundColor: c.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12px] font-medium text-[#111111]">Size: <span className="text-[#6B625A]">{selectedSize || 'Select'}</span></p>
                  <button type="button" className="text-[12px] font-medium text-[#111111] underline underline-offset-2">Size Chart</button>
                </div>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                  {product.sizes.map((s) => {
                    const qty = product.sizeStock?.[s];
                    const oos = qty !== undefined && qty !== null && qty <= 0;
                    return (
                      <button key={s} type="button" disabled={oos}
                        onClick={() => { if (!oos) { setSelectedSize(s); setSizeError(false); } }}
                        className={`h-10 rounded border text-[12px] font-medium transition ${
                          oos ? 'border-[#EEE] text-[#CCC] line-through cursor-not-allowed'
                            : selectedSize === s ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#DDD8CF] text-[#111111] hover:border-[#111111]'
                        }`}
                      >{s}</button>
                    );
                  })}
                </div>
                {sizeError && <p className="mt-2 text-[12px] font-medium text-red-600">Please select a size</p>}
              </div>
            )}

            {/* Add to Bag (desktop) */}
            <div className="hidden lg:block">
              {cartQty === 0 ? (
                <button type="button" onClick={handleAdd} id="add-to-cart-action-btn"
                  className="flex h-14 w-full items-center justify-center gap-2 bg-[#111111] text-[14px] font-semibold text-white transition hover:bg-black"
                >
                  <ShoppingBag size={18} /> Add to Bag
                </button>
              ) : (
                <div className="flex h-14 items-center border border-[#111111]">
                  <button type="button" onClick={() => cartQty === 1 ? onRemoveItem(cartItemId) : onUpdateQuantity(cartItemId, -1)}
                    className="flex h-full w-14 items-center justify-center border-r border-[#DDD8CF] hover:bg-[#F8F6F1]"><Minus size={18} /></button>
                  <div className="flex flex-1 items-center justify-center gap-2 font-semibold"><ShoppingBag size={16} /> {cartQty} in Bag</div>
                  <button type="button" onClick={() => onUpdateQuantity(cartItemId, 1)}
                    className="flex h-full w-14 items-center justify-center border-l border-[#DDD8CF] hover:bg-[#F8F6F1]"><Plus size={18} /></button>
                </div>
              )}
            </div>

            {/* Delivery & Returns box */}
            <div className="rounded-lg border border-[#DDD8CF] bg-[#F8F6F1] p-4 space-y-2.5">
              <div className="flex items-center gap-2.5 text-[13px] text-[#6B625A]">
                <Truck size={15} className="text-[#111111]" /> Free delivery on orders above ₹5,000
              </div>
              <div className="flex items-center gap-2.5 text-[13px] text-[#6B625A]">
                <RotateCcw size={15} className="text-[#111111]" /> Easy returns & exchanges within 7 days
              </div>
            </div>

            {/* Accordions */}
            <div className="divide-y divide-[#DDD8CF] border-y border-[#DDD8CF]">
              <Accordion title="Product Details" isOpen={expandedSection === 'details'} onToggle={() => toggleAccordion('details')}>
                {product.details ? (
                  <ul className="list-disc space-y-1 pl-4 text-[13px] text-[#6B625A]">{product.details.map((d, i) => <li key={i}>{d}</li>)}</ul>
                ) : <p className="text-[13px] text-[#6B625A]">Premium construction with attention to fit and finish.</p>}
              </Accordion>
              <Accordion title="Fabric & Care" isOpen={expandedSection === 'fabric'} onToggle={() => toggleAccordion('fabric')}>
                <div className="space-y-2 text-[13px] text-[#6B625A]">
                  {product.composition && <p><b className="text-[#111111]">Composition:</b> {product.composition}</p>}
                  {product.care && <p><b className="text-[#111111]">Care:</b> {product.care}</p>}
                  {!product.composition && !product.care && <p>Dry clean recommended.</p>}
                </div>
              </Accordion>
              <Accordion title="Delivery & Returns" isOpen={expandedSection === 'delivery'} onToggle={() => toggleAccordion('delivery')}>
                <div className="space-y-1.5 text-[13px] text-[#6B625A]">
                  <p>Standard delivery: 4–7 business days.</p>
                  <p>Free shipping on orders above ₹5,000.</p>
                  <p>Returns within 7 days for unused items with tags.</p>
                </div>
              </Accordion>
            </div>
          </div>
        </div>

        {/* You Might Also Like */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 border-t border-[#DDD8CF] pt-8">
            <h3 className="text-[11px] uppercase tracking-[0.15em] text-[#6B625A]">You might also like</h3>
            <h2 className="mt-1 font-display text-xl font-bold text-[#111111]">Complete the Look</h2>
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
              {relatedProducts.map((item) => (
                <button key={item.id} type="button" onClick={() => { onSelectProduct(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="group w-[160px] shrink-0 overflow-hidden rounded-lg border border-[#DDD8CF] bg-white text-left transition hover:border-[#111111] lg:w-auto"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#EFECE6]">
                    {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover transition group-hover:scale-105" referrerPolicy="no-referrer" />}
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-[12px] font-semibold text-[#111111]">{item.name}</p>
                    <p className="mt-0.5 text-[13px] font-bold text-[#111111]">{formatINR(item.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        {recentProducts.length > 0 && (
          <section className="mt-10 border-t border-[#DDD8CF] pt-8">
            <h3 className="text-[11px] uppercase tracking-[0.15em] text-[#6B625A]">Recently viewed</h3>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {recentProducts.map((item) => (
                <button key={item.id} type="button" onClick={() => { onSelectProduct(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="group w-[130px] shrink-0 overflow-hidden rounded-lg border border-[#DDD8CF] bg-white text-left transition hover:border-[#111111]"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#EFECE6]">
                    {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-[11px] font-semibold text-[#111111]">{item.name}</p>
                    <p className="mt-0.5 text-[12px] font-bold text-[#111111]">{formatINR(item.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ─── Mobile Sticky Bottom Bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#DDD8CF] bg-white px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:hidden">
        <div className="mx-auto flex max-w-screen-sm items-center gap-3">
          <div className="min-w-0">
            <p className="text-[16px] font-bold text-[#111111]">{formatINR(product.price)}</p>
            {hasDiscount && <p className="text-[11px] text-[#6B625A] line-through">{formatINR(product.originalPrice!)}</p>}
          </div>
          <div className="flex-1">
            {cartQty === 0 ? (
              <button type="button" onClick={handleAdd} id="add-to-cart-action-btn"
                className="flex h-12 w-full items-center justify-center gap-2 bg-[#111111] text-[13px] font-semibold text-white"
              >
                <ShoppingBag size={16} /> Add to Bag
              </button>
            ) : (
              <div className="flex h-12 items-center border border-[#111111]">
                <button type="button" onClick={() => cartQty === 1 ? onRemoveItem(cartItemId) : onUpdateQuantity(cartItemId, -1)}
                  className="flex h-full w-12 items-center justify-center hover:bg-[#F8F6F1]"><Minus size={16} /></button>
                <span className="flex-1 text-center text-[14px] font-bold">{cartQty}</span>
                <button type="button" onClick={() => onUpdateQuantity(cartItemId, 1)}
                  className="flex h-full w-12 items-center justify-center hover:bg-[#F8F6F1]"><Plus size={16} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function Accordion({ title, isOpen, onToggle, children }: { title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="py-3.5">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between">
        <span className="text-[13px] font-semibold text-[#111111]">{title}</span>
        {isOpen ? <ChevronUp size={15} className="text-[#6B625A]" /> : <ChevronDown size={15} className="text-[#6B625A]" />}
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
}
