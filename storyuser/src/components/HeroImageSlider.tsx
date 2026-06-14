import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroImageSliderProps {
  images?: string[];
}

const FALLBACK_SLIDES = [
  { src: '/ChatGPT Image Jun 1, 2026, 07_53_36 PM (1).png', alt: 'STORY editorial hero image 1' },
  { src: '/ChatGPT Image Jun 1, 2026, 07_53_37 PM (2).png', alt: 'STORY editorial hero image 2' },
  { src: '/ChatGPT Image Jun 1, 2026, 07_53_38 PM (3).png', alt: 'STORY editorial hero image 3' },
  { src: '/ChatGPT Image Jun 1, 2026, 07_53_39 PM (4).png', alt: 'Male model in minimal luxury fashion campaign' },
  { src: '/ChatGPT Image Jun 1, 2026, 07_53_39 PM (5).png', alt: 'Female model in grayscale international magazine styling' },
  { src: '/ChatGPT Image Jun 1, 2026, 07_53_41 PM (6).png', alt: 'Male model in monochrome STORY editorial look' }
];

export function HeroImageSlider({ images = [] }: HeroImageSliderProps) {
  const slides = React.useMemo(() => {
    const configured = images.map((s) => s?.trim()).filter(Boolean);
    if (configured.length > 0) {
      return configured.map((src, i) => ({ src, alt: `STORY editorial hero image ${i + 1}` }));
    }
    return FALLBACK_SLIDES;
  }, [images]);

  const [activeIndex, setActiveIndex] = React.useState(0);
  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);

  // Auto-swipe every 4 seconds
  React.useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((c) => (c + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(activeIndex + 1);
      else goTo(activeIndex - 1);
    }
  };

  return (
    <div
      className="relative w-full max-w-[520px] mx-auto lg:max-w-none lg:ml-auto overflow-hidden"
      aria-label="STORY editorial image slider"
    >
      {/* Subtle depth frame */}
      <div className="absolute -inset-3 hidden rounded-sm bg-[#EFECE6] lg:block" />

      {/* Main image container with swipe */}
      <div
        className="relative aspect-[3/4] w-full max-h-[500px] overflow-hidden border border-[#DDD8CF] bg-[#EFECE6]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className={`absolute inset-0 h-full w-full object-cover object-[center_top] transition-opacity duration-1000 ease-out ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
            loading={index === 0 ? 'eager' : 'lazy'}
            referrerPolicy="no-referrer"
          />
        ))}

        {/* Arrow buttons */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#111111] shadow-sm backdrop-blur-sm transition hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#111111] shadow-sm backdrop-blur-sm transition hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show editorial image ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-6 bg-[#111111]' : 'w-1.5 bg-[#DDD8CF] hover:bg-[#6B625A]'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
