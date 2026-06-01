import React from 'react';

const brandLogos = [
  { name: 'Versace', src: '/brand-logos/versace.svg' },
  { name: 'Karl Lagerfeld', src: '/brand-logos/karl-lagerfeld.png' },
  { name: 'Lacoste', src: '/brand-logos/lacoste.png' },
  { name: 'Superdry', src: '/brand-logos/superdry.svg' },
  { name: 'Tommy Hilfiger', src: '/brand-logos/tommy-hilfiger.svg' },
  { name: 'Burberry', src: '/brand-logos/burberry.svg' },
  { name: 'True Religion', src: '/brand-logos/true-religion.svg' },
  { name: 'Rare Rabbit', src: '/brand-logos/rare-rabbit.png' },
  { name: 'Blackberrys', src: '/brand-logos/blackberrys.png' },
  { name: 'Zara', src: '/brand-logos/zara.svg' },
  { name: 'Calvin Klein', src: '/brand-logos/calvin-klein.png' },
  { name: 'Michael Kors', src: '/brand-logos/michael-kors.svg' },
  { name: 'Hugo Boss', src: '/brand-logos/hugo-boss.svg' },
  { name: 'Ralph Lauren', src: '/brand-logos/ralph-lauren.svg' }
];

export function BrandLogoMarquee() {
  const [missingLogos, setMissingLogos] = React.useState<Set<string>>(() => new Set());
  const visibleLogos = brandLogos.filter((brand) => !missingLogos.has(brand.src));
  const marqueeBrands = [...visibleLogos, ...visibleLogos];

  return (
    <section className="w-full overflow-hidden border-y border-[#deded9] bg-white" aria-label="Featured brands">
      <div className="brand-marquee flex w-max items-center py-4 sm:py-5 lg:py-6">
        {marqueeBrands.map((brand, index) => (
          <span
            key={`${brand.name}-${index}`}
            className="mx-5 flex h-10 w-28 shrink-0 items-center justify-center sm:mx-8 sm:h-12 sm:w-36 lg:mx-11 lg:h-14 lg:w-40"
          >
            <img
              src={brand.src}
              alt={`${brand.name} logo`}
              className="max-h-8 max-w-full object-contain grayscale contrast-125 opacity-70 transition duration-300 hover:opacity-100 sm:max-h-10 lg:max-h-12"
              loading="lazy"
              onError={() => {
                setMissingLogos((current) => {
                  const next = new Set(current);
                  next.add(brand.src);
                  return next;
                });
              }}
            />
          </span>
        ))}
      </div>
    </section>
  );
}
