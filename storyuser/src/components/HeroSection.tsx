import { ArrowRight } from 'lucide-react';
import { StorefrontContent } from '../types';
import { HeroImageSlider } from './HeroImageSlider';

interface HeroSectionProps {
  content: StorefrontContent;
  onShopEdit: () => void;
  onViewLookbook: () => void;
}

export function HeroSection({ content, onShopEdit, onViewLookbook }: HeroSectionProps) {
  return (
    <section
      className="relative mx-auto flex max-w-[1280px] items-center px-5 sm:px-6 lg:px-8"
      style={{ minHeight: 'min(560px, calc(100vh - 180px))' }}
      id="editorial-hero"
    >
      <div className="grid w-full grid-cols-1 items-center gap-6 py-6 lg:grid-cols-[0.45fr_0.55fr] lg:gap-12 lg:py-0">

        {/* Left: content */}
        <div className="max-w-[480px]">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B625A]">
            {content.heroEyebrow || 'NEW EDITORIAL CAPSULE'}
          </p>

          <h1 className="mt-5 font-display text-[clamp(2.75rem,8vw,6.5rem)] font-black leading-[0.97] text-[#111111]">
            {content.heroTitle || 'Our Latest Story'}
          </h1>

          <p className="mt-5 max-w-[380px] text-[15px] leading-[1.7] text-[#6B625A]">
            {content.heroBody || 'Verified branded fashion, curated in India for everyday premium style.'}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onShopEdit}
              className="group inline-flex h-[52px] items-center gap-3 bg-[#111111] px-7 text-[13px] font-semibold tracking-wide text-white transition hover:bg-black"
            >
              {content.heroPrimaryCta || 'Shop New Arrivals'}
              <ArrowRight size={15} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={onViewLookbook}
              className="group inline-flex h-[52px] items-center gap-3 border border-[#111111] px-7 text-[13px] font-semibold tracking-wide text-[#111111] transition hover:bg-[#111111] hover:text-white"
            >
              {content.heroSecondaryCta || 'View Lookbook'}
              <ArrowRight size={15} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Right: editorial image */}
        <div className="relative min-w-0 lg:flex lg:justify-end">
          <HeroImageSlider
            images={[
              content.heroImagePrimary,
              content.heroImageSecondary,
              content.heroImageDetail,
              content.heroImageFourth,
              content.heroImageFifth,
              content.heroImageSixth
            ]}
          />
        </div>
      </div>
    </section>
  );
}
