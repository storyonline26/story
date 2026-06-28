import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Download,
  Globe,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  PackageCheck,
  Printer,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Address, Order, CartItem } from '../types';
import { formatINR } from '../utils/currency';

interface SettingsViewProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void | Promise<void>;
  addresses: Address[];
  setAddresses: (addresses: Address[]) => void;
  orders?: Order[];
  onSignOut?: () => void;
  initialTab?: SettingsTab;
}
type SettingsTab = 'orders' | 'addresses' | 'profile' | 'wishlist';

const tabs: Array<{ id: SettingsTab; label: string; icon: React.ElementType }> = [
  { id: 'orders', label: 'Orders', icon: PackageCheck },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'wishlist', label: 'Wishlist', icon: ShoppingBag }
];

const statusSteps = ['confirmed', 'processing', 'shipped', 'delivered'];

const formatDate = (value?: string) => {
  if (!value) return 'Pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Pending';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const titleCase = (value?: string) =>
  (value || 'processing')
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
    .join(' ');

const orderNumber = (id: string) => {
  if (/^ST-/i.test(id)) return id;
  const clean = id.replace(/[^a-z0-9]/gi, '').toUpperCase();
  return `ST-${clean.slice(-8) || 'STORY'}`;
};

const addressLines = (address?: Address) => {
  if (!address) return ['No saved address'];

  const cityLine = [
    address.cityName || address.city,
    address.state,
    address.pincode
  ].filter(Boolean).join(', ');

  return [
    address.street || address.line1,
    address.line2,
    cityLine,
    address.country || 'India'
  ].filter(Boolean) as string[];
};

const statusIndex = (status?: string) => {
  const normalized = (status || 'processing').toLowerCase();
  if (normalized.includes('cancel')) return -1;
  const index = statusSteps.findIndex((step) => normalized.includes(step));
  return index >= 0 ? index : 1;
};

const itemTotal = (item: CartItem) => item.product.price * item.quantity;

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  setUserProfile,
  addresses,
  setAddresses,
  orders = [],
  onSignOut,
  initialTab = 'profile'
}) => {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>(initialTab);
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);
  const [trackingOrder, setTrackingOrder] = React.useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = React.useState<Order | null>(null);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isEditingAddress, setIsEditingAddress] = React.useState(false);
  const [saveState, setSaveState] = React.useState<'idle' | 'saving' | 'saved'>('idle');
  const [resetNotice, setResetNotice] = React.useState('');

  const primaryAddress = React.useMemo(
    () => addresses.find((address) => address.isDefault) || addresses[0],
    [addresses]
  );

  const selectedOrder = React.useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim() || 'STORY Client';
  const deliveredOrders = orders.filter((order) => (order.status || '').toLowerCase().includes('delivered')).length;
  const activeOrders = orders.filter((order) => !['delivered', 'cancelled'].some((status) => (order.status || '').toLowerCase().includes(status))).length;
  const totalSpend = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  const [formFirstName, setFormFirstName] = React.useState(userProfile.firstName);
  const [formLastName, setFormLastName] = React.useState(userProfile.lastName);
  const [formEmail, setFormEmail] = React.useState(userProfile.email);
  const [formPhone, setFormPhone] = React.useState(userProfile.phone);
  const [addressName, setAddressName] = React.useState(primaryAddress?.fullName || fullName);
  const [addressStreet, setAddressStreet] = React.useState(primaryAddress?.street || primaryAddress?.line1 || '');
  const [addressCity, setAddressCity] = React.useState(primaryAddress?.city || '');
  const [addressCountry, setAddressCountry] = React.useState(primaryAddress?.country || 'India');

  React.useEffect(() => {
    setFormFirstName(userProfile.firstName);
    setFormLastName(userProfile.lastName);
    setFormEmail(userProfile.email);
    setFormPhone(userProfile.phone);
  }, [userProfile]);

  React.useEffect(() => {
    setActiveTab(initialTab);
    setSelectedOrderId(null);
  }, [initialTab]);

  React.useEffect(() => {
    setAddressName(primaryAddress?.fullName || fullName);
    setAddressStreet(primaryAddress?.street || primaryAddress?.line1 || '');
    setAddressCity(primaryAddress?.city || '');
    setAddressCountry(primaryAddress?.country || 'India');
  }, [fullName, primaryAddress]);

  const saveProfile = async () => {
    setSaveState('saving');
    await setUserProfile({
      ...userProfile,
      firstName: formFirstName.trim(),
      lastName: formLastName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim()
    });
    setIsEditingProfile(false);
    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 1800);
  };

  const saveAddress = () => {
    const nextAddress: Address = {
      ...primaryAddress,
      fullName: addressName.trim() || fullName,
      street: addressStreet.trim(),
      city: addressCity.trim(),
      country: addressCountry.trim() || 'India',
      isDefault: true
    };

    const remaining = addresses.filter((address) => address.id !== primaryAddress?.id);
    setAddresses([nextAddress, ...remaining]);
    setIsEditingAddress(false);
  };

  const saveNewsletter = async () => {
    await setUserProfile({
      ...userProfile,
      newsletter: !userProfile.newsletter
    });
  };

  const saveLanguage = async (language: string) => {
    await setUserProfile({
      ...userProfile,
      language
    });
  };

  const openOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setActiveTab('orders');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      id="settings-view-container"
      className="bg-[#F8F6F1] px-4 py-8 text-[#111111] sm:px-6 lg:px-8 lg:py-12"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
        <header className="grid gap-4 rounded-lg border border-[#DDD8CF] bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-[#6B625A]">Account</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] sm:text-3xl">
              Welcome back, {userProfile.firstName || 'there'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B625A]">
              {userProfile.email || 'No email added'}{userProfile.phone ? ` / ${userProfile.phone}` : ''}
            </p>
          </div>
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#111111] px-4 font-mono text-[10px] uppercase tracking-widest text-[#111111] transition hover:bg-[#111111] hover:text-white"
              id="sidebar-signout-btn"
            >
              <LogOut size={14} strokeWidth={1.7} />
              Sign out
            </button>
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="scrollbar-hide flex gap-1 overflow-x-auto rounded-lg border border-[#DDD8CF] bg-white p-1 shadow-sm lg:flex-col lg:gap-0 lg:overflow-visible lg:p-0" aria-label="Account sections">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedOrderId(null);
                    }}
                    aria-pressed={isActive}
                    className={`flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-center transition lg:w-full lg:justify-start lg:rounded-none lg:border-b lg:border-[#EFECE6] lg:px-4 lg:py-3.5 lg:last:border-b-0 ${
                      isActive ? 'bg-[#111111] text-white' : 'text-[#6B625A] hover:bg-[#F8F6F1] hover:text-[#111111]'
                    }`}
                    id={`sidebar-tab-${tab.id}`}
                  >
                    <Icon size={16} strokeWidth={1.6} />
                    <span className="font-mono text-[9px] uppercase tracking-widest lg:text-[10px]">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-4 hidden rounded-lg border border-[#DDD8CF] bg-white p-4 shadow-sm lg:block">
              <p className="text-[11px] uppercase tracking-[0.15em] text-[#6B625A]">Summary</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Metric label="Orders" value={String(orders.length)} />
                <Metric label="Active" value={String(activeOrders)} />
                <Metric label="Delivered" value={String(deliveredOrders)} />
                <Metric label="Spend" value={formatINR(totalSpend)} compact />
              </div>
            </div>
          </aside>

          <main className="min-w-0" id="account-panel-contents">
            {activeTab === 'profile' && (
              <section className="grid gap-6">
                <Panel title="Profile" meta="Member profile and saved delivery">
                  <div className="grid gap-4 md:grid-cols-3">
                    <InfoTile label="Email" value={userProfile.email || 'Not added'} icon={Mail} />
                    <InfoTile label="Phone" value={userProfile.phone || 'Not added'} icon={ShieldCheck} />
                    <InfoTile label="Orders" value={`${orders.length} placed`} icon={ShoppingBag} />
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="rounded-lg border border-[#DDD8CF] bg-[#FFFFFF] p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">Recent orders</p>
                          <h2 className="mt-1 text-xl font-semibold text-[#111111]">Latest activity</h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab('orders')}
                          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#111111]"
                        >
                          View all
                          <ArrowRight size={14} />
                        </button>
                      </div>

                      <div className="mt-4 divide-y divide-[#e2ded5]">
                        {orders.slice(0, 3).map((order) => (
                          <OrderRow key={order.id} order={order} onOpen={() => openOrder(order)} />
                        ))}
                        {orders.length === 0 && (
                          <EmptyBlock title="No orders yet" body="Your completed STORY orders will appear here." />
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border border-[#111111] bg-white p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">Default shipping</p>
                          <h2 className="mt-1 text-lg font-semibold text-[#111111]">{primaryAddress?.fullName || fullName}</h2>
                        </div>
                        <MapPin size={18} strokeWidth={1.5} />
                      </div>
                      <div className="mt-4 space-y-1 text-sm leading-6 text-[#6B625A]">
                        {addressLines(primaryAddress).map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('settings');
                          setIsEditingAddress(true);
                        }}
                        className="mt-5 inline-flex h-10 items-center gap-2 rounded-md border border-[#111111] px-4 font-mono text-[10px] uppercase tracking-widest transition hover:bg-[#111111] hover:text-white"
                      >
                        Edit address
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </Panel>
              </section>
            )}

            {activeTab === 'orders' && (
              <section className="grid gap-6">
                {!selectedOrder ? (
                  <Panel title="Orders" meta={`${orders.length} account orders`}>
                    <div className="grid gap-4 md:grid-cols-3">
                      <InfoTile label="Active" value={`${activeOrders} orders`} icon={Truck} />
                      <InfoTile label="Delivered" value={`${deliveredOrders} orders`} icon={Check} />
                      <InfoTile label="Total spend" value={formatINR(totalSpend)} icon={ShieldCheck} />
                    </div>

                    <div className="mt-6 overflow-hidden rounded-lg border border-[#DDD8CF]">
                      <div className="hidden grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] bg-[#F8F6F1] px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#6B625A] md:grid">
                        <span>Order</span>
                        <span>Status</span>
                        <span>Total</span>
                        <span className="text-right">Actions</span>
                      </div>
                      <div className="divide-y divide-[#EFECE6] bg-white">
                        {orders.map((order) => (
                          <OrderListCard
                            key={order.id}
                            order={order}
                            onOpen={() => openOrder(order)}
                            onTrack={() => setTrackingOrder(order)}
                            onInvoice={() => setInvoiceOrder(order)}
                          />
                        ))}
                        {orders.length === 0 && (
                          <EmptyBlock title="No backend orders found" body="Orders appear after a successful Razorpay payment." />
                        )}
                      </div>
                    </div>
                  </Panel>
                ) : (
                  <OrderDetail
                    order={selectedOrder}
                    onBack={() => setSelectedOrderId(null)}
                    onTrack={() => setTrackingOrder(selectedOrder)}
                    onInvoice={() => setInvoiceOrder(selectedOrder)}
                  />
                )}
              </section>
            )}



            {activeTab === 'addresses' && (
              <section className="grid gap-6">
                <Panel title="Settings" meta="Personal details, address, and preferences">
                  <div className="grid gap-6">
                    <div className="rounded-lg border border-[#DDD8CF] bg-white p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-[#111111]">Personal information</h2>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">
                            {saveState === 'saving' ? 'Saving' : saveState === 'saved' ? 'Saved' : 'Account identity'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => (isEditingProfile ? saveProfile() : setIsEditingProfile(true))}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#111111] px-5 font-mono text-[10px] uppercase tracking-widest text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-70"
                          disabled={saveState === 'saving'}
                          id="settings-edit-profile-btn"
                        >
                          {isEditingProfile ? 'Save details' : 'Edit details'}
                          <ArrowRight size={14} />
                        </button>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <EditableField label="First name" value={formFirstName} isEditing={isEditingProfile} onChange={setFormFirstName} />
                        <EditableField label="Last name" value={formLastName} isEditing={isEditingProfile} onChange={setFormLastName} />
                        <EditableField label="Email address" value={formEmail} type="email" isEditing={isEditingProfile} onChange={setFormEmail} />
                        <EditableField label="Phone number" value={formPhone} isEditing={isEditingProfile} onChange={setFormPhone} />
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="rounded-lg border border-[#DDD8CF] bg-white p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-lg font-semibold text-[#111111]">Default shipping</h2>
                            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">India delivery address</p>
                          </div>
                          <MapPin size={18} strokeWidth={1.5} />
                        </div>

                        {isEditingAddress ? (
                          <div className="mt-5 grid gap-3">
                            <EditableField label="Full name" value={addressName} isEditing onChange={setAddressName} />
                            <EditableField label="Street" value={addressStreet} isEditing onChange={setAddressStreet} />
                            <EditableField label="City / state / pincode" value={addressCity} isEditing onChange={setAddressCity} />
                            <EditableField label="Country" value={addressCountry} isEditing onChange={setAddressCountry} />
                            <div className="flex gap-3">
                              <button type="button" onClick={saveAddress} className="h-10 rounded-md bg-[#111111] px-4 font-mono text-[10px] uppercase tracking-widest text-white">
                                Save address
                              </button>
                              <button type="button" onClick={() => setIsEditingAddress(false)} className="h-10 rounded-md border border-[#DDD8CF] px-4 font-mono text-[10px] uppercase tracking-widest">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="mt-5 rounded-md bg-[#FFFFFF] p-4 text-sm leading-6 text-[#6B625A]">
                              <p className="font-semibold text-[#111111]">{primaryAddress?.fullName || fullName}</p>
                              {addressLines(primaryAddress).map((line) => (
                                <p key={line}>{line}</p>
                              ))}
                            </div>
                            <button type="button" onClick={() => setIsEditingAddress(true)} className="mt-4 h-10 rounded-md border border-[#111111] px-4 font-mono text-[10px] uppercase tracking-widest transition hover:bg-[#111111] hover:text-white">
                              Update address
                            </button>
                          </>
                        )}
                      </div>


                    </div>



                  </div>
                </Panel>
              </section>
            )}
            {activeTab === 'wishlist' && (
              <section className="grid gap-6">
                <Panel title="Wishlist" meta="Your saved items">
                  <div className="flex flex-col items-center py-12 text-center">
                    <ShoppingBag size={32} className="text-[#6B625A]" />
                    <p className="mt-4 text-[15px] font-semibold text-[#111111]">Your wishlist is empty</p>
                    <p className="mt-1 text-[13px] text-[#6B625A]">Save items you love and come back to them later.</p>
                  </div>
                </Panel>
              </section>
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {trackingOrder && (
          <TrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />
        )}
        {invoiceOrder && (
          <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function Panel({ title, meta, children }: { title: string; meta: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#DDD8CF] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col gap-2 border-b border-[#EFECE6] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#6B625A]">{meta}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] sm:text-3xl">{title}</h1>
        </div>
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className="rounded-md border border-[#EFECE6] bg-[#FFFFFF] p-3">
      <p className="font-mono text-[9px] uppercase tracking-widest text-[#6B625A]">{label}</p>
      <p className={`mt-1 font-semibold text-[#111111] ${compact ? 'text-sm' : 'text-lg'}`}>{value}</p>
    </div>
  );
}

function InfoTile({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-lg border border-[#DDD8CF] bg-[#FFFFFF] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">{label}</p>
        <Icon size={16} strokeWidth={1.5} />
      </div>
      <p className="mt-3 break-words text-base font-semibold text-[#111111]">{value}</p>
    </div>
  );
}

const OrderRow: React.FC<{ order: Order; onOpen: () => void }> = ({ order, onOpen }) => {
  const progress = statusIndex(order.status);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid w-full gap-3 py-4 text-left transition hover:bg-white sm:grid-cols-[1fr_auto_auto] sm:items-center"
    >
      <span>
        <span className="block text-sm font-semibold text-[#111111]">{orderNumber(order.id)}</span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">
          {formatDate(order.date)}
        </span>
        {/* Mini progress bar */}
        <span className="mt-2 flex gap-1">
          {statusSteps.map((_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i <= progress ? 'bg-[#111111]' : 'bg-[#DDD8CF]'}`} />
          ))}
        </span>
      </span>
      <StatusBadge status={order.status} />
      <span className="font-mono text-xs font-semibold text-[#111111]">{formatINR(order.total)}</span>
    </button>
  );
};

const OrderListCard: React.FC<{
  order: Order;
  onOpen: () => void;
  onTrack: () => void;
  onInvoice: () => void;
}> = ({
  order,
  onOpen,
  onTrack,
  onInvoice
}) => {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] md:items-center">
      <button type="button" onClick={onOpen} className="text-left">
        <span className="block text-sm font-semibold text-[#111111]">{orderNumber(order.id)}</span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">{formatDate(order.date)}</span>
      </button>
      <StatusBadge status={order.status} />
      <span className="font-mono text-sm font-semibold text-[#111111]">{formatINR(order.total)}</span>
      <div className="flex flex-wrap gap-2 md:justify-end">
        <ActionButton onClick={onOpen} label="Details" icon={ChevronRight} />
        <ActionButton onClick={onTrack} label="Track" icon={Truck} />
        <ActionButton onClick={onInvoice} label="Invoice" icon={Printer} />
      </div>
    </div>
  );
};

function StatusBadge({ status }: { status?: string }) {
  const normalized = (status || 'processing').toLowerCase();
  const className = normalized.includes('delivered')
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : normalized.includes('cancel')
      ? 'bg-red-50 text-red-700 border-red-200'
      : normalized.includes('shipped')
        ? 'bg-neutral-950 text-white border-neutral-950'
        : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-widest ${className}`}>
      {titleCase(status)}
    </span>
  );
}

function ActionButton({ onClick, label, icon: Icon }: { onClick: () => void; label: string; icon: React.ElementType }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-[#DDD8CF] px-3 font-mono text-[9px] uppercase tracking-widest text-[#111111] transition hover:border-[#111111] hover:bg-[#111111] hover:text-white"
      title={label}
    >
      <Icon size={13} strokeWidth={1.6} />
      {label}
    </button>
  );
}

function EditableField({
  label,
  value,
  type = 'text',
  isEditing,
  onChange
}: {
  label: string;
  value: string;
  type?: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">{label}</span>
      {isEditing ? (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-md border border-[#DDD8CF] bg-white px-3 text-sm text-[#111111] outline-none transition focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
        />
      ) : (
        <span className="flex min-h-11 items-center rounded-md border border-[#EFECE6] bg-[#FFFFFF] px-3 text-sm text-[#111111]">
          {value || 'Not added'}
        </span>
      )}
    </label>
  );
}

function EmptyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="p-8 text-center">
      <p className="text-sm font-semibold text-[#111111]">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6B625A]">{body}</p>
    </div>
  );
}

function OrderDetail({
  order,
  onBack,
  onTrack,
  onInvoice
}: {
  order: Order;
  onBack: () => void;
  onTrack: () => void;
  onInvoice: () => void;
}) {
  return (
    <div className="rounded-lg border border-[#DDD8CF] bg-white p-5 shadow-sm sm:p-6" id="order-details-panel">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#6B625A] transition hover:text-[#111111]"
      >
        <ArrowLeft size={14} strokeWidth={1.6} />
        Back to orders
      </button>

      <div className="grid gap-5 border-b border-[#EFECE6] pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#6B625A]">Order detail</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] sm:text-3xl">{orderNumber(order.id)}</h1>
          <p className="mt-2 text-sm text-[#6B625A]">{formatDate(order.date)} / {order.paymentMethod || 'Razorpay'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={onTrack} label="Track order" icon={Truck} />
          <ActionButton onClick={onInvoice} label="View invoice" icon={Printer} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-lg border border-[#DDD8CF]">
          {order.items.map((item) => (
            <div key={item.id} className="grid grid-cols-[80px_1fr] gap-4 border-b border-[#EFECE6] p-4 last:border-b-0 sm:grid-cols-[96px_1fr_auto]">
              <div className="aspect-[3/4] overflow-hidden rounded-md bg-[#EFECE6]">
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover grayscale" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#6B625A]">
                    <ShoppingBag size={18} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold uppercase text-[#111111]">{item.product.name}</h3>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">
                  {item.selectedColor.name} / {item.selectedSize} / Qty {item.quantity}
                </p>
              </div>
              <p className="font-mono text-sm font-semibold text-[#111111] sm:text-right">{formatINR(itemTotal(item))}</p>
            </div>
          ))}
          {order.items.length === 0 && <EmptyBlock title="No items returned" body="The order exists, but item rows were not returned by the API." />}
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border border-[#DDD8CF] bg-[#FFFFFF] p-5">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">Delivery</h2>
            <div className="mt-3 text-sm leading-6 text-[#6B625A]">
              <p className="font-semibold text-[#111111]">{order.address?.fullName}</p>
              {addressLines(order.address).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#111111] bg-white p-5">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">Summary</h2>
            <div className="mt-4 space-y-3">
              <SummaryRow label="Subtotal" value={formatINR(order.subtotal)} />
              <SummaryRow label="Shipping" value={order.shipping === 0 ? 'Complimentary' : formatINR(order.shipping)} />
              <SummaryRow label="GST" value={formatINR(order.tax)} />
              <div className="flex justify-between border-t border-[#111111] pt-4 text-sm font-semibold uppercase">
                <span>Total</span>
                <span>{formatINR(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackingModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const current = statusIndex(order.status);

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end bg-black/40 p-0 sm:items-center sm:justify-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-lg sm:p-6"
      >
        <ModalHeader title="Track order" meta={orderNumber(order.id)} onClose={onClose} />
        <div className="mt-6 space-y-4">
          {statusSteps.map((step, index) => {
            const done = current >= index;
            return (
              <div key={step} className="grid grid-cols-[28px_1fr] gap-3">
                <span className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border ${done ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#d8d3c9] text-[#8a867c]'}`}>
                  {done ? <Check size={14} /> : index + 1}
                </span>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-[#111111]">{titleCase(step)}</p>
                  <p className="mt-1 text-sm leading-6 text-[#6B625A]">
                    {index === 0 && 'Order received by STORY.'}
                    {index === 1 && 'Items are being packed for dispatch.'}
                    {index === 2 && 'Package is with the delivery partner.'}
                    {index === 3 && 'Order delivered.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {order.trackingUrl ? (
          <a
            href={order.trackingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#111111] px-5 py-4 font-mono text-[10px] uppercase tracking-widest text-white"
          >
            Open courier tracking
            <ArrowRight size={14} />
          </a>
        ) : (
          <div className="mt-4 rounded-lg border border-[#e8d58f] bg-[#fff9e6] p-4 text-sm leading-6 text-[#7f6000]">
            Tracking link appears here after the fulfillment team ships this order.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function InvoiceModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end bg-black/40 p-0 sm:items-center sm:justify-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-lg sm:p-6"
      >
        <ModalHeader title="Invoice" meta={orderNumber(order.id)} onClose={onClose} />
        <div className="mt-6 rounded-lg border border-[#DDD8CF] bg-[#FFFFFF] p-5" id="story-invoice-panel">
          <div className="flex flex-col gap-4 border-b border-[#DDD8CF] pb-5 sm:flex-row sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">STORY India</p>
              <h2 className="mt-1 text-xl font-semibold text-[#111111]">Tax invoice</h2>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#6B625A] sm:text-right">
              <p>{orderNumber(order.id)}</p>
              <p>{formatDate(order.date)}</p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-md border border-[#DDD8CF] bg-white">
            {order.items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto] gap-4 border-b border-[#EFECE6] p-4 text-sm last:border-b-0">
                <div>
                  <p className="font-semibold text-[#111111]">{item.product.name}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">
                    Qty {item.quantity} / {item.selectedSize} / {item.selectedColor.name}
                  </p>
                </div>
                <p className="font-mono font-semibold">{formatINR(itemTotal(item))}</p>
              </div>
            ))}
          </div>

          <div className="ml-auto mt-5 max-w-sm space-y-3">
            <SummaryRow label="Subtotal" value={formatINR(order.subtotal)} />
            <SummaryRow label="Shipping" value={order.shipping === 0 ? 'Complimentary' : formatINR(order.shipping)} />
            <SummaryRow label="GST" value={formatINR(order.tax)} />
            <div className="flex justify-between border-t border-[#111111] pt-4 text-sm font-semibold uppercase">
              <span>Total paid</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111111] px-5 py-4 font-mono text-[10px] uppercase tracking-widest text-white"
          >
            <Printer size={14} />
            Print invoice
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[#111111] px-5 py-4 font-mono text-[10px] uppercase tracking-widest"
          >
            <Download size={14} />
            Save as PDF
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ModalHeader({ title, meta, onClose }: { title: string; meta: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#EFECE6] pb-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#6B625A]">{meta}</p>
        <h2 className="mt-1 text-2xl font-semibold text-[#111111]">{title}</h2>
      </div>
      <button type="button" onClick={onClose} className="rounded-full border border-[#DDD8CF] p-2 text-[#111111] transition hover:bg-[#111111] hover:text-white" aria-label="Close">
        <X size={16} />
      </button>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 font-mono text-[10px] uppercase tracking-widest text-[#6B625A]">
      <span>{label}</span>
      <span className="font-semibold text-[#111111]">{value}</span>
    </div>
  );
}
