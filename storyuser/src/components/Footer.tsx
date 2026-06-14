import React from 'react';
import { Facebook, Instagram, Mail, MessageCircle } from 'lucide-react';
import { ActiveScreen } from '../types';
import { PolicyKey } from './PolicyView';

interface FooterProps {
  setActiveScreen: (screen: ActiveScreen) => void;
  onOpenPolicy: (policyKey: PolicyKey) => void;
}

type FooterLink = {
  label: string;
  screen?: ActiveScreen;
  sectionId?: string;
  policyKey?: PolicyKey;
};

const SHOP_LINKS: FooterLink[] = [
  { label: 'New Arrivals', screen: 'shop', sectionId: 'our-products-section' },
  { label: 'Uppers', screen: 'shop', sectionId: 'our-products-section' },
  { label: 'Lowers', screen: 'shop', sectionId: 'our-products-section' },
  { label: 'Dresses', screen: 'shop', sectionId: 'our-products-section' },
  { label: 'Co-ords', screen: 'shop', sectionId: 'our-products-section' },
  { label: 'Footwear', screen: 'shop', sectionId: 'our-products-section' },
  { label: 'Accessories', screen: 'shop', sectionId: 'our-products-section' }
];

const STORY_LINKS: FooterLink[] = [
  { label: 'Our Story', screen: 'about' },
  { label: 'Collections', screen: 'discover' },
  { label: 'Style Edit', screen: 'discover' },
  { label: 'Customer Reviews', screen: 'shop' }
];

const SUPPORT_LINKS: FooterLink[] = [
  { label: 'Contact Us', screen: 'contact' },
  { label: 'Shipping & Delivery', screen: 'contact' },
  { label: 'Returns & Exchange', policyKey: 'returns' },
  { label: 'Size Guide', screen: 'contact' },
  { label: 'FAQ', screen: 'contact' },
  { label: 'Track Order', screen: 'settings' }
];

const LEGAL_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', policyKey: 'privacy' },
  { label: 'Terms & Conditions', policyKey: 'terms' },
  { label: 'Return Policy', policyKey: 'returns' }
];

export const Footer: React.FC<FooterProps> = ({ setActiveScreen, onOpenPolicy }) => {
  const handleLink = (link: FooterLink) => {
    if (link.policyKey) { onOpenPolicy(link.policyKey); return; }
    if (link.screen) setActiveScreen(link.screen);
    if (link.sectionId) {
      window.setTimeout(() => {
        document.getElementById(link.sectionId!)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 30);
    }
  };

  const LinkItem = ({ link }: { link: FooterLink }) => (
    <li>
      <button
        type="button"
        onClick={() => handleLink(link)}
        className="text-[14px] leading-relaxed text-[#6B625A] transition duration-200 hover:text-[#111111]"
      >
        {link.label}
      </button>
    </li>
  );

  const ColumnTitle = ({ children }: { children: string }) => (
    <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#111111]">
      {children}
    </h3>
  );

  return (
    <footer className="border-t border-[#DDD8CF] bg-[#F8F6F1]" id="global-footer">
      <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-6 lg:px-8 lg:py-20">

        {/* Desktop: 5-column grid */}
        <div className="hidden gap-8 lg:grid lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <button
              type="button"
              onClick={() => setActiveScreen('shop')}
              className="font-display text-3xl font-black tracking-tight text-[#111111] transition hover:opacity-70"
              aria-label="STORY home"
            >
              STORY
            </button>
            <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.2em] text-[#6B625A]">
              India · Est. 2026
            </p>
            <p className="mt-5 max-w-[240px] text-[14px] leading-relaxed text-[#6B625A]">
              Verified branded fashion, curated in India for everyday premium style.
            </p>

            {/* STORY Verified Seal */}
            <div className="relative mt-6 flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#111111]" />
              <div className="absolute inset-1.5 rounded-full border border-[#111111]/50" />
              <svg className="absolute inset-0 h-full w-full animate-[spin_20s_linear_infinite]" viewBox="0 0 200 200">
                <defs>
                  <path id="footerSealCircle" d="M100,100 m-68,0 a68,68 0 1,1 136,0 a68,68 0 1,1 -136,0" fill="none" />
                </defs>
                <text className="fill-[#111111]" style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  <textPath href="#footerSealCircle" startOffset="0%">Verified authentic • 100% original • Best price &amp; quality • </textPath>
                </text>
              </svg>
              <div className="flex flex-col items-center">
                <span className="font-display text-sm font-black tracking-[0.06em] text-[#111111]">STORY</span>
                <span className="text-[6px] font-medium uppercase tracking-[0.15em] text-[#6B625A]">Verified</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDD8CF] text-[#6B625A] transition hover:border-[#111111] hover:bg-[#111111] hover:text-white" aria-label="Instagram">
                <Instagram size={16} strokeWidth={1.6} />
              </a>
              <button type="button" onClick={() => setActiveScreen('contact')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDD8CF] text-[#6B625A] transition hover:border-[#111111] hover:bg-[#111111] hover:text-white" aria-label="WhatsApp">
                <MessageCircle size={16} strokeWidth={1.6} />
              </button>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDD8CF] text-[#6B625A] transition hover:border-[#111111] hover:bg-[#111111] hover:text-white" aria-label="Facebook">
                <Facebook size={16} strokeWidth={1.6} />
              </a>
              <button type="button" onClick={() => setActiveScreen('contact')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDD8CF] text-[#6B625A] transition hover:border-[#111111] hover:bg-[#111111] hover:text-white" aria-label="Email">
                <Mail size={16} strokeWidth={1.6} />
              </button>
            </div>
          </div>

          {/* Shop */}
          <nav aria-label="Shop links">
            <ColumnTitle>Shop</ColumnTitle>
            <ul className="space-y-3">{SHOP_LINKS.map((l) => <LinkItem key={l.label} link={l} />)}</ul>
          </nav>

          {/* Story */}
          <nav aria-label="Story links">
            <ColumnTitle>Story</ColumnTitle>
            <ul className="space-y-3">{STORY_LINKS.map((l) => <LinkItem key={l.label} link={l} />)}</ul>
          </nav>

          {/* Support */}
          <nav aria-label="Support links">
            <ColumnTitle>Support</ColumnTitle>
            <ul className="space-y-3">{SUPPORT_LINKS.map((l) => <LinkItem key={l.label} link={l} />)}</ul>
          </nav>

          {/* Connect */}
          <div>
            <ColumnTitle>Connect</ColumnTitle>
            <p className="text-[14px] leading-relaxed text-[#6B625A]">
              Need help with size, styling, delivery, or product questions? We're here.
            </p>
            <div className="mt-5 space-y-2 text-[13px] text-[#6B625A]">
              <p><span className="font-medium text-[#111111]">WhatsApp:</span> +91 98765 43210</p>
              <p><span className="font-medium text-[#111111]">Email:</span> care@story.in</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveScreen('contact')}
              className="mt-5 inline-flex items-center gap-2 border border-[#111111] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#111111] transition hover:bg-[#111111] hover:text-white"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Mobile: accordion */}
        <div className="space-y-0 lg:hidden">
          <div className="mb-8">
            <span className="font-display text-2xl font-black tracking-tight text-[#111111]">STORY</span>
            <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.15em] text-[#6B625A]">India · Est. 2026</p>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[#6B625A]">
              Verified branded fashion, curated in India for everyday premium style.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDD8CF] text-[#6B625A]" aria-label="Instagram"><Instagram size={16} /></a>
              <button type="button" onClick={() => setActiveScreen('contact')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDD8CF] text-[#6B625A]" aria-label="WhatsApp"><MessageCircle size={16} /></button>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDD8CF] text-[#6B625A]" aria-label="Facebook"><Facebook size={16} /></a>
              <button type="button" onClick={() => setActiveScreen('contact')} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDD8CF] text-[#6B625A]" aria-label="Email"><Mail size={16} /></button>
            </div>

            {/* STORY Verified Seal - Mobile */}
            <div className="relative mt-6 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#111111]" />
              <div className="absolute inset-1.5 rounded-full border border-[#111111]/50" />
              <svg className="absolute inset-0 h-full w-full animate-[spin_20s_linear_infinite]" viewBox="0 0 200 200">
                <defs>
                  <path id="mobileSealCircle" d="M100,100 m-68,0 a68,68 0 1,1 136,0 a68,68 0 1,1 -136,0" fill="none" />
                </defs>
                <text className="fill-[#111111]" style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  <textPath href="#mobileSealCircle" startOffset="0%">Verified authentic • 100% original • Best price &amp; quality • </textPath>
                </text>
              </svg>
              <div className="flex flex-col items-center">
                <span className="font-display text-xs font-black tracking-[0.06em] text-[#111111]">STORY</span>
                <span className="text-[5px] font-medium uppercase tracking-[0.12em] text-[#6B625A]">Verified</span>
              </div>
            </div>
          </div>

          {[
            { title: 'Shop', links: SHOP_LINKS },
            { title: 'Story', links: STORY_LINKS },
            { title: 'Support', links: SUPPORT_LINKS }
          ].map((section) => (
            <details key={section.title} className="group border-t border-[#DDD8CF]">
              <summary className="flex cursor-pointer items-center justify-between py-5 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#111111]">
                {section.title}
                <span className="text-lg text-[#6B625A] transition group-open:rotate-45">+</span>
              </summary>
              <ul className="space-y-3 pb-5">
                {section.links.map((l) => <LinkItem key={l.label} link={l} />)}
              </ul>
            </details>
          ))}

          <div className="border-t border-[#DDD8CF] pt-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#111111]">Connect</p>
            <div className="mt-3 space-y-1 text-[13px] text-[#6B625A]">
              <p>WhatsApp: +91 98765 43210</p>
              <p>Email: care@story.in</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveScreen('contact')}
              className="mt-4 border border-[#111111] px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#111111]"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-[#DDD8CF] pt-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[12px] text-[#6B625A]">© 2026 STORY India. All rights reserved.</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Legal">
            {LEGAL_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleLink(link)}
                className="text-[12px] text-[#6B625A] transition hover:text-[#111111]"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};
