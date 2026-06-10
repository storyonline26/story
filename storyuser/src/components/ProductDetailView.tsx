import React from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Minus, Plus, ShoppingBag, Truck, RotateCcw, PackageSearch } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, ColorOption } from '../types';
import { PRODUCTS } from '../data';
import { formatINR } from '../utils/currency';

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

  // Get real cart quantity for this product + size + color combo
  const cartItemId = `${product.id}-${selectedSize || 'O/S'}-${selectedColor.name.toLowerCase()}`;
  const cartItem = cartItems.find((item) => item.id === cartItemId);
  const cartQty = cartItem?.quantity || 0;

  // Only show real product images — no unrelated fallbacks
  const gallery = React.useMemo(() => {
    const images: string[] = [];
    if (product.image) images.push(product.image);
    if (product.listImages?.length) {
      product.listImages.forEach((img) => { if (img && !images.includes(img)) images.push(img); });
    }
    if (product.secondaryImage && !images.includes(product.secondaryImage)) {
      images.push(product.secondaryImage);
    }
    return images.length > 0 ? images : [];
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

  const relatedProducts = React.useMemo(() => {
    const source = products?.length ? products : PRODUCTS;
    return source
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 3);
  }, [product, products]);

  const toggleAccordion = (key: string) => setExpandedSection(expandedSection === key ? null : key);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-[#F8F6F1] pb-16"
      id="product-detail-view-container"
    >
      <div className="mx-auto max-w-[1280px] px-5 pt-5 sm:px-6 lg:px-8">
        {/* Back nav */}
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-[13px] text-[#6B625A] transition hover:text-[#111111]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back
        </button>

        {/* Main grid: gallery left, info right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">

          {/* Gallery */}
          <div className="space-y-3" id="detail-images-rack">
            {gallery.length > 0 ? (
              <>
                <div className="overflow-hidden rounded-lg border border-[#DDD8CF] bg-[#EFECE6]">
                  <img
                    src={gallery[activeImageIdx]}
                    alt={product.name}
                    className="w-full object-cover object-center"
                    style={{ maxHeight: '70vh', aspectRatio: '4/5' }}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                {gallery.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {gallery.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIdx(idx)}
                        className={`h-16 w-14 shrink-0 overflow-hidden rounded border transition ${
                          idx === activeImageIdx ? 'border-[#111111]' : 'border-[#DDD8CF] hover:border-[#111111]'
                        }`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-[#DDD8CF] bg-[#EFECE6]" style={{ aspectRatio: '4/5', maxHeight: '70vh' }}>
                <PackageSearch size={32} className="text-[#6B625A]" />
              </div>
            )}
          </div>

          {/* Product info - sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start" id="detail-options-panel">
            <div className="space-y-6">

              {/* Meta + Title + Price */}
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#6B625A]">{product.category}</p>
                <h1 className="mt-2 font-display text-3xl font-bold text-[#111111] sm:text-4xl">{product.name}</h1>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-[#111111]">{formatINR(product.price)}</span>
                  {hasDiscount && (
                    <>
                      <span className="text-[15px] text-[#6B625A] line-through">{formatINR(product.originalPrice!)}</span>
                      <span className="rounded bg-[#111111] px-2 py-0.5 text-[11px] font-semibold text-white">{discountPercent}% OFF</span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-[15px] leading-relaxed text-[#6B625A]">{product.description}</p>
              )}

              {/* Color selector */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <p className="mb-3 text-[12px] font-medium text-[#111111]">
                    Color: <span className="text-[#6B625A]">{selectedColor.name}</span>
                  </p>
                  <div className="flex gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`h-9 w-9 rounded-full border-2 transition ${
                          selectedColor.name === c.name ? 'border-[#111111]' : 'border-[#DDD8CF] hover:border-[#111111]'
                        }`}
                        title={c.name}
                      >
                        <span className="block h-full w-full rounded-full" style={{ backgroundColor: c.hex }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[12px] font-medium text-[#111111]">
                      Size: <span className="text-[#6B625A]">{selectedSize || 'Select'}</span>
                    </p>
                    <button type="button" className="text-[12px] text-[#6B625A] underline transition hover:text-[#111111]">
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => { setSelectedSize(s); setSizeError(false); }}
                        className={`h-11 rounded border text-[13px] font-medium transition ${
                          selectedSize === s
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#DDD8CF] bg-white text-[#111111] hover:border-[#111111]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {sizeError && (
                    <p className="mt-2 text-[13px] font-medium text-red-600">Please select a size.</p>
                  )}
                </div>
              )}

              {/* Delivery + returns notes */}
              <div className="flex flex-col gap-3 rounded-lg border border-[#DDD8CF] bg-white p-4">
                <div className="flex items-center gap-3 text-[13px] text-[#6B625A]">
                  <Truck size={16} strokeWidth={1.5} className="text-[#111111]" />
                  Delivery in 4–7 business days across India
                </div>
                <div className="flex items-center gap-3 text-[13px] text-[#6B625A]">
                  <RotateCcw size={16} strokeWidth={1.5} className="text-[#111111]" />
                  Easy returns & exchanges within 7 days
                </div>
              </div>

              {/* Add to Bag / Quantity stepper */}
              <div>
                {cartQty === 0 ? (
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="flex h-14 w-full items-center justify-center gap-3 bg-[#111111] text-[14px] font-semibold tracking-wide text-white transition hover:bg-black"
                    id="add-to-cart-action-btn"
                  >
                    <ShoppingBag size={18} strokeWidth={1.6} />
                    Add to Bag
                  </button>
                ) : (
                  <div className="flex h-14 items-center overflow-hidden border border-[#111111]">
                    <button
                      type="button"
                      onClick={() => cartQty === 1 ? onRemoveItem(cartItemId) : onUpdateQuantity(cartItemId, -1)}
                      className="flex h-full w-14 items-center justify-center border-r border-[#DDD8CF] text-[#111111] transition hover:bg-[#EFECE6]"
                    >
                      <Minus size={18} />
                    </button>
                    <div className="flex flex-1 items-center justify-center gap-2 text-[15px] font-semibold text-[#111111]">
                      <ShoppingBag size={16} /> {cartQty} in Bag
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(cartItemId, 1)}
                      className="flex h-full w-14 items-center justify-center border-l border-[#DDD8CF] text-[#111111] transition hover:bg-[#EFECE6]"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Accordion */}
              <div className="divide-y divide-[#DDD8CF] border-y border-[#DDD8CF]">
                <AccordionItem
                  title="Product Details"
                  isOpen={expandedSection === 'details'}
                  onToggle={() => toggleAccordion('details')}
                >
                  {product.details ? (
                    <ul className="list-disc space-y-1.5 pl-4 text-[14px] leading-relaxed text-[#6B625A]">
                      {product.details.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="text-[14px] leading-relaxed text-[#6B625A]">Premium construction with attention to fit and finish.</p>
                  )}
                </AccordionItem>

                <AccordionItem
                  title="Fabric & Care"
                  isOpen={expandedSection === 'fabric'}
                  onToggle={() => toggleAccordion('fabric')}
                >
                  <div className="space-y-3 text-[14px] leading-relaxed text-[#6B625A]">
                    {product.composition && <p><span className="font-medium text-[#111111]">Composition:</span> {product.composition}</p>}
                    {product.care && <p><span className="font-medium text-[#111111]">Care:</span> {product.care}</p>}
                    {!product.composition && !product.care && <p>Premium materials. Dry clean recommended.</p>}
                  </div>
                </AccordionItem>

                <AccordionItem
                  title="Delivery & Returns"
                  isOpen={expandedSection === 'delivery'}
                  onToggle={() => toggleAccordion('delivery')}
                >
                  <div className="space-y-2 text-[14px] leading-relaxed text-[#6B625A]">
                    <p>Standard delivery: 4–7 business days across India.</p>
                    <p>Free shipping on orders above ₹5,000.</p>
                    <p>Returns accepted within 7 days of delivery for unused items with tags.</p>
                  </div>
                </AccordionItem>
              </div>

            </div>
          </div>
        </div>

        {/* Complete the Look */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-[#DDD8CF] pt-12">
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.15em] text-[#6B625A]">You may also like</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-[#111111]">Complete the Look</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {relatedProducts.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onSelectProduct(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="group flex items-center gap-4 rounded-lg border border-[#DDD8CF] bg-white p-3 text-left transition hover:border-[#111111]"
                >
                  <div className="h-24 w-20 shrink-0 overflow-hidden rounded bg-[#EFECE6]">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center"><PackageSearch size={18} className="text-[#6B625A]" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wide text-[#6B625A]">{item.category}</p>
                    <h4 className="mt-1 truncate text-[14px] font-semibold text-[#111111]">{item.name}</h4>
                    <p className="mt-1 text-[14px] font-bold text-[#111111]">{formatINR(item.price)}</p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-[#DDD8CF] transition group-hover:text-[#111111]" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
};

function AccordionItem({ title, isOpen, onToggle, children }: { title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="py-4">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between text-left">
        <span className="text-[14px] font-semibold text-[#111111]">{title}</span>
        {isOpen ? <ChevronUp size={16} className="text-[#6B625A]" /> : <ChevronDown size={16} className="text-[#6B625A]" />}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}
