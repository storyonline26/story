import React from 'react';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { ActiveScreen } from '../types';

interface NavbarProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  cartCount: number;
  onCartToggle: () => void;
}

const NAV_ITEMS: Array<{ label: string; screen: ActiveScreen; sectionId?: string }> = [
  { label: 'OUR STORY', screen: 'about' },
  { label: 'CURATED DROPS', screen: 'discover' },
  { label: 'SHOP NOW', screen: 'shop', sectionId: 'our-products-section' },
  { label: 'STYLE EDIT', screen: 'discover' },
  { label: 'CONNECT', screen: 'contact' }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  setActiveScreen,
  cartCount,
  onCartToggle
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigate = (screen: ActiveScreen, sectionId?: string) => {
    setActiveScreen(screen);
    setMobileMenuOpen(false);

    if (sectionId) {
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 30);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050505]/95 text-white backdrop-blur-md" id="global-navbar">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-[76px] items-center justify-between lg:h-[88px]">
          <div className="hidden flex-1 items-center gap-8 lg:flex">
            {NAV_ITEMS.slice(0, 3).map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.screen, item.sectionId)}
                className={`font-mono text-[9px] font-medium uppercase tracking-[0.16em] transition hover:text-white ${
                  activeScreen === item.screen ? 'font-semibold text-white' : 'text-white/55'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate('shop')}
            className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center text-center transition hover:opacity-75"
            id="nav-logo-btn"
            aria-label="STORY home"
          >
            <img
              src="/story-logo-candidate.png"
              alt="STORY"
              className="h-20 w-44 scale-110 object-contain brightness-0 invert sm:h-24 sm:w-56 sm:scale-115 lg:h-28 lg:w-64 lg:scale-125"
            />
          </button>

          <div className="hidden flex-1 items-center justify-end gap-8 lg:flex">
            {NAV_ITEMS.slice(3).map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.screen, item.sectionId)}
                className={`font-mono text-[9px] font-medium uppercase tracking-[0.16em] transition hover:text-white ${
                  activeScreen === item.screen ? 'font-semibold text-white' : 'text-white/55'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="flex items-center gap-3 border-l border-white/15 pl-6">
              <button
                type="button"
                onClick={() => navigate('discover')}
                className="p-1 text-white/60 transition hover:text-white"
                aria-label="Search products"
                id="nav-search-btn"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => navigate('settings')}
                className="p-1 text-white/60 transition hover:text-white"
                aria-label="Account"
                id="nav-user-btn"
              >
                <User size={16} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={onCartToggle}
                className="relative p-1 text-white transition hover:opacity-70"
                aria-label="Shopping bag"
                id="nav-cart-btn"
              >
                <ShoppingBag size={16} strokeWidth={1.5} />
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white font-mono text-[9px] text-[#111111]" id="cart-counter">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={onCartToggle}
              className="relative p-1 text-white"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white font-mono text-[8px] text-[#111111]">
                {cartCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="p-1 text-white"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              id="nav-mobile-hamburger"
            >
              {mobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#050505] lg:hidden" id="mobile-menu-drawer">
          <div className="space-y-1 px-6 py-5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.screen, item.sectionId)}
                className="block w-full py-3 text-left font-mono text-[11px] uppercase text-white"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigate('settings')}
              className="block w-full py-3 text-left font-mono text-[11px] uppercase text-white/60"
            >
              Account
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
