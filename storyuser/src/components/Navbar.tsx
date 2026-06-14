import React from 'react';
import { LogIn, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { ActiveScreen } from '../types';
import StoryLogo from './StoryLogo';

interface NavbarProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  cartCount: number;
  onCartToggle: () => void;
  isLoggedIn?: boolean;
}

const LEFT_LINKS: Array<{ label: string; screen: ActiveScreen; sectionId?: string }> = [
  { label: 'Shop', screen: 'shop' },
  { label: 'Categories', screen: 'shop', sectionId: 'our-products-section' },
  { label: 'Collections', screen: 'discover' }
];

const RIGHT_LINKS: Array<{ label: string; screen: ActiveScreen }> = [
  { label: 'Our Story', screen: 'about' },
  { label: 'Contact', screen: 'contact' }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  setActiveScreen,
  cartCount,
  onCartToggle,
  isLoggedIn = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (screen: ActiveScreen, sectionId?: string) =>
    screen === activeScreen && !sectionId;

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
    <nav className="sticky top-0 z-50 w-full bg-[#111111]" id="global-navbar">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-8">
        {/* Desktop layout */}
        <div className="hidden h-[72px] items-center justify-between lg:flex">
          {/* Left links */}
          <div className="flex items-center gap-7">
            {LEFT_LINKS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.screen, item.sectionId)}
                className={`relative py-2 text-[13px] font-medium tracking-wide transition duration-200 ${
                  isActive(item.screen, item.sectionId)
                    ? 'text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Center logo */}
          <button
            type="button"
            onClick={() => navigate('shop')}
            className="flex flex-col items-center transition duration-200 hover:opacity-80"
            aria-label="STORY home"
            id="nav-logo-btn"
          >
            <StoryLogo />
          </button>

          {/* Right links + icons */}
          <div className="flex items-center gap-7">
            {RIGHT_LINKS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.screen)}
                className={`relative py-2 text-[13px] font-medium tracking-wide transition duration-200 ${
                  isActive(item.screen)
                    ? 'text-white after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="ml-2 flex items-center gap-1 border-l border-white/15 pl-5">
              <button
                type="button"
                onClick={() => navigate('discover')}
                className="flex h-11 w-11 items-center justify-center rounded-full text-white/60 transition duration-200 hover:bg-white/10 hover:text-white"
                aria-label="Search"
              >
                <Search size={18} strokeWidth={1.6} />
              </button>
              <button
                type="button"
                onClick={() => navigate('settings')}
                className="flex h-11 w-11 items-center justify-center rounded-full text-white/60 transition duration-200 hover:bg-white/10 hover:text-white"
                aria-label="Account"
              >
                <User size={18} strokeWidth={1.6} />
              </button>
              <button
                type="button"
                onClick={onCartToggle}
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-white transition duration-200 hover:bg-white/10"
                aria-label="Shopping bag"
              >
                <ShoppingBag size={18} strokeWidth={1.6} />
                <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#111111]">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex h-[60px] items-center justify-between lg:hidden">
          {/* Left spacer for centering */}
          <div className="flex items-center gap-1 w-[100px]">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center text-white"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>

          {/* Center logo */}
          <button
            type="button"
            onClick={() => navigate('shop')}
            className="absolute left-1/2 -translate-x-1/2 flex items-center"
            aria-label="STORY home"
            id="nav-logo-btn-mobile"
          >
            <StoryLogo />
          </button>

          {/* Right icons */}
          <div className="flex items-center gap-1 w-[100px] justify-end">
            <button
              type="button"
              onClick={() => navigate('discover')}
              className="flex h-11 w-11 items-center justify-center text-white/70"
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            {!isLoggedIn && (
              <button
                type="button"
                onClick={() => navigate('settings')}
                className="flex h-11 w-11 items-center justify-center text-white/70 transition hover:text-white"
                aria-label="Login"
              >
                <LogIn size={20} strokeWidth={1.5} />
              </button>
            )}
            <button
              type="button"
              onClick={onCartToggle}
              className="relative flex h-11 w-11 items-center justify-center text-white"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute right-1 top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-white px-0.5 text-[9px] font-bold text-[#111111]">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - slide from left */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Drawer */}
        <div
          className={`absolute left-0 top-0 h-full w-[280px] bg-[#111111] shadow-2xl transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          id="mobile-menu-drawer"
        >
          <div className="flex h-[60px] items-center justify-between border-b border-white/10 px-5">
            <span className="font-display text-lg font-black text-white">STORY</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center text-white/70"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          <div className="px-5 py-4">
            {[...LEFT_LINKS, ...RIGHT_LINKS].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.screen, (item as any).sectionId)}
                className="flex h-12 w-full items-center border-b border-white/8 text-left text-[15px] font-medium text-white/90"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigate('settings')}
              className="flex h-12 w-full items-center text-left text-[15px] font-medium text-white/60"
            >
              {isLoggedIn ? 'Account' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
