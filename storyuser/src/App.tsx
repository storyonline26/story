import React from 'react';
import { ActiveScreen, Category, Product, CartItem, UserProfile, Address, Order, ColorOption, StorefrontContent } from './types';
import { PRODUCTS, INITIAL_USER_PROFILE } from './data';
import { storyApi } from './api';
import { Navbar } from './components/Navbar';
import { AnnouncementTicker } from './components/AnnouncementTicker';
import { Footer } from './components/Footer';
import { ShopView } from './components/ShopView';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { DiscoverView } from './components/DiscoverView';
import { CategoryGenderView } from './components/CategoryGenderView';
import { ProductDetailView } from './components/ProductDetailView';
import { SettingsView } from './components/SettingsView';
import { OrderConfirmationView } from './components/OrderConfirmationView';
import { CartDrawer } from './components/CartDrawer';
import { LoginView } from './components/LoginView';
import { BagView } from './components/BagView';
import { PolicyKey, PolicyView } from './components/PolicyView';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_signature: string;
}

type CheckoutPaymentMethod = 'online' | 'cod';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isApiProduct = (product: Product) => uuidPattern.test(product.id);

const upsertLocalCartItem = (items: CartItem[], product: Product, size: string, color: ColorOption) => {
  const combinedId = `${product.id}-${size}-${color.name.toLowerCase()}`;
  const existingIdx = items.findIndex(item => item.id === combinedId);

  if (existingIdx > -1) {
    const updated = [...items];
    updated[existingIdx] = { ...updated[existingIdx], quantity: updated[existingIdx].quantity + 1 };
    return updated;
  }

  return [...items, {
    id: combinedId,
    product,
    selectedSize: size,
    selectedColor: color,
    quantity: 1
  }];
};

const loadRazorpay = () => new Promise<boolean>((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const DEFAULT_STOREFRONT_CONTENT: StorefrontContent = {
  announcementItems: [
    'FREE SHIPPING ON ORDERS ABOVE INR 999',
    'SALE 20% OFF',
    '100% AUTHENTIC BRANDED FASHION',
    'NEW ARRIVALS EVERY WEEK',
    'EASY RETURNS & EXCHANGES',
    'CURATED IN INDIA FOR YOU'
  ],
  heroEyebrow: 'NEW EDITORIAL CAPSULE',
  heroTitle: 'OUR LATEST STORY',
  heroBody: 'Discover verified branded fashion, curated in India for everyday premium style.',
  heroPrimaryCta: 'Shop New Arrivals',
  heroSecondaryCta: 'Explore Collections',
  heroImagePrimary: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1100&q=85',
  heroImageSecondary: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85',
  heroImageDetail: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85',
  heroImageFourth: '',
  heroImageFifth: '',
  heroImageSixth: '',
  heroBadgeEyebrow: 'Story India 2026',
  heroBadgeText: 'Tailored quiet luxury',
  productsEyebrow: 'Seasonal selection',
  productsTitle: 'Our Products',
  productsBody: 'Explore curated essentials across clothing, footwear, and everyday luxury.',
  homeProductIds: [],
  collectionEyebrow: 'Curated combinations',
  collectionTitle: 'Perfect Match',
  collectionBody: 'Explore curated collections designed to complement your style with comfort and confidence.',
  collectionImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
  collectionProductIds: [],
  discoverEyebrow: 'OUR COMPLETE CODES',
  discoverTitle: 'COLLECTIONS',
  discoverSearchPlaceholder: 'SEARCH PRODUCTS, STYLING OR RELEASES...',
  discoverTagLabel: 'STYLING DIARY:',
  jewelryEyebrow: 'Accessories edit',
  jewelryTitle: 'Story Jewelry',
  jewelryBody: 'Adorn yourself with timeless accessories that complete every look.',
  recommendationEyebrow: 'Selected next',
  recommendationTitle: 'Recommendation',
  recommendationProductIds: ['linen-wide-pants', 'faux-leather-jacket', 'gray-tube-top', 'drawstring-linen-pants', 'convertible-crossbody-bag'],
  storyCategories: [],
  aboutEyebrow: 'About STORY India',
  aboutTitle: 'Verified Fashion, Curated In India',
  aboutIntroParagraph1: 'STORY is a premium India-based fashion store built for people who want original branded pieces without the noise of fast, careless shopping.',
  aboutIntroParagraph2: 'We curate verified branded fashion across uppers, lowers, dresses, co-ords, footwear, accessories, and inners, with a focus on authenticity, condition, price, and everyday Indian style.',
  aboutPrimaryCtaText: 'Shop Verified Picks',
  aboutSecondaryCtaText: 'View Curated Drops',
  aboutImage1: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85',
  aboutImage2: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85',
  aboutImage3: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
  aboutBadgeText: 'Premium branded fashion, checked, styled, and priced for modern Indian wardrobes.',
  aboutStats: [['2026', 'Founded'], ['7', 'Core categories'], ['100%', 'Original focus'], ['INDIA', 'Curated for']],
  aboutValuesEyebrow: 'Our standard',
  aboutValuesTitle: 'Original Pieces, Clear Checks',
  aboutValues: [
    {
      title: 'Authentic',
      text: 'Every piece is checked for brand identity, condition, finish, and everyday wearability before it enters the STORY edit.'
    },
    {
      title: 'Curated',
      text: 'We select branded fashion for Indian wardrobes: sharp layers, premium basics, clean footwear, and easy occasion pieces.'
    },
    {
      title: 'Value',
      text: 'The goal is simple: original branded fashion, better prices, and quality that feels worth returning to.'
    }
  ],
  aboutPromiseEyebrow: 'The STORY promise',
  aboutPromiseTitle: 'Verified Authentic. Best Price. Better Quality.',
  aboutPromiseBody: 'From first scroll to final delivery, STORY keeps the edit focused: real branded pieces, clean product presentation, reliable support, and fashion that fits Indian everyday life.',
  aboutPromiseImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85',
  razorpayActive: true,
  onlinePaymentEnabled: true,
  codEnabled: false,
  privacyPolicy: 'We respect your privacy and use customer information only to process orders, provide support, improve the shopping experience, and meet legal or payment requirements. We do not sell customer data. Payment information is processed securely by our payment partners.',
  termsConditions: 'By using STORY India, you agree to provide accurate account, delivery, and payment information. Product availability, pricing, promotions, and delivery timelines may change without prior notice. Orders are confirmed only after successful payment and verification.',
  returnRefundPolicy: 'Returns or exchanges may be requested for eligible unused products within the return window shown at purchase. Items must be returned with tags, packaging, and invoice. Refunds are processed to the original payment method after quality check approval.'
};

const parseRoute = (): { screen: ActiveScreen; categorySlug: string; policyKey: PolicyKey } => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const categoryMatch = path.match(/^\/category\/([^/]+)$/);

  if (categoryMatch?.[1]) {
    return { screen: 'category', categorySlug: decodeURIComponent(categoryMatch[1]), policyKey: 'privacy' };
  }

  if (path === '/privacy-policy') return { screen: 'policy', categorySlug: '', policyKey: 'privacy' };
  if (path === '/terms-conditions') return { screen: 'policy', categorySlug: '', policyKey: 'terms' };
  if (path === '/return-refund-policy') return { screen: 'policy', categorySlug: '', policyKey: 'returns' };
  if (path === '/collections') return { screen: 'discover', categorySlug: '', policyKey: 'privacy' };
  if (path === '/about') return { screen: 'about', categorySlug: '', policyKey: 'privacy' };
  if (path === '/contact') return { screen: 'contact', categorySlug: '', policyKey: 'privacy' };
  if (path === '/account') return { screen: 'settings', categorySlug: '', policyKey: 'privacy' };
  if (path === '/bag') return { screen: 'bag', categorySlug: '', policyKey: 'privacy' };

  return { screen: 'shop', categorySlug: '', policyKey: 'privacy' };
};

const policyPath = (policyKey: PolicyKey) => {
  if (policyKey === 'terms') return '/terms-conditions';
  if (policyKey === 'returns') return '/return-refund-policy';
  return '/privacy-policy';
};

const screenPath = (screen: ActiveScreen, categorySlug: string, policyKey: PolicyKey) => {
  if (screen === 'category') return `/category/${categorySlug}`;
  if (screen === 'policy') return policyPath(policyKey);
  if (screen === 'discover') return '/collections';
  if (screen === 'about') return '/about';
  if (screen === 'contact') return '/contact';
  if (screen === 'settings') return '/account';
  if (screen === 'bag') return '/bag';
  return '/';
};

export default function App() {
  const initialRoute = React.useMemo(() => parseRoute(), []);
  const [activeScreen, setActiveScreen] = React.useState<ActiveScreen>(initialRoute.screen);
  const [activeProduct, setActiveProduct] = React.useState<Product | null>(null);
  const [activeCategorySlug, setActiveCategorySlug] = React.useState(initialRoute.categorySlug);
  const [activePolicyKey, setActivePolicyKey] = React.useState<PolicyKey>(initialRoute.policyKey);
  const [products, setProducts] = React.useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [storefrontContent, setStorefrontContent] = React.useState<StorefrontContent>(DEFAULT_STOREFRONT_CONTENT);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [apiNotice, setApiNotice] = React.useState('');
  const [googleClientId, setGoogleClientId] = React.useState('');

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [checkoutBusy, setCheckoutBusy] = React.useState(false);
  const [checkoutMessage, setCheckoutMessage] = React.useState('');
  const [checkoutError, setCheckoutError] = React.useState('');
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [userProfile, setUserProfile] = React.useState<UserProfile>(INITIAL_USER_PROFILE);
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [checkoutAddressId, setCheckoutAddressId] = React.useState('');
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = React.useState<CheckoutPaymentMethod>('online');
  const [compiledOrder, setCompiledOrder] = React.useState<Order | null>(null);

  const [cartOpen, setCartOpen] = React.useState(false);
  const [authIntent, setAuthIntent] = React.useState<'account' | 'checkout'>('account');
  const [accountInitialTab, setAccountInitialTab] = React.useState<'profile' | 'orders' | 'wishlist' | 'settings'>('profile');

  const loadAccountData = React.useCallback(async () => {
    const [cartResult, addressesResult, ordersResult] = await Promise.allSettled([
      storyApi.getCart(),
      storyApi.getAddresses(),
      storyApi.getOrders()
    ]);

    if (cartResult.status === 'fulfilled') setCartItems(cartResult.value);
    if (addressesResult.status === 'fulfilled') setAddresses(addressesResult.value);
    if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value);
  }, []);

  React.useEffect(() => {
    let mounted = true;

    storyApi.googleConfig()
      .then((config) => {
        if (mounted) setGoogleClientId(config.clientId || '');
      })
      .catch(() => undefined);

    storyApi.fetchProducts()
      .then((apiProducts) => {
        if (mounted && apiProducts.length > 0) setProducts(apiProducts);
      })
      .catch(() => {
        if (mounted) setApiNotice('Backend catalog unavailable. Showing local STORY India collection.');
      });

    storyApi.settings()
      .then((settings) => {
        if (mounted) setStorefrontContent(settings);
      })
      .catch(() => undefined);

    storyApi.categories()
      .then((apiCategories) => {
        if (mounted) setCategories(apiCategories);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;

    const hydrateSession = async () => {
      try {
        const user = await storyApi.me();
        if (!mounted) return;
        setUserProfile(prev => ({ ...prev, ...user }));
        setIsLoggedIn(true);
        await loadAccountData();
      } catch {
        if (!mounted) return;
        setIsLoggedIn(false);
      }
    };

    hydrateSession();
    return () => {
      mounted = false;
    };
  }, [loadAccountData]);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeScreen, activeProduct]);

  React.useEffect(() => {
    if (addresses.length === 0) {
      setCheckoutAddressId('');
      return;
    }

    if (checkoutAddressId && addresses.some((address) => address.id === checkoutAddressId)) return;
    const preferredAddress = addresses.find((address) => address.isDefault) || addresses[0];
    setCheckoutAddressId(preferredAddress.id || '');
  }, [addresses, checkoutAddressId]);

  React.useEffect(() => {
    const onlineAvailable = storefrontContent.onlinePaymentEnabled && storefrontContent.razorpayActive;
    if (checkoutPaymentMethod === 'online' && !onlineAvailable && storefrontContent.codEnabled) {
      setCheckoutPaymentMethod('cod');
    }
    if (checkoutPaymentMethod === 'cod' && !storefrontContent.codEnabled && onlineAvailable) {
      setCheckoutPaymentMethod('online');
    }
  }, [checkoutPaymentMethod, storefrontContent.codEnabled, storefrontContent.onlinePaymentEnabled, storefrontContent.razorpayActive]);

  React.useEffect(() => {
    const handlePopState = () => {
      const route = parseRoute();
      setActiveCategorySlug(route.categorySlug);
      setActivePolicyKey(route.policyKey);
      setActiveProduct(null);
      setActiveScreen(route.screen);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = React.useCallback((screen: ActiveScreen, categorySlug = activeCategorySlug, policyKey = activePolicyKey) => {
    setActiveCategorySlug(categorySlug);
    setActivePolicyKey(policyKey);
    setActiveProduct(null);
    setActiveScreen(screen);

    const nextPath = screenPath(screen, categorySlug, policyKey);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
  }, [activeCategorySlug, activePolicyKey]);

  const cartBadgeCount = React.useMemo(
    () => cartItems.reduce((acc, curr) => acc + curr.quantity, 0),
    [cartItems]
  );

  const syncPendingCart = async (items: CartItem[]) => {
    const syncableItems = items.filter(item => isApiProduct(item.product));
    if (syncableItems.length === 0) return;

    for (const item of syncableItems) {
      await storyApi.addCartItem(item.product.id, item.quantity, item.selectedSize, item.selectedColor);
    }
  };

  const handleAuthenticated = async (
    profilePatch: Partial<UserProfile>,
    token: string | undefined,
    nextScreen: ActiveScreen
  ) => {
    const previousCart = [...cartItems];

    setUserProfile(prev => ({ ...prev, ...profilePatch }));
    setIsLoggedIn(true);

    try {
      await syncPendingCart(previousCart);
      await loadAccountData();
    } catch (error) {
      setApiNotice(error instanceof Error ? error.message : 'Could not sync account data.');
    }

    setActiveScreen(nextScreen);
  };

  const handleAddToCart = (product: Product, size: string, color: ColorOption) => {
    setCartItems(prev => upsertLocalCartItem(prev, product, size, color));

    if (isLoggedIn && isApiProduct(product)) {
      storyApi.addCartItem(product.id, 1, size, color)
        .then(setCartItems)
        .catch((error) => setApiNotice(error instanceof Error ? error.message : 'Could not update cart.'));
    }

    window.setTimeout(() => setCartOpen(true), 400);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const target = cartItems.find(item => item.id === id);
    const nextQuantity = Math.max(1, (target?.quantity || 1) + delta);

    setCartItems(prev => prev.map(item => (
      item.id === id ? { ...item, quantity: nextQuantity } : item
    )));

    if (target && isLoggedIn && isApiProduct(target.product)) {
      storyApi.updateCartItem(target.product.id, nextQuantity, target.selectedSize, target.selectedColor.name)
        .then(setCartItems)
        .catch((error) => setApiNotice(error instanceof Error ? error.message : 'Could not update quantity.'));
    }
  };

  const handleRemoveItem = (id: string) => {
    const target = cartItems.find(item => item.id === id);
    setCartItems(prev => prev.filter(item => item.id !== id));

    if (target && isLoggedIn && isApiProduct(target.product)) {
      storyApi.removeCartItem(target.product.id, target.selectedSize, target.selectedColor.name)
        .then(setCartItems)
        .catch((error) => setApiNotice(error instanceof Error ? error.message : 'Could not remove item.'));
    }
  };

  const handleSelectProduct = (product: Product) => {
    setActiveProduct(product);
    setActiveScreen('detail');
  };

  const handleOpenCategory = (categorySlug: string) => {
    navigateTo('category', categorySlug);
  };

  const handleOpenPolicy = (policyKey: PolicyKey) => {
    navigateTo('policy', '', policyKey);
  };

  const ensureCheckoutAddress = async () => {
    const selectedAddress = addresses.find(address => address.id === checkoutAddressId) || addresses.find(address => address.isDefault) || addresses[0];
    if (selectedAddress?.id) return selectedAddress.id;
    throw new Error('Add a delivery address before checkout.');
  };

  const handleSaveCheckoutAddress = async (address: Address) => {
    const saved = address.id
      ? await storyApi.updateAddress({ ...address, isDefault: true }, userProfile)
      : await storyApi.createAddress({ ...address, isDefault: true }, userProfile);

    setAddresses(prev => {
      const next = prev.filter(item => item.id !== saved.id).map(item => ({ ...item, isDefault: false }));
      return [{ ...saved, isDefault: true }, ...next];
    });
    setCheckoutAddressId(saved.id || '');
    return saved;
  };

  const handleCompleteAuthPhone = async (phone: string, profile: Partial<UserProfile>) => {
    const nextProfile: UserProfile = {
      firstName: profile.firstName || userProfile.firstName || 'Story',
      lastName: profile.lastName || userProfile.lastName || 'Client',
      email: profile.email || userProfile.email,
      phone,
      language: profile.language || userProfile.language || 'ENGLISH',
      newsletter: profile.newsletter ?? userProfile.newsletter ?? true
    };
    const saved = await storyApi.updateProfile(nextProfile);
    return saved;
  };

  const compileAndSubmitOrder = async (couponCode?: string) => {
    if (cartItems.length === 0 || checkoutBusy) return;

    if (!isLoggedIn) {
      setCheckoutError('');
      setAuthIntent('checkout');
      setActiveScreen('login');
      return;
    }

    setCheckoutBusy(true);
    setCheckoutMessage('Checking delivery details');
    setCheckoutError('');
    setApiNotice('');

    try {
      setCheckoutMessage('Confirming delivery address');
      const addressId = await ensureCheckoutAddress();
      const onlineAvailable = storefrontContent.onlinePaymentEnabled && storefrontContent.razorpayActive;
      if (checkoutPaymentMethod === 'online' && !onlineAvailable) throw new Error('Online payment is currently unavailable.');
      if (checkoutPaymentMethod === 'cod' && !storefrontContent.codEnabled) throw new Error('Pay on delivery is currently unavailable.');

      setCheckoutMessage(checkoutPaymentMethod === 'cod' ? 'Placing pay-on-delivery order' : 'Creating secure payment order');
      const checkout = await storyApi.createOrder(addressId, couponCode, checkoutPaymentMethod);

      if (checkoutPaymentMethod === 'cod' || !checkout.requiresOnlinePayment) {
        setCompiledOrder(checkout.order);
        setCartItems([]);
        setCartOpen(false);
        setCheckoutBusy(false);
        setCheckoutMessage('');
        setCheckoutError('');
        setActiveScreen('confirmation');
        storyApi.getOrders().then(setOrders).catch(() => undefined);
        return;
      }

      setCheckoutMessage('Loading Razorpay checkout');
      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded || !window.Razorpay) {
        throw new Error('Razorpay checkout could not be loaded.');
      }

      if (!checkout.keyId) {
        throw new Error('Razorpay is not configured for this store.');
      }

      let paymentFinished = false;
      setCheckoutMessage('Complete payment in the Razorpay window');

      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: 'STORY India',
        description: checkout.publicId,
        order_id: checkout.razorpayOrderId,
        prefill: {
          name: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
          email: userProfile.email,
          contact: userProfile.phone
        },
        theme: { color: '#111111' },
        handler: async (response: RazorpayPaymentResponse) => {
          paymentFinished = true;
          setCheckoutMessage('Verifying payment');
          try {
            const verifiedOrder = await storyApi.verifyPayment({
              orderId: checkout.publicId || checkout.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            setCompiledOrder(verifiedOrder);
            setCartItems([]);
            setCartOpen(false);
            setCheckoutBusy(false);
            setCheckoutMessage('');
            setCheckoutError('');
            setActiveScreen('confirmation');
            storyApi.getOrders().then(setOrders).catch(() => undefined);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Payment verification failed.';
            setCheckoutError(message);
            setApiNotice(message);
            setCheckoutMessage('');
            setCheckoutBusy(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (!paymentFinished) {
              setCheckoutBusy(false);
              setCheckoutMessage('');
              setCheckoutError('Payment window closed. Your bag is still saved.');
            }
          }
        }
      });

      razorpay.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout could not be started.';
      setApiNotice(message);
      setCheckoutError(message);
      setCheckoutMessage('');
      setCheckoutBusy(false);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setCartOpen(false);
    setActiveScreen('bag');
  };

  const handleFinalCheckout = (couponCode?: string) => {
    if (cartItems.length === 0) return;
    setCheckoutError('');
    compileAndSubmitOrder(couponCode);
  };

  const handleProfileSave = async (nextProfile: UserProfile) => {
    setUserProfile(nextProfile);
    if (!isLoggedIn) return;

    try {
      const saved = await storyApi.updateProfile(nextProfile);
      setUserProfile(prev => ({ ...prev, ...saved }));
    } catch (error) {
      setApiNotice(error instanceof Error ? error.message : 'Could not update profile.');
    }
  };

  const handleSignOut = async () => {
    await storyApi.logout();
    setIsLoggedIn(false);
    setUserProfile(INITIAL_USER_PROFILE);
    setOrders([]);
    setCartItems([]);
    setActiveScreen('shop');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F6F1]" id="story-app-root">
      <Navbar
        activeScreen={activeScreen}
        setActiveScreen={(scr) => {
          if (scr === 'settings') setAccountInitialTab('profile');
          navigateTo(scr);
        }}
        cartCount={cartBadgeCount}
        onCartToggle={() => setCartOpen(prev => !prev)}
        isLoggedIn={isLoggedIn}
      />
      <AnnouncementTicker items={storefrontContent.announcementItems} />

      {apiNotice && (
        <div className="border-b border-[#deded9] bg-white px-4 py-2 text-center font-mono text-[9px] uppercase tracking-widest text-[#555555]">
          {apiNotice}
        </div>
      )}
      <main className="flex-grow">
        {activeScreen === 'shop' && (
          <ShopView
            products={products}
            categories={categories}
            content={storefrontContent}
            onSelectProduct={handleSelectProduct}
            onOpenCategory={handleOpenCategory}
            setActiveScreen={(screen) => navigateTo(screen as ActiveScreen)}
          />
        )}

        {activeScreen === 'about' && (
          <AboutView
            content={storefrontContent}
            setActiveScreen={(screen) => navigateTo(screen)}
          />
        )}

        {activeScreen === 'contact' && (
          <ContactView
            setActiveScreen={(screen) => setActiveScreen(screen)}
            onSubmitRequest={(payload) => storyApi.createContactRequest(payload)}
          />
        )}

          {activeScreen === 'discover' && (
            <DiscoverView
              products={products}
              categories={categories}
              content={storefrontContent}
              onSelectProduct={handleSelectProduct}
            />
          )}

        {activeScreen === 'category' && (
          <CategoryGenderView
            categorySlug={activeCategorySlug}
            categories={categories}
            products={products}
            onBack={() => navigateTo('shop')}
            onOpenCategory={handleOpenCategory}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(product) => {
              const defaultSize = product.sizes?.[0] || 'O/S';
              const defaultColor = product.colors?.[0] || { name: 'Default', hex: '#111111' };
              const combinedId = `${product.id}-${defaultSize}-${defaultColor.name.toLowerCase()}`;
              const existing = cartItems.find(item => item.id === combinedId);
              if (existing) {
                handleUpdateQuantity(combinedId, 1);
              } else {
                setCartItems(prev => [...prev, {
                  id: combinedId,
                  product,
                  selectedSize: defaultSize,
                  selectedColor: defaultColor,
                  quantity: 1
                }]);
              }
            }}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        )}

        {activeScreen === 'detail' && activeProduct && (
          <ProductDetailView
            product={activeProduct}
            products={products}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            cartItems={cartItems}
            onBack={() => setActiveScreen('shop')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activeScreen === 'settings' && (
          isLoggedIn ? (
            <SettingsView
              userProfile={userProfile}
              setUserProfile={handleProfileSave}
              addresses={addresses}
              setAddresses={setAddresses}
              orders={orders}
              onSignOut={handleSignOut}
              initialTab={accountInitialTab}
            />
          ) : (
            <LoginView
              intent="account"
              onBack={() => setActiveScreen('shop')}
              onSignIn={(email, password) => storyApi.login(email, password)}
              onGoogleSignIn={(idToken) => storyApi.googleLogin(idToken)}
              onSignUp={(payload) => storyApi.register(payload)}
              onForgotPassword={(email) => storyApi.forgotPassword(email)}
              googleClientId={googleClientId}
              onCompletePhone={handleCompleteAuthPhone}
              onLoginSuccess={(newProfile, token) => handleAuthenticated(newProfile, token, 'settings')}
            />
          )
        )}

        {activeScreen === 'login' && (
          <LoginView
            intent={authIntent}
            onBack={() => setActiveScreen(authIntent === 'checkout' ? 'bag' : 'shop')}
            onSignIn={(email, password) => storyApi.login(email, password)}
            onGoogleSignIn={(idToken) => storyApi.googleLogin(idToken)}
            onSignUp={(payload) => storyApi.register(payload)}
            onForgotPassword={(email) => storyApi.forgotPassword(email)}
            googleClientId={googleClientId}
            onCompletePhone={handleCompleteAuthPhone}
            onLoginSuccess={(newProfile, token) => handleAuthenticated(newProfile, token, authIntent === 'checkout' ? 'bag' : 'settings')}
          />
        )}

        {activeScreen === 'confirmation' && (
          <OrderConfirmationView
            order={compiledOrder}
            onBackToShopping={() => {
              setCompiledOrder(null);
              setActiveScreen('shop');
            }}
            onViewOrders={() => {
              setAccountInitialTab('orders');
              setActiveScreen('settings');
            }}
          />
        )}

        {activeScreen === 'bag' && (
          <BagView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleFinalCheckout}
            addresses={addresses}
            selectedAddressId={checkoutAddressId}
            onSelectAddress={setCheckoutAddressId}
            onSaveAddress={handleSaveCheckoutAddress}
            paymentMethod={checkoutPaymentMethod}
            onPaymentMethodChange={setCheckoutPaymentMethod}
            onlinePaymentEnabled={storefrontContent.onlinePaymentEnabled && storefrontContent.razorpayActive}
            codEnabled={storefrontContent.codEnabled}
            isLoggedIn={isLoggedIn}
            isCheckingOut={checkoutBusy}
            checkoutMessage={checkoutMessage}
            checkoutError={checkoutError}
            onValidateCoupon={async (code) => {
              const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
              return storyApi.validateCoupon(code, subtotal);
            }}
            onLoginRedirect={() => {
              setAuthIntent('checkout');
              setActiveScreen('login');
            }}
          />
        )}

        {activeScreen === 'policy' && (
          <PolicyView
            policyKey={activePolicyKey}
            content={storefrontContent}
            onBack={() => navigateTo('shop')}
          />
        )}
      </main>

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      <Footer
        setActiveScreen={(scr) => {
          if (scr === 'settings') setAccountInitialTab('profile');
          navigateTo(scr);
        }}
        onOpenPolicy={handleOpenPolicy}
      />
    </div>
  );
}
