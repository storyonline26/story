import React from 'react';
import {
  ArrowRight,
  ChevronDown,
  PackageSearch,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Truck,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Category, Product, StorefrontContent } from '../types';
import { formatINR } from '../utils/currency';

interface DiscoverViewProps {
  onSelectProduct: (product: Product) => void;
  products?: Product[];
  categories?: Category[];
  content: StorefrontContent;
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular' | 'best-match';
type FilterMenu = 'category' | 'size' | 'brand' | 'sort' | null;

const BRAND_OPTIONS = [
  'All',
  'Versace',
  'Karl Lagerfeld',
  'Lacoste',
  'Superdry',
  'Tommy Hilfiger',
  'Burberry',
  'True Religion',
  'Rare Rabbit',
  'Blackberrys',
  'Zara',
  'Calvin Klein',
  'Michael Kors',
  'Hugo Boss',
  'Ralph Lauren'
];

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest',
  'price-low': 'Price Low to High',
  'price-high': 'Price High to Low',
  popular: 'Most Popular',
  'best-match': 'Best Match'
};

const FALLBACK_CATEGORY_IMAGES = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85'
];

const normalize = (value = '') =>
  value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const singular = (value = '') => normalize(value).replace(/ies$/, 'y').replace(/s$/, '');

const titleCase = (value = '') =>
  value.toLowerCase().replace(/\b[a-z]/g, (match) => match.toUpperCase());

const countLabel = (count: number, singularLabel: string, pluralLabel: string) =>
  `${count} ${count === 1 ? singularLabel : pluralLabel}`;

const productMatchesKey = (product: Product, key: string) => product.id === key || product.slug === key;

const productBrandText = (product: Product) => `${product.name} ${product.description || ''} ${product.composition || ''}`.toLowerCase();

const productMatchesCategory = (product: Product, category: Category) => {
  const productCategory = normalize(product.category);
  const productCategorySingular = singular(product.category);
  const categoryName = normalize(category.name);
  const categoryNameSingular = singular(category.name);
  const categorySlug = normalize(category.slug);
  const categorySlugSingular = singular(category.slug);

  return String(product.categoryId || '') === String(category.id)
    || productCategory === categoryName
    || productCategory === categorySlug
    || productCategorySingular === categoryNameSingular
    || productCategorySingular === categorySlugSingular;
};

const buildProductCategories = (products: Product[]): Category[] => {
  const names = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));

  return names.map((name, index) => ({
    id: `product-category-${normalize(name)}`,
    name: titleCase(name),
    slug: normalize(name),
    description: `Explore ${titleCase(name)} pieces from the current collection.`,
    image: '',
    isActive: true,
    productCount: products.filter((product) => normalize(product.category) === normalize(name)).length,
    sortOrder: index,
    isDynamic: true
  }));
};

const getCategoryCount = (category: Category, products: Product[]) => {
  const matchedCount = products.filter((product) => productMatchesCategory(product, category)).length;
  return category.productCount > 0 ? category.productCount : matchedCount;
};

const hasDiscount = (product: Product) =>
  typeof product.originalPrice === 'number' && product.originalPrice > product.price;

function SelectDropdown({
  label,
  value,
  options,
  active,
  onToggle,
  onSelect,
  align = 'left'
}: {
  label: string;
  value: string;
  options: string[];
  active: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  align?: 'left' | 'right';
}) {
  const isActiveValue = value !== 'All' && value !== 'Newest';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-11 w-full items-center justify-between gap-3 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.13em] transition sm:w-auto ${
          isActiveValue
            ? 'border-[#111111] bg-[#111111] text-white'
            : 'border-[#d7d4cc] bg-white text-[#4f4c45] hover:border-[#111111] hover:text-[#111111]'
        }`}
        aria-label={`${label} filter`}
      >
        <span className="truncate">
          {label}: <span className="font-semibold">{value}</span>
        </span>
        <ChevronDown size={13} strokeWidth={1.7} className={`shrink-0 transition ${active ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className={`absolute top-12 z-40 max-h-72 w-64 overflow-auto rounded-lg border border-[#111111] bg-white py-1 shadow-lg ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className={`block w-full px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] transition hover:bg-[#f2f4f0] ${
                  value === option ? 'bg-[#111111] text-white' : 'text-[#4f4c45]'
                }`}
              >
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CategoryCard: React.FC<{
  category: Category;
  selected: boolean;
  count: number;
  fallbackImage: string;
  onClick: () => void;
}> = ({ category, selected, count, fallbackImage, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group grid min-w-[238px] grid-cols-[94px_minmax(0,1fr)] overflow-hidden rounded-lg border bg-white text-left shadow-sm transition sm:min-w-0 ${
      selected ? 'border-[#111111]' : 'border-[#d8d3ca] hover:border-[#111111]'
    }`}
  >
    <span className="relative block h-28 overflow-hidden bg-[#e7e9e4]">
      <img
        src={category.image || fallbackImage}
        alt={category.name}
        className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
        loading="lazy"
      />
      <span className="absolute inset-0 bg-black/10" />
    </span>
    <span className="flex min-w-0 flex-col justify-between p-4">
      <span>
        <span className="block font-mono text-[9px] uppercase tracking-widest text-[#6f6b62]">
          Category
        </span>
        <span className="mt-1 block truncate text-base font-semibold uppercase text-[#111111]">
          {category.name}
        </span>
        {category.description && (
          <span className="mt-1 block line-clamp-2 text-xs leading-5 text-[#5f5b52]">
            {category.description}
          </span>
        )}
      </span>
      <span className="mt-3 flex items-center justify-between gap-3 border-t border-[#ece9e1] pt-3 font-mono text-[9px] uppercase tracking-widest text-[#5f5b52]">
        {count > 0 ? countLabel(count, 'piece', 'pieces') : 'Coming soon'}
        <ArrowRight size={13} />
      </span>
    </span>
  </button>
);

const ProductCard: React.FC<{
  product: Product;
  categories: Category[];
  fallbackImage: string;
  onSelectProduct: (product: Product) => void;
}> = ({ product, categories, fallbackImage, onSelectProduct }) => {
  const productCategory = categories.find((category) => productMatchesCategory(product, category));
  const categoryImage = productCategory?.image || fallbackImage;
  const imageCandidates = React.useMemo(
    () => Array.from(new Set([product.image, product.secondaryImage, ...(product.listImages || []), categoryImage, fallbackImage].filter(Boolean))),
    [categoryImage, fallbackImage, product.image, product.listImages, product.secondaryImage]
  );
  const [imageIndex, setImageIndex] = React.useState(0);
  const [imageUnavailable, setImageUnavailable] = React.useState(false);
  const currentImage = imageCandidates[imageIndex];
  const colorName = product.colors && product.colors.length > 0 ? product.colors[0].name : 'Core shade';
  const discounted = hasDiscount(product);
  const discountPercent = discounted ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

  React.useEffect(() => {
    setImageIndex(0);
    setImageUnavailable(false);
  }, [product.id, imageCandidates]);

  const handleImageError = () => {
    if (imageIndex < imageCandidates.length - 1) {
      setImageIndex((index) => index + 1);
      return;
    }
    setImageUnavailable(true);
  };

  return (
    <button
      type="button"
      onClick={() => onSelectProduct(product)}
      className="group overflow-hidden rounded-lg border border-[#d8d3ca] bg-white text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#111111] hover:shadow-md"
      id={`discover-card-${product.id}`}
    >
      <span className="relative block aspect-[3/4] overflow-hidden bg-[#e7e9e4]">
        {!imageUnavailable && currentImage ? (
          <img
            src={currentImage}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#eef2ed] px-4 text-center">
            <PackageSearch size={24} strokeWidth={1.4} className="text-[#111111]" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#5f5b52]">
              Image preview coming soon
            </span>
          </span>
        )}
        {discounted && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 font-mono text-[9px] uppercase tracking-widest text-[#111111] shadow-sm">
            {discountPercent}% off
          </span>
        )}
      </span>
      <span className="block p-3 sm:p-4">
        <span className="flex min-w-0 flex-col gap-3">
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold uppercase text-[#111111] sm:text-sm">{product.name}</span>
            <span className="mt-1 block truncate font-mono text-[9px] uppercase tracking-widest text-[#6f6b62]">
              {productCategory?.name || product.category}
            </span>
          </span>

          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono text-sm font-semibold text-[#111111] sm:text-base">{formatINR(product.price)}</span>
            {discounted && (
              <>
                <span className="font-mono text-[11px] text-[#8b877e] line-through">{formatINR(product.originalPrice!)}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#2f6d3f]">Save {discountPercent}%</span>
              </>
            )}
          </span>
        </span>
        <span className="mt-3 flex items-center justify-between gap-2 border-t border-[#ece9e1] pt-3 font-mono text-[8px] uppercase tracking-widest text-[#6f6b62]">
          <span className="min-w-0 truncate">{product.sizes ? product.sizes.slice(0, 4).join(' / ') : 'O/S'}</span>
          <span className="hidden min-w-0 truncate text-right sm:block">{colorName}</span>
          <ArrowRight size={12} className="shrink-0 text-[#111111]" />
        </span>
      </span>
    </button>
  );
};

export const DiscoverView: React.FC<DiscoverViewProps> = ({ onSelectProduct, products, categories = [], content }) => {
  const rawProductSource = products && products.length > 0 ? products : [];
  const productSource = React.useMemo(() => {
    if (content.collectionProductIds.length === 0) return rawProductSource;
    const selected = content.collectionProductIds
      .map((id) => rawProductSource.find((product) => productMatchesKey(product, id)))
      .filter((product): product is Product => Boolean(product));
    return selected.length > 0 ? selected : rawProductSource;
  }, [rawProductSource, content.collectionProductIds]);

  const categoryOptions = React.useMemo(() => {
    const adminCategories = categories
      .filter((category) => category.isActive !== false)
      .slice()
      .sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name));

    return adminCategories.length > 0 ? adminCategories : buildProductCategories(productSource);
  }, [categories, productSource]);

  const params = React.useMemo(() => new URLSearchParams(window.location.search), []);
  const initialCategory = params.get('category') || 'all';
  const [searchQuery, setSearchQuery] = React.useState(params.get('q') || '');
  const [selectedCategory, setSelectedCategory] = React.useState(initialCategory);
  const [selectedSize, setSelectedSize] = React.useState(params.get('size') || 'All');
  const [selectedBrand, setSelectedBrand] = React.useState(params.get('brand') || 'All');
  const [sortBy, setSortBy] = React.useState<SortOption>((params.get('sort') as SortOption) || 'newest');
  const [activeDropdown, setActiveDropdown] = React.useState<FilterMenu>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const activeCategory = selectedCategory === 'all'
    ? null
    : categoryOptions.find((category) => category.slug === selectedCategory || category.id === selectedCategory || normalize(category.name) === normalize(selectedCategory)) || null;

  React.useEffect(() => {
    if (selectedCategory === 'all') return;
    if (!activeCategory && categoryOptions.length > 0) setSelectedCategory('all');
  }, [activeCategory, categoryOptions.length, selectedCategory]);

  React.useEffect(() => {
    const nextParams = new URLSearchParams();
    if (searchQuery) nextParams.set('q', searchQuery);
    if (selectedCategory !== 'all') nextParams.set('category', selectedCategory);
    if (selectedSize !== 'All') nextParams.set('size', selectedSize);
    if (selectedBrand !== 'All') nextParams.set('brand', selectedBrand);
    if (sortBy !== 'newest') nextParams.set('sort', sortBy);

    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery ? `/collections?${nextQuery}` : '/collections';
    if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
      window.history.replaceState({}, '', nextUrl);
    }
  }, [searchQuery, selectedBrand, selectedCategory, selectedSize, sortBy]);

  const categoryCounts = React.useMemo(() => {
    const entries = categoryOptions.map((category) => [
      category.slug,
      getCategoryCount(category, productSource)
    ] as const);
    return new Map(entries);
  }, [categoryOptions, productSource]);

  const categoryProductsForSizes = React.useMemo(() => (
    activeCategory ? productSource.filter((product) => productMatchesCategory(product, activeCategory)) : productSource
  ), [activeCategory, productSource]);

  const sizeOptions = React.useMemo(
    () => Array.from(new Set(categoryProductsForSizes.flatMap((product) => product.sizes || []))),
    [categoryProductsForSizes]
  );

  const setCategoryFilter = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setSelectedSize('All');
    setActiveDropdown(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSize('All');
    setSelectedBrand('All');
    setSortBy('newest');
    setActiveDropdown(null);
    setMobileFiltersOpen(false);
  };

  const filteredProducts = React.useMemo(() => {
    let result = [...productSource];
    const query = searchQuery.trim().toLowerCase();

    if (activeCategory) {
      result = result.filter((product) => productMatchesCategory(product, activeCategory));
    }

    if (selectedSize !== 'All') {
      result = result.filter((product) => product.sizes?.includes(selectedSize));
    }

    if (selectedBrand !== 'All') {
      const brand = selectedBrand.toLowerCase();
      result = result.filter((product) => productBrandText(product).includes(brand));
    }

    if (query) {
      result = result.filter((product) => (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.sizes?.some((size) => size.toLowerCase().includes(query)) ||
        productBrandText(product).includes(query)
      ));
    }

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'popular') result.sort((a, b) => (b.stock || 0) - (a.stock || 0));
    if (sortBy === 'best-match' && query) {
      result.sort((a, b) => Number(b.name.toLowerCase().startsWith(query)) - Number(a.name.toLowerCase().startsWith(query)));
    }

    return result;
  }, [activeCategory, productSource, searchQuery, selectedBrand, selectedSize, sortBy]);

  const categoryDropdownOptions = ['All', ...categoryOptions.map((category) => category.name)];
  const categoryValue = activeCategory?.name || 'All';
  const sizeDropdownOptions = ['All', ...sizeOptions];
  const sortOptions = Object.values(SORT_LABELS);
  const sortValue = SORT_LABELS[sortBy];
  const canClearFilters = Boolean(searchQuery || selectedCategory !== 'all' || selectedSize !== 'All' || selectedBrand !== 'All' || sortBy !== 'newest');
  const activeFilterCount = [searchQuery, selectedCategory !== 'all', selectedSize !== 'All', selectedBrand !== 'All', sortBy !== 'newest'].filter(Boolean).length;
  const heroImage = content.collectionImage || categoryOptions.find((category) => category.image)?.image || FALLBACK_CATEGORY_IMAGES[0];

  const selectCategoryByLabel = (label: string) => {
    if (label === 'All') {
      setCategoryFilter('all');
      return;
    }

    const category = categoryOptions.find((item) => item.name === label);
    setCategoryFilter(category?.slug || 'all');
  };

  const selectSortByLabel = (label: string) => {
    const nextSort = (Object.entries(SORT_LABELS).find(([, value]) => value === label)?.[0] || 'newest') as SortOption;
    setSortBy(nextSort);
    setActiveDropdown(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      id="discover-view-container"
      className="bg-[#f7f7f4] pb-16 text-[#111111] sm:pb-20"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        {/* Compact search + filters header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#111111] sm:text-2xl">Collections</h1>
            <p className="text-[12px] text-[#6B625A]">{countLabel(filteredProducts.length, 'product', 'products')} found</p>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B625A]" />
            <input
              type="text"
              placeholder={content.discoverSearchPlaceholder || 'Search products, categories...'}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 w-full rounded-full border border-[#DDD8CF] bg-white pl-9 pr-4 text-[13px] text-[#111111] placeholder:text-[#8b877e] outline-none focus:border-[#111111]"
              id="discover-search-input"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B625A]">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category chips - compact horizontal scroll */}
        <div className="mt-4 scrollbar-hide flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`h-9 shrink-0 rounded-full border px-4 text-[11px] font-medium transition ${selectedCategory === 'all' ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#DDD8CF] bg-white text-[#6B625A] hover:border-[#111111]'}`}
          >
            All ({productSource.length})
          </button>
          {categoryOptions.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategoryFilter(category.slug)}
              className={`h-9 shrink-0 rounded-full border px-4 text-[11px] font-medium transition ${activeCategory?.id === category.id ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#DDD8CF] bg-white text-[#6B625A] hover:border-[#111111]'}`}
            >
              {category.name} ({categoryCounts.get(category.slug) || 0})
            </button>
          ))}
        </div>

        <section className="mt-5 rounded-xl border border-[#d8d3ca] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#6f6b62]">
                <SlidersHorizontal size={14} strokeWidth={1.6} />
                Showing {countLabel(filteredProducts.length, 'piece', 'pieces')}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#111111]">
                {activeCategory?.name || 'All curated pieces'}
              </h2>
            </div>

            <div className="hidden flex-wrap justify-end gap-3 lg:flex">
              <SelectDropdown label="Category" value={categoryValue} options={categoryDropdownOptions} active={activeDropdown === 'category'} onToggle={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')} onSelect={selectCategoryByLabel} />
              <SelectDropdown label="Size" value={selectedSize} options={sizeDropdownOptions} active={activeDropdown === 'size'} onToggle={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')} onSelect={(value) => { setSelectedSize(value); setActiveDropdown(null); }} />
              <SelectDropdown label="Brand" value={selectedBrand} options={BRAND_OPTIONS} active={activeDropdown === 'brand'} onToggle={() => setActiveDropdown(activeDropdown === 'brand' ? null : 'brand')} onSelect={(value) => { setSelectedBrand(value); setActiveDropdown(null); }} />
              <SelectDropdown label="Sort" value={sortValue} options={sortOptions} active={activeDropdown === 'sort'} onToggle={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')} onSelect={selectSortByLabel} align="right" />
            </div>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#111111] bg-white px-5 font-mono text-[10px] uppercase tracking-widest text-[#111111] lg:hidden"
            >
              <SlidersHorizontal size={14} strokeWidth={1.6} />
              Filter & sort
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-[#111111] px-2 py-0.5 text-white">{activeFilterCount}</span>
              )}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#ece9e1] pt-4">
            {activeCategory && <FilterPill label={`Category: ${activeCategory.name}`} onClear={() => setCategoryFilter('all')} />}
            {selectedSize !== 'All' && <FilterPill label={`Size: ${selectedSize}`} onClear={() => setSelectedSize('All')} />}
            {selectedBrand !== 'All' && <FilterPill label={`Brand: ${selectedBrand}`} onClear={() => setSelectedBrand('All')} />}
            {searchQuery && <FilterPill label={`Search: ${searchQuery}`} onClear={() => setSearchQuery('')} />}
            {canClearFilters ? (
              <button type="button" onClick={clearFilters} className="ml-auto font-mono text-[10px] uppercase tracking-widest text-[#111111] hover:underline">
                Clear all
              </button>
            ) : (
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#8b877e]">No filters applied</p>
            )}
          </div>
        </section>

        {filteredProducts.length > 0 ? (
          <>
            <div className={`mt-5 grid gap-3 sm:gap-4 ${filteredProducts.length <= 2 ? 'grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`} id="categories-grid-collection-view">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categories={categoryOptions}
                  fallbackImage={heroImage}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>

          </>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-[#cfcac0] bg-white px-6 py-16 text-center shadow-sm" id="discover-empty-state">
            <Sparkles className="mx-auto text-[#111111]" size={26} strokeWidth={1.4} />
            <p className="mt-4 text-lg font-semibold text-[#111111]">No pieces found</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6a665d]">
              Try clearing a filter, searching another category, or returning to the full edit.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 h-10 rounded-full border border-[#111111] bg-[#111111] px-5 font-mono text-[10px] uppercase tracking-widest text-white transition hover:bg-black"
            >
              Reset filters
            </button>
          </div>
        )}

      </div>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div className="fixed inset-0 z-50 bg-black/45 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.28 }}
              className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-auto rounded-t-2xl border-t border-[#111111] bg-white p-5 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6f6b62]">Filter & sort</p>
                  <p className="mt-1 text-lg font-semibold text-[#111111]">{countLabel(filteredProducts.length, 'piece', 'pieces')} visible</p>
                </div>
                <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="rounded-full border border-[#d8d3ca] p-2">
                  <X size={18} strokeWidth={1.6} />
                </button>
              </div>

              <div className="space-y-3">
                <SelectDropdown label="Category" value={categoryValue} options={categoryDropdownOptions} active={activeDropdown === 'category'} onToggle={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')} onSelect={selectCategoryByLabel} />
                <SelectDropdown label="Size" value={selectedSize} options={sizeDropdownOptions} active={activeDropdown === 'size'} onToggle={() => setActiveDropdown(activeDropdown === 'size' ? null : 'size')} onSelect={(value) => { setSelectedSize(value); setActiveDropdown(null); }} />
                <SelectDropdown label="Brand" value={selectedBrand} options={BRAND_OPTIONS} active={activeDropdown === 'brand'} onToggle={() => setActiveDropdown(activeDropdown === 'brand' ? null : 'brand')} onSelect={(value) => { setSelectedBrand(value); setActiveDropdown(null); }} />
                <SelectDropdown label="Sort" value={sortValue} options={sortOptions} active={activeDropdown === 'sort'} onToggle={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')} onSelect={selectSortByLabel} />
              </div>

              <div className="sticky bottom-0 mt-6 grid grid-cols-2 gap-3 bg-white pt-4">
                <button type="button" onClick={clearFilters} className="h-11 rounded-full border border-[#111111] px-5 font-mono text-[10px] uppercase tracking-widest">
                  Clear all
                </button>
                <button type="button" onClick={() => setMobileFiltersOpen(false)} className="h-11 rounded-full border border-[#111111] bg-[#111111] px-5 font-mono text-[10px] uppercase tracking-widest text-white">
                  Show pieces
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FilterPill: React.FC<{ label: string; onClear: () => void }> = ({ label, onClear }) => (
  <span className="inline-flex h-9 items-center gap-2 rounded-full bg-[#eef2ed] px-3 font-mono text-[9px] uppercase tracking-widest text-[#111111]">
    {label}
    <button type="button" onClick={onClear} aria-label={`Clear ${label}`} className="rounded-full bg-white p-1">
      <X size={10} strokeWidth={1.8} />
    </button>
  </span>
);
