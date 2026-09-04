/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  ShoppingBag, 
  Box, 
  Folder, 
  Tag, 
  Users, 
  Inbox, 
  CreditCard, 
  Settings, 
  MessageSquare,
  Star,
  Clock, 
  ChevronRight,
  Menu,
  X,
  LogOut,
  ShieldCheck
} from 'lucide-react';

// Models & mock seeds
import { Product, Order, Category, Customer, PaymentTransaction, Coupon, StoreSettings, ContactRequest, CustomerReview } from './types';
import { 
  defaultSettings 
} from './data';
import { adminApi, AdminUser, DashboardStats } from './api';

// Custom modular view components
import DashboardView from './components/DashboardView';
import OrdersView from './components/OrdersView';
import ProductsView from './components/ProductsView';
import CategoriesView from './components/CategoriesView';
import CouponsView from './components/CouponsView';
import CustomersView from './components/CustomersView';
import InventoryView from './components/InventoryView';
import PaymentsView from './components/PaymentsView';
import SettingsView from './components/SettingsView';
import ClientRequestsView from './components/ClientRequestsView';
import ReviewsView from './components/ReviewsView';

// Overlay action modals
import { AddProductModal, AddCategoryModal, CreateCouponModal, EditProductModal } from './components/Modals';

type ViewTab = 'Dashboard' | 'Orders' | 'Products' | 'Categories' | 'Coupons' | 'Customers' | 'Inventory' | 'Payments' | 'Requests' | 'Reviews' | 'Settings';

export default function App() {
  // Current active view tab
  const [activeTab, setActiveTab] = useState<ViewTab>('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState('');
  const [dataError, setDataError] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [globalSaveSuccess, setGlobalSaveSuccess] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Core reactive data persistent engines
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Modal display toggles
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [createCouponOpen, setCreateCouponOpen] = useState(false);

  // Live clock display counter state
  const [timeStr, setTimeStr] = useState('');

  const loadAdminData = useCallback(async () => {
    setDataLoading(true);
    setDataError('');

    try {
      const [
        productsData,
        ordersData,
        categoriesData,
        customersData,
        transactionsData,
        couponsData,
        contactRequestsData,
        reviewsData,
        settingsData,
        dashboardStatsData
      ] = await Promise.all([
        adminApi.products(),
        adminApi.orders(),
        adminApi.categories(),
        adminApi.customers(),
        adminApi.payments(),
        adminApi.coupons(),
        adminApi.contactRequests(),
        adminApi.reviews(),
        adminApi.settings(),
        adminApi.dashboardStats()
      ]);

      setProducts(productsData);
      setOrders(ordersData);
      setCategories(categoriesData);
      setCustomers(customersData);
      setTransactions(transactionsData);
      setCoupons(couponsData);
      setContactRequests(contactRequestsData);
      setReviews(reviewsData);
      setSettings(settingsData);
      setDashboardStats(dashboardStatsData);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not load admin data.');
      setProducts([]);
      setOrders([]);
      setCategories([]);
      setCustomers([]);
      setTransactions([]);
      setCoupons([]);
      setContactRequests([]);
      setReviews([]);
      setDashboardStats(null);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const restoreSession = async () => {
      try {
        const user = await adminApi.me();
        if (!mounted) return;
        setAdminUser(user);
        await loadAdminData();
      } catch (error) {
        if (!mounted) return;
        setAuthError('');
      } finally {
        if (mounted) setAuthChecking(false);
      }
    };

    restoreSession();
    return () => {
      mounted = false;
    };
  }, [loadAdminData]);

  // 2. Real-time UTC luxury clock updater loop
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Core Handlers to manipulate state & write standard Cache
  const handleAddProduct = async (newProd: Omit<Product, 'id'>) => {
    try {
      const productItem = await adminApi.createProduct(newProd);
      setProducts(prev => [productItem, ...prev]);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not create product.');
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    try {
      await adminApi.deleteProduct(prodId);
      setProducts(prev => prev.filter(p => p.id !== prodId));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not archive product.');
    }
  };

  const handleUpdateProduct = async (prodId: string, patch: Partial<Product>) => {
    try {
      const updated = await adminApi.updateProduct(prodId, patch);
      setProducts(prev => prev.map(p => p.id === prodId ? updated : p));
      setEditingProduct(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not update product.');
    }
  };

  const handleToggleProductStatus = async (prodId: string) => {
    const product = products.find(p => p.id === prodId);
    if (!product) return;
    const nextStatus: Product['status'] = product.status === 'active' ? 'draft' : 'active';

    try {
      const updated = await adminApi.updateProduct(prodId, { status: nextStatus });
      setProducts(prev => prev.map(p => p.id === prodId ? updated : p));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not update product status.');
    }
  };

  const handleUpdateStock = async (prodId: string, newStock: number) => {
    try {
      const updated = await adminApi.updateStock(prodId, newStock);
      setProducts(prev => prev.map(p => p.id === prodId ? updated : p));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not update stock.');
    }
  };

  const handleAddCategory = async (newCat: Omit<Category, 'id' | 'productCount'>) => {
    try {
      const catItem = await adminApi.createCategory(newCat);
      setCategories(prev => [...prev, catItem]);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not create category.');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    try {
      await adminApi.deleteCategory(catId);
      setCategories(prev => prev.filter(c => c.id !== catId));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not archive category.');
    }
  };

  const handleToggleCategoryStatus = async (catId: string) => {
    const category = categories.find(c => c.id === catId);
    if (!category) return;
    const nextStatus: Category['status'] = category.status === 'Active' ? 'Inactive' : 'Active';

    try {
      const updated = await adminApi.updateCategory(catId, { status: nextStatus });
      setCategories(prev => prev.map(c => c.id === catId ? updated : c));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not update category.');
    }
  };

  const handleUpdateCategory = async (catId: string, patch: Partial<Category>) => {
    try {
      const updated = await adminApi.updateCategory(catId, patch);
      setCategories(prev => prev.map(c => c.id === catId ? updated : c));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not update category.');
    }
  };

  const handleCreateCoupon = async (newCoup: Omit<Coupon, 'usageUsed'>) => {
    try {
      const couponItem = await adminApi.createCoupon(newCoup);
      setCoupons(prev => [couponItem, ...prev]);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not create coupon.');
    }
  };

  const handleDeleteCoupon = async (coupCode: string) => {
    const coupon = coupons.find(c => c.code === coupCode);
    if (!coupon) return;

    try {
      if (coupon.id) await adminApi.deleteCoupon(coupon.id);
      setCoupons(prev => prev.filter(c => c.code !== coupCode));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not archive coupon.');
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string, 
    paymentStatus: Order['paymentStatus'], 
    fulfillmentStatus: Order['fulfillmentStatus'],
    trackingUrl?: string
  ) => {
    try {
      const updated = await adminApi.updateOrderStatus(orderId, paymentStatus, fulfillmentStatus, trackingUrl);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (paymentStatus === 'Paid') {
        adminApi.payments().then(setTransactions).catch(() => undefined);
      }
      setGlobalSaveSuccess('Order status updated');
      setTimeout(() => setGlobalSaveSuccess(''), 3000);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not update order status.');
    }
  };

  const handleSaveSettings = async (updated: StoreSettings) => {
    try {
      const saved = await adminApi.saveSettings(updated);
      setSettings(saved);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not save settings.');
    }
  };

  const handleUpdateContactRequestStatus = async (id: string, status: ContactRequest['status']) => {
    try {
      const updated = await adminApi.updateContactRequestStatus(id, status);
      setContactRequests(prev => prev.map(request => request.id === id ? updated : request));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not update client request.');
    }
  };

  const handleUpdateReviewStatus = async (id: string, status: CustomerReview['status']) => {
    try {
      const updated = await adminApi.updateReviewStatus(id, status);
      setReviews(prev => prev.map(review => review.id === id ? updated : review));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not update review.');
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await adminApi.deleteReview(id);
      setReviews(prev => prev.filter(review => review.id !== id));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Could not delete review.');
    }
  };

  // Navigations sidebar configuration
  const navigationTabs: { id: ViewTab; label: string; icon: any }[] = [
    { id: 'Dashboard', label: 'Overview', icon: LayoutGrid },
    { id: 'Orders', label: 'Orders', icon: ShoppingBag },
    { id: 'Products', label: 'Products', icon: Box },
    { id: 'Categories', label: 'Categories', icon: Folder },
    { id: 'Coupons', label: 'Coupons', icon: Tag },
    { id: 'Customers', label: 'Customers', icon: Users },
    { id: 'Inventory', label: 'Inventory', icon: Inbox },
    { id: 'Payments', label: 'Payments', icon: CreditCard },
    { id: 'Requests', label: 'Requests', icon: MessageSquare },
    { id: 'Reviews', label: 'Reviews', icon: Star },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigateDirect = (tab: string) => {
    setActiveTab(tab as ViewTab);
  };

  const handleAdminLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    setDataError('');
    setAuthChecking(true);

    try {
      const user = await adminApi.login(loginEmail, loginPassword);
      setAdminUser(user);
      await loadAdminData();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Admin login failed.');
    } finally {
      setAuthChecking(false);
    }
  };

  const handleAdminLogout = async () => {
    await adminApi.logout();
    setAdminUser(null);
    setProducts([]);
    setOrders([]);
    setCategories([]);
    setCustomers([]);
    setTransactions([]);
    setCoupons([]);
    setContactRequests([]);
    setReviews([]);
    setSettings(defaultSettings);
    setDashboardStats(null);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-neutral-500">
        Checking admin session
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 font-sans selection:bg-neutral-900 selection:text-white">
        <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden border border-neutral-950 bg-white lg:grid-cols-[0.9fr_1.1fr]">
          <div className="hidden bg-neutral-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[3px] text-neutral-400">STORY India</p>
              <h1 className="mt-4 text-5xl font-black uppercase leading-none tracking-tight">
                Admin Workspace
              </h1>
            </div>
            <div className="border-t border-white/20 pt-6">
              <ShieldCheck size={22} strokeWidth={1.5} />
              <p className="mt-4 max-w-xs text-sm leading-6 text-neutral-300">
                Role-based access for catalog, fulfillment, payments, coupons, and store settings.
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="p-7 sm:p-10">
            <div className="mb-8">
              <p className="font-mono text-[10px] uppercase tracking-[2px] text-neutral-500">Protected login</p>
              <h2 className="mt-2 text-3xl font-bold uppercase text-neutral-950">Sign in</h2>
              <p className="mt-3 text-sm text-neutral-500">
                Use the seeded admin account or any backend user with role admin.
              </p>
            </div>

            {(authError || dataError) && (
              <div className="mb-5 border border-neutral-950 bg-neutral-50 px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-neutral-800">
                {authError || dataError}
              </div>
            )}

            <div className="space-y-5">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Email</span>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950"
                  placeholder="admin@story.in"
                  required
                />
              </label>

              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Password</span>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950"
                  placeholder="StoryAdmin@2026"
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={authChecking}
              className="mt-8 w-full bg-neutral-950 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-70"
            >
              {authChecking ? 'Checking access...' : 'Open admin panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-neutral-900 selection:text-white h-screen overflow-hidden">
      
      {/* Upper Navigation Header bar themed */}
      <header className="bg-white border-b border-neutral-150 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-1 hover:bg-neutral-100 rounded text-neutral-600 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex flex-col text-left">
            <span className="font-bold text-neutral-950 text-lg uppercase tracking-[3px] font-mono leading-none">STORY</span>
            <span className="text-[10px] font-mono uppercase tracking-[2px] text-neutral-450 mt-1 leading-none font-semibold">India Admin</span>
          </div>
        </div>

        {/* Live luxury status and global system clock tracker */}
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-100 select-none">
            <span className="w-1.5 h-1.5 bg-neutral-900 rounded-full animate-ping"></span>
            <span className="text-[10px] font-mono text-neutral-450 uppercase tracking-widest font-semibold">
              {dataLoading ? 'Syncing API' : 'India Fulfillment Online'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => loadAdminData()}
            className="hidden md:inline-flex border border-neutral-200 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
          >
            Refresh
          </button>
          
          <div className="flex items-center gap-2 border-l border-neutral-150 pl-5 text-neutral-500 font-mono text-xs font-semibold select-none">
            <Clock size={14} className="text-neutral-400" />
            <span className="tabular-nums tracking-widest">{timeStr || '18:35:29'}</span>
          </div>

          <button
            type="button"
            onClick={handleAdminLogout}
            className="inline-flex items-center gap-2 border border-neutral-200 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
            title={adminUser.email}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {dataError && (
        <div className="border-b border-neutral-200 bg-white px-4 py-2 text-center font-mono text-[10px] uppercase tracking-widest text-neutral-600">
          {dataError}
        </div>
      )}

      {/* Main Grid View Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative overflow-hidden h-0">
        
        {/* Desktop Sidebar menu rail - sticky */}
        <aside className={`hidden md:flex flex-col gap-1 py-8 border-r border-neutral-150 shrink-0 text-left bg-white/50 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'w-[68px] px-2' : 'w-64 p-5'}`}>
          <div className={`flex items-center justify-between mb-4 ${sidebarCollapsed ? 'px-1' : 'pl-3'}`}>
            {!sidebarCollapsed && <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Workspace Menu</p>}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronRight size={14} className={`transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {navigationTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-xl text-xs font-medium uppercase tracking-wider transition-all ${
                    sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-3'
                  } ${
                    isActive 
                      ? 'bg-neutral-900 text-white font-bold shadow-sm' 
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 font-semibold'
                  }`}
                >
                  <Icon size={16} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile menu panel dropdown overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 top-[65px] bg-black/35 backdrop-blur-xs z-30"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="w-64 bg-white h-full border-r border-neutral-200 p-5 flex flex-col gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-3 mb-4 text-left">Workspace Menu</p>
                <nav className="flex flex-col gap-1 text-left">
                  {navigationTabs.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-medium uppercase tracking-wider transition-all ${
                          isActive 
                            ? 'bg-neutral-950 text-white font-bold' 
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic App Content Body Area wrapper */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto overflow-x-hidden">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full text-left"
          >
            {activeTab === 'Dashboard' && (
              <DashboardView
                products={products}
                orders={orders}
                onNavigate={handleNavigateDirect}
                onOpenAddProduct={() => setAddProductOpen(true)}
                onOpenAddCategory={() => setAddCategoryOpen(true)}
                onOpenCreateCoupon={() => setCreateCouponOpen(true)}
                stats={dashboardStats}
              />
            )}

            {activeTab === 'Orders' && (
              <OrdersView 
                orders={orders} 
                onUpdateOrderStatus={handleUpdateOrderStatus} 
              />
            )}

            {activeTab === 'Products' && (
              <ProductsView
                products={products}
                onOpenAddProduct={() => setAddProductOpen(true)}
                onEditProduct={(product) => setEditingProduct(product)}
                onToggleStatus={handleToggleProductStatus}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === 'Categories' && (
              <CategoriesView
                categories={categories}
                settings={settings}
                onOpenAddCategory={() => setAddCategoryOpen(true)}
                onDeleteCategory={handleDeleteCategory}
                onToggleCategoryStatus={handleToggleCategoryStatus}
                onUpdateCategory={handleUpdateCategory}
                onSaveSettings={handleSaveSettings}
              />
            )}

            {activeTab === 'Coupons' && (
              <CouponsView
                coupons={coupons}
                onOpenCreateCoupon={() => setCreateCouponOpen(true)}
                onDeleteCoupon={handleDeleteCoupon}
              />
            )}

            {activeTab === 'Customers' && (
              <CustomersView 
                customers={customers} 
              />
            )}

            {activeTab === 'Inventory' && (
              <InventoryView
                products={products}
                onUpdateStock={handleUpdateStock}
              />
            )}

            {activeTab === 'Payments' && (
              <PaymentsView 
                transactions={transactions} 
              />
            )}

            {activeTab === 'Requests' && (
              <ClientRequestsView
                requests={contactRequests}
                onUpdateStatus={handleUpdateContactRequestStatus}
              />
            )}

            {activeTab === 'Reviews' && (
              <ReviewsView
                reviews={reviews}
                onUpdateStatus={handleUpdateReviewStatus}
                onDeleteReview={handleDeleteReview}
              />
            )}

            {activeTab === 'Settings' && (
              <SettingsView
                settings={settings}
                products={products}
                onSaveSettings={handleSaveSettings}
              />
            )}
          </motion.div>
        </main>
      </div>

      {/* Persistent global luxury watermark footer - inside main scroll */}

      {/* Global save success toast */}
      <AnimatePresence>
        {globalSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-4 text-white shadow-2xl"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7.5L5.5 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">{globalSaveSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action overlay modals */}
      <AddProductModal 
        isOpen={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onAdd={handleAddProduct}
        categories={categories}
      />

      <EditProductModal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        onSave={handleUpdateProduct}
        categories={categories}
        product={editingProduct}
      />

      <AddCategoryModal 
        isOpen={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        onAdd={handleAddCategory}
      />

      <CreateCouponModal 
        isOpen={createCouponOpen}
        onClose={() => setCreateCouponOpen(false)}
        onCreate={handleCreateCoupon}
      />

    </div>
  );
}
