import React from 'react';

interface HeroImageSliderProps {
  images?: string[];
}

const FALLBACK_SLIDES = [
  { src: '/ChatGPT Image Jun 1, 2026, 07_53_36 PM (1).png', alt: 'STORY editorial hero 1' },
  { src: '/ChatGPT Image Jun 1, 2026, 07_53_37 PM (2).png', alt: 'STORY editorial hero 2' },
  { src: '/ChatGPT Image Jun 1, 2026, 07_53_38 PM (3).png', alt: 'STORY editorial hero 3' },
  { src: '/ChatGPT Image Jun 1, 2026, 07_53_39 PM (4).png', alt: 'STORY editorial hero 4' },
  { src: '/ChatGPT Image Jun 1, 2026, 07_53_39 PM (5).png', alt: 'STORY editorial hero 5' },
  { src: '/ChatGPT Image Jun 1, 2026, 07_53_41 PM (6).png', alt: 'STORY editorial hero 6' }
];

export function HeroImageSlider({ images = [] }: HeroImageSliderProps) {
  const slides = React.useMemo(() => {
    const configured = images.map((s) => s?.trim()).filter(Boolean);
    if (configured.length > 0) {
      return configured.map((src, i) => ({ src, alt: `STORY editorial hero ${i + 1}` }));
    }
    return FALLBACK_SLIDES;
  }, [images]);

  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((c) => (c + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full max-w-[520px] mx-auto lg:max-w-none lg:ml-auto overflow-hidden">
      {/* Subtle depth frame */}
      <div className="absolute -inset-3 hidden rounded-sm bg-[#EFECE6] lg:block" />

      {/* Main image container */}
      <div className="relative aspect-[3/4] w-full max-h-[500px] overflow-hidden border border-[#DDD8CF] bg-[#EFECE6]">
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
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show image ${index + 1}`}
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
