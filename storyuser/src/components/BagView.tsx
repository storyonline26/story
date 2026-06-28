import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Check,
  CreditCard,
  Edit3,
  LockKeyhole,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck
} from 'lucide-react';
import { Address, CartItem } from '../types';
import { calculateIndiaOrderTotals, formatINR } from '../utils/currency';

interface BagViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: (couponCode?: string) => void;
  addresses: Address[];
  selectedAddressId: string;
  onSelectAddress: (id: string) => void;
  onSaveAddress: (address: Address) => Promise<Address>;
  paymentMethod: 'online' | 'cod';
  onPaymentMethodChange: (method: 'online' | 'cod') => void;
  onlinePaymentEnabled: boolean;
  codEnabled: boolean;
  isLoggedIn: boolean;
  onLoginRedirect: () => void;
  isCheckingOut?: boolean;
  checkoutMessage?: string;
  checkoutError?: string;
  onValidateCoupon?: (code: string) => Promise<{ valid: boolean; discount?: number; message?: string }>;
}

const checkoutSteps = ['Bag', 'Delivery', 'Payment'];

const addressText = (address?: Address) => {
  if (!address) return [];
  return [
    address.street || address.line1,
    address.line2,
    [address.cityName || address.city, address.state, address.pincode].filter(Boolean).join(', '),
    address.country || 'India'
  ].filter(Boolean);
};

const addressDraftFrom = (address?: Address): Address => ({
  id: address?.id,
  label: address?.label || 'Home',
  fullName: address?.fullName || '',
  phone: address?.phone || '',
  street: address?.line1 || address?.street || '',
  line1: address?.line1 || address?.street || '',
  line2: address?.line2 || '',
  city: address?.city || '',
  cityName: address?.cityName || '',
  state: address?.state || '',
  pincode: address?.pincode || '',
  country: address?.country || 'India',
  isDefault: true
});

export const BagView: React.FC<BagViewProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onSaveAddress,
  paymentMethod,
  onPaymentMethodChange,
  onlinePaymentEnabled,
  codEnabled,
  isLoggedIn,
  onLoginRedirect,
  isCheckingOut = false,
  checkoutMessage = '',
  checkoutError = '',
  onValidateCoupon
}) => {
  const [couponCode, setCouponCode] = React.useState('');
  const [couponApplied, setCouponApplied] = React.useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = React.useState('');
  const [couponLoading, setCouponLoading] = React.useState(false);
  const subtotal = React.useMemo(() => (
    cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  ), [cartItems]);

  const { shipping, tax, total } = calculateIndiaOrderTotals(subtotal, couponApplied?.discount);
  const primaryAddress = addresses.find((address) => address.id === selectedAddressId) || addresses.find((address) => address.isDefault) || addresses[0];
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingRemaining = Math.max(0, 5000 - subtotal);
  const [deliveryEditorOpen, setDeliveryEditorOpen] = React.useState(false);
  const [addressDraft, setAddressDraft] = React.useState<Address>(() => addressDraftFrom(primaryAddress));
  const [addressSaving, setAddressSaving] = React.useState(false);
  const [addressError, setAddressError] = React.useState('');
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !onValidateCoupon) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const result = await onValidateCoupon(couponCode.trim().toUpperCase());
      if (result.valid && result.discount) {
        setCouponApplied({ code: couponCode.trim().toUpperCase(), discount: result.discount });
      } else {
        setCouponError(result.message || 'Invalid coupon code');
        setCouponApplied(null);
      }
    } catch {
      setCouponError('Could not validate coupon');
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponError('');
  };

  const noPaymentMethods = !onlinePaymentEnabled && !codEnabled;
  const checkoutBlocked = isCheckingOut || (isLoggedIn && (!primaryAddress || noPaymentMethods));
  const checkoutLabel = !primaryAddress
    ? 'Add delivery address'
    : noPaymentMethods
    ? 'Payment unavailable'
    : paymentMethod === 'cod'
    ? 'Place pay-on-delivery order'
    : 'Pay securely';

  const openAddressEditor = (address?: Address) => {
    setAddressDraft(addressDraftFrom(address));
    setAddressError('');
    setDeliveryEditorOpen(true);
  };

  const handleAddressField = (field: keyof Address, value: string) => {
    setAddressDraft(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'line1' ? { street: value } : {}),
      ...(field === 'cityName' || field === 'state' || field === 'pincode'
        ? {
            city: [
              field === 'cityName' ? value : prev.cityName,
              field === 'state' ? value : prev.state,
              field === 'pincode' ? value : prev.pincode
            ].filter(Boolean).join(', ')
          }
        : {})
    }));
  };

  const handleAddressSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddressSaving(true);
    setAddressError('');

    try {
      const saved = await onSaveAddress({
        ...addressDraft,
        street: addressDraft.line1 || addressDraft.street,
        country: addressDraft.country || 'India',
        isDefault: true
      });
      if (saved.id) onSelectAddress(saved.id);
      setDeliveryEditorOpen(false);
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : 'Could not save delivery address.');
    } finally {
      setAddressSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      id="bag-view-container"
      className="bg-[#f6f5f1] px-4 py-8 text-[#111111] sm:px-6 lg:px-10 lg:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-lg border border-[#dedbd2] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#6f6b62]">Checkout</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your bag</h1>
              <p className="mt-2 text-sm leading-6 text-[#6a665d]">
                {cartItems.length > 0 ? `${totalItems} item${totalItems === 1 ? '' : 's'} ready for secure payment.` : 'Add pieces to begin checkout.'}
              </p>
            </div>

            {cartItems.length > 0 && (
              <div className="grid grid-cols-3 overflow-hidden rounded-md border border-[#dedbd2]">
                {checkoutSteps.map((step, index) => {
                  const active = index === 0 || (isLoggedIn && index === 1) || isCheckingOut;
                  return (
                    <div key={step} className={`flex min-w-24 items-center justify-center gap-2 border-r border-[#dedbd2] px-3 py-3 font-mono text-[9px] uppercase tracking-widest last:border-r-0 ${active ? 'bg-[#111111] text-white' : 'bg-[#fbfaf7] text-[#6f6b62]'}`}>
                      {active ? <Check size={12} /> : <span>{index + 1}</span>}
                      {step}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        {cartItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#cfcac0] bg-white px-6 py-20 text-center" id="bag-empty-state">
            <ShoppingBag className="mx-auto text-[#111111]" size={30} strokeWidth={1.4} />
            <p className="mt-4 text-lg font-semibold text-[#111111]">Your bag is empty</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6a665d]">
              Add a piece from the STORY India collection before moving to checkout.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
            <section className="grid gap-6">
              {checkoutError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                  {checkoutError}
                </div>
              )}

              {isCheckingOut && (
                <div className="rounded-lg border border-[#111111] bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-[#111111]" />
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[#6f6b62]">Payment status</p>
                      <p className="mt-1 text-sm font-semibold text-[#111111]">{checkoutMessage || 'Preparing secure payment'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-lg border border-[#dedbd2] bg-white shadow-sm">
                <div className="border-b border-[#ece9e1] px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#6f6b62]">
                  Items
                </div>
                <div className="divide-y divide-[#ece9e1]">
                  {cartItems.map((item) => (
                    <article
                      key={item.id}
                      className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[120px_minmax(0,1fr)_auto]"
                      id={`bag-item-${item.id}`}
                    >
                      <div className="aspect-[3/4] overflow-hidden rounded-md bg-[#ece9e1]">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover grayscale transition duration-300 hover:grayscale-0"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-col gap-2">
                          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#111111]">
                            {item.product.name}
                          </h3>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-[#6f6b62]">
                            {item.selectedColor.name} / {item.selectedSize}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#6B625A]">
                            <Truck size={11} strokeWidth={1.5} className="text-[#111111]" />
                            Delivery by {new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </p>
                          <p className="font-mono text-xs font-semibold text-[#111111] sm:hidden">
                            {formatINR(item.product.price * item.quantity)}
                          </p>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <div className="flex h-10 items-center overflow-hidden rounded-md border border-[#111111] bg-white">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              disabled={isCheckingOut}
                              className="flex h-full w-10 items-center justify-center text-[#111111] transition hover:bg-[#f6f5f1] disabled:opacity-40"
                              title="Decrease quantity"
                            >
                              <Minus size={13} strokeWidth={1.7} />
                            </button>
                            <span className="flex h-full min-w-11 items-center justify-center border-x border-[#111111] font-mono text-xs font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              disabled={isCheckingOut}
                              className="flex h-full w-10 items-center justify-center text-[#111111] transition hover:bg-[#f6f5f1] disabled:opacity-40"
                              title="Increase quantity"
                            >
                              <Plus size={13} strokeWidth={1.7} />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            disabled={isCheckingOut}
                            className="inline-flex h-10 items-center gap-2 rounded-md border border-[#dedbd2] px-3 font-mono text-[9px] uppercase tracking-widest text-[#6f6b62] transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                          >
                            <Trash2 size={13} />
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="hidden text-right font-mono text-sm font-semibold text-[#111111] sm:block">
                        {formatINR(item.product.price * item.quantity)}
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard icon={Truck} title="Delivery">
                  {isLoggedIn && primaryAddress ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-sm leading-6 text-[#5f5b52]">
                          <p className="font-semibold text-[#111111]">{primaryAddress.fullName}</p>
                          {primaryAddress.phone && <p>{primaryAddress.phone}</p>}
                          {addressText(primaryAddress).map((line) => (
                            <p key={line}>{line}</p>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => openAddressEditor(primaryAddress)}
                          className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dedbd2] px-3 font-mono text-[9px] uppercase tracking-widest text-[#111111] transition hover:border-[#111111]"
                        >
                          <Edit3 size={13} />
                          Edit
                        </button>
                      </div>

                      {addresses.length > 1 && (
                        <div className="grid gap-2 border-t border-[#ece9e1] pt-4">
                          {addresses.map((address) => (
                            <button
                              key={address.id || address.street}
                              type="button"
                              onClick={() => address.id && onSelectAddress(address.id)}
                              className={`rounded-md border px-3 py-2 text-left text-xs transition ${
                                address.id === primaryAddress.id ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#dedbd2] bg-[#fbfaf7] text-[#5f5b52] hover:border-[#111111]'
                              }`}
                            >
                              <span className="font-semibold">{address.label || 'Address'}</span>
                              <span className="ml-2">{address.line1 || address.street}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => openAddressEditor()}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#dedbd2] px-4 font-mono text-[9px] uppercase tracking-widest text-[#111111] transition hover:border-[#111111]"
                      >
                        <Plus size={13} />
                        Add another address
                      </button>
                    </div>
                  ) : isLoggedIn ? (
                    <div className="space-y-4">
                      <p className="text-sm leading-6 text-[#6a665d]">
                        Add your delivery address before placing the order.
                      </p>
                      <button
                        type="button"
                        onClick={() => openAddressEditor()}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#111111] bg-[#111111] px-4 font-mono text-[9px] uppercase tracking-widest text-white transition hover:bg-black"
                      >
                        <Plus size={13} />
                        Add delivery address
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm leading-6 text-[#6a665d]">
                      Sign in to use saved India delivery details and payment tracking.
                    </p>
                  )}

                  {deliveryEditorOpen && isLoggedIn && (
                    <form onSubmit={handleAddressSubmit} className="mt-5 grid gap-3 border-t border-[#ece9e1] pt-5">
                      {addressError && (
                        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
                          {addressError}
                        </div>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <AddressField label="Full name" value={addressDraft.fullName} onChange={(value) => handleAddressField('fullName', value)} required />
                        <AddressField label="Phone" value={addressDraft.phone || ''} onChange={(value) => handleAddressField('phone', value)} required />
                      </div>
                      <AddressField label="Address line 1" value={addressDraft.line1 || addressDraft.street} onChange={(value) => handleAddressField('line1', value)} required />
                      <AddressField label="Address line 2" value={addressDraft.line2 || ''} onChange={(value) => handleAddressField('line2', value)} />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <AddressField label="City" value={addressDraft.cityName || ''} onChange={(value) => handleAddressField('cityName', value)} required />
                        <AddressField label="State" value={addressDraft.state || ''} onChange={(value) => handleAddressField('state', value)} required />
                        <AddressField label="Pincode" value={addressDraft.pincode || ''} onChange={(value) => handleAddressField('pincode', value)} required />
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="submit"
                          disabled={addressSaving}
                          className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-[#111111] px-4 font-mono text-[9px] uppercase tracking-widest text-white transition hover:bg-black disabled:opacity-60"
                        >
                          {addressSaving ? 'Saving address' : 'Save delivery address'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryEditorOpen(false)}
                          className="inline-flex h-10 items-center justify-center rounded-md border border-[#dedbd2] px-4 font-mono text-[9px] uppercase tracking-widest text-[#111111] transition hover:border-[#111111]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </InfoCard>

                <InfoCard icon={CreditCard} title="Payment">
                  <div className="space-y-3">
                    <PaymentOption
                      active={paymentMethod === 'online'}
                      disabled={!onlinePaymentEnabled}
                      title="Online payment"
                      body="UPI, cards, netbanking, and wallets through Razorpay."
                      onClick={() => onPaymentMethodChange('online')}
                    />
                    <PaymentOption
                      active={paymentMethod === 'cod'}
                      disabled={!codEnabled}
                      title="Pay on delivery"
                      body="Place the order now and pay when the package arrives."
                      onClick={() => onPaymentMethodChange('cod')}
                    />
                    {noPaymentMethods && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                        Checkout payments are temporarily unavailable.
                      </div>
                    )}
                  </div>
                </InfoCard>
              </div>
            </section>

            <aside className="lg:sticky lg:top-24 lg:self-start" id="bag-summary-sidebar">
              <div className="rounded-lg border border-[#111111] bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#6f6b62]">Order review</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#111111]">Summary</h2>
                  </div>
                  <LockKeyhole size={18} strokeWidth={1.5} />
                </div>

                <div className="mt-5 space-y-3 rounded-lg border border-[#ece9e1] bg-[#fbfaf7] p-4 font-mono text-[10px] uppercase tracking-widest text-[#6f6b62]">
                  <SummaryRow label="Subtotal" value={formatINR(subtotal)} />
                  {couponApplied && <SummaryRow label={`Coupon (${couponApplied.code})`} value={`-${formatINR(couponApplied.discount)}`} highlight />}
                  <SummaryRow label="Shipping" value={shipping === 0 ? 'Complimentary' : formatINR(shipping)} highlight={shipping === 0} />
                  <SummaryRow label="GST (18%)" value={formatINR(tax)} />
                </div>

                {/* Coupon Input */}
                <div className="mt-4 rounded-lg border border-[#ece9e1] bg-[#fbfaf7] p-4">
                  {couponApplied ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-600" />
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-700">{couponApplied.code} applied</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="font-mono text-[9px] uppercase tracking-widest text-red-600 transition hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[#6f6b62]">Have a coupon?</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                          placeholder="ENTER CODE"
                          className="h-9 flex-1 rounded-md border border-[#dedbd2] bg-white px-3 font-mono text-[10px] uppercase tracking-widest text-[#111111] outline-none transition placeholder:text-[#b5b0a6] focus:border-[#111111]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim() || couponLoading}
                          className="h-9 rounded-md bg-[#111111] px-4 font-mono text-[9px] uppercase tracking-widest text-white transition hover:bg-black disabled:opacity-50"
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                      {couponError && <p className="mt-2 text-[10px] normal-case tracking-normal text-red-600">{couponError}</p>}
                    </div>
                  )}
                </div>

                {freeShippingRemaining > 0 ? (
                  <div className="mt-4 rounded-lg border border-[#e8d58f] bg-[#fff9e6] p-4 text-sm leading-6 text-[#7f6000]">
                    Add {formatINR(freeShippingRemaining)} more for complimentary delivery.
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
                    Complimentary delivery applied.
                  </div>
                )}

                <div className="mt-5 flex justify-between gap-4 border-t border-[#111111] pt-5 text-lg font-semibold uppercase text-[#111111]">
                  <span>Total</span>
                  <span>{formatINR(total)}</span>
                </div>

                {(couponApplied || shipping === 0) && (
                  <div className="mt-3 rounded-md bg-emerald-50 px-4 py-2.5 text-center text-[12px] font-semibold text-emerald-700">
                    🎉 You save {formatINR((couponApplied?.discount || 0) + (subtotal >= 5000 ? 149 : 0))} on this order
                  </div>
                )}

                {isLoggedIn ? (
                  <button
                    onClick={() => onCheckout(couponApplied?.code)}
                    disabled={checkoutBlocked}
                    className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-md border border-[#111111] bg-[#111111] px-5 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-70"
                    id="checkout-proceed-btn"
                  >
                    {isCheckingOut ? (checkoutMessage || 'Opening payment') : checkoutLabel}
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={onLoginRedirect}
                    className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-md border border-[#111111] bg-[#111111] px-5 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-black"
                    id="checkout-signin-btn"
                  >
                    Sign in to checkout
                    <ArrowRight size={14} />
                  </button>
                )}

                <div className="mt-5 grid gap-3 border-t border-[#ece9e1] pt-5">
                  <TrustLine icon={ShieldCheck} text="100% authentic products" />
                  <TrustLine icon={LockKeyhole} text="Secure Razorpay checkout" />
                  <TrustLine icon={Truck} text="Tracked India delivery" />
                  <TrustLine icon={CreditCard} text="UPI, Cards, Netbanking, Wallets" />
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#dedbd2] bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#6f6b62]">Total</p>
              <p className="text-base font-semibold text-[#111111]">{formatINR(total)}</p>
            </div>
            {isLoggedIn ? (
              <button
                onClick={() => onCheckout(couponApplied?.code)}
                disabled={checkoutBlocked}
                className="h-12 rounded-md bg-[#111111] px-5 font-mono text-[10px] uppercase tracking-widest text-white disabled:cursor-wait disabled:opacity-70"
              >
                {isCheckingOut ? 'Processing' : !primaryAddress ? 'Add address' : noPaymentMethods ? 'Unavailable' : paymentMethod === 'cod' ? 'Place order' : 'Pay now'}
              </button>
            ) : (
              <button
                onClick={onLoginRedirect}
                className="h-12 rounded-md bg-[#111111] px-5 font-mono text-[10px] uppercase tracking-widest text-white"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

function InfoCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#dedbd2] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#6f6b62]">{title}</p>
        <Icon size={16} strokeWidth={1.5} />
      </div>
      {children}
    </div>
  );
}

function AddressField({
  label,
  value,
  onChange,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[9px] uppercase tracking-widest text-[#6f6b62]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-1 h-10 w-full rounded-md border border-[#dedbd2] bg-[#fbfaf7] px-3 text-sm text-[#111111] outline-none transition focus:border-[#111111] focus:bg-white"
      />
    </label>
  );
}

function PaymentOption({
  active,
  disabled,
  title,
  body,
  onClick
}: {
  active: boolean;
  disabled: boolean;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-md border p-3 text-left transition ${
        active ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#dedbd2] bg-[#fbfaf7] text-[#111111] hover:border-[#111111]'
      } disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-[#dedbd2]`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest">{title}</span>
        {active && <Check size={14} />}
      </span>
      <span className={`mt-2 block text-xs leading-5 ${active ? 'text-white/70' : 'text-[#6a665d]'}`}>
        {disabled ? 'Disabled by store admin.' : body}
      </span>
    </button>
  );
}

function SummaryRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className={`font-semibold ${highlight ? 'text-emerald-700' : 'text-[#111111]'}`}>{value}</span>
    </div>
  );
}

function TrustLine({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 text-left font-mono text-[9px] uppercase tracking-widest text-[#6f6b62]">
      <Icon size={13} strokeWidth={1.5} />
      <span>{text}</span>
    </div>
  );
}
