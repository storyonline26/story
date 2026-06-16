/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react';
import { Product, Category, Coupon } from '../types';

// Hotlinked premium placeholder images for intuitive choices in modals
const productPresets = [
  {
    name: "Classic Mini Dress",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDB_OzzCutA5Y-NQOgjbYtux2Agqu3cQ5lnj62HcMVjOCkCNAdLTkUEa_dzb_0USXCvPvXBpseE_iUWEy6svA07LP8f1ednGrvRn8HmiKwy7W-_u0VsIh7rcR4E16XjPg_wDUHSgv6GxouZcvLDPsWW8DVqtpNKrB5UcArNXzkpkWtJ3Yc4gY5Tt9wmyGsFWbcC7YB8U_5GNSy8Jcl37nqBVlUyXx8QzBF1tfSIl5EwyKxqSa8zFOX-j4lBu2i5zTv4lO1va2Jlig"
  },
  {
    name: "Structured Blazer",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBE6WRp1a8gc2PiOyGvBJUvrv-atCnqti5QJlILT3knNnLPkR-Yblosw6WPM1hOMmMjxxgexmmeoPi_DcCzprBVGsCzWEXMixlJjzgebbWLCAklQlmSuZ_yBajfKQQGHY-y-cTjcPuVmSZhb-NNyGJ467c8kzL5_HLyL_wbn2wF2YhCqOOwXmm7LwifXRuf681OdQFA6SPvVVJnDC_WGEWWcJ4fsAUNNfW5QWh_clUhxMUDdMEOaJevwhybpVnGUvTPk9yFNB23i0s"
  },
  {
    name: "Relaxed Linen Shirt",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxfbKU-PToFuRRb8aU83cYImJZk-WqQBevO1_c5HouiwGSG9gBXwq6czn6dDasq4wGsoCRKbg6uM4ZZHxNsEApfP9w7zx0HYlgTe5ZflCj2Y0s0SrNGvsRXknsrxf3Q7q0Nlcj1f1zJusA-2sqrZ9K-UOAHUmyzA_yDEtlGVZJ1q7IloKIrtERE8TA2VCgy7NI4_i1qn7JOXFgozdGoUq8xN7kg1LjciBKfraZ7HIgfeo9SRV2tXLQYCGL6NMSTOxH_hNgnXqiaDM"
  },
  {
    name: "Crew Neck Sweater",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-8_dfLFgEN_TrWFvDWES8pMOWX3ExUAnmllwmxWPgqbL7sJ0OAKpK1i1HPY5MKfrhFoFfU2LnSNgVzo2HBJ2qsVWOg3e83bK-DIn9q5Cd1jF9aJHU0E0owP_MvmawNZlBSMFsLOr1XQ0nwU1RDDUZb4TMW4wve_UuIcmPNr7KOokgnppUN9stLCGRPz7DNKGVEuLlTSpl_z6l-9v301DoFN3c6Ksb4gWyT_1ukmqEKQ1Efyg30jjR-H_x1PPbb9-okxXaL2_jOVE"
  }
];

const categoryPresets = [
  {
    name: "New Arrival",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0oHg7piIF57yPlJ-1WFs_HQ7TwCq8ip4B1lUgJYwCifc6nYa1IBjy2TVE2KK9qdDUmkL72XsUrdo8h4ETBVBCGg1lKk5CKkIuY4w9NDF8f3i-Mvy4zLPVRZIPuPnHhTFEFFjAopfsy4LKIHQy7-PJz346l94GkUQcv-QjCICeL87c3nyXVQ7f23Vq50KANuvYEsA_42fmHykLuUEOOZLY_q6xWHpQtev0pjwMC0rM3pT4Sc9yeI67WflBm1iUxcnCBF1tzlDWHms"
  },
  {
    name: "Outerwear",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuASGxGrGiO0yr7u7ACm2aBhzYBRNwvEve1Ys906Z2--JiSicQfYK2xMaL851HFPMc3hGi8CTHioWiGCl1spiq_1EoJz08qvzujpBg9KXbKUmWOHrETexHP-CtfQTSZJVbCnd03Nb1yYpRuK29nVSm4A5S2JQl1R89CeFLXLzHbgSSOHJTWpE8zrlmzoB3_fweHGLH2CyVSlpIfnfhX1n7dcjGq8jMejYKbZFbrSJvHVRwyiVpVywQEjgDEdHiuC_IuVUlfeDp4uRCc"
  },
  {
    name: "Accessory",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxMe2bqXBLwIvmRvK3XECy7YP0JyC8DcbXNPT0wk_IVJIkiRqo_VatpJE5CIz6a21G_OvvYlUfUwzrAg8axSNHuZkjhPAR6NyD0B6iQBMRnm9LO5GwolgWz2WLajqf4qWr-uj5_PLZN5z_cB71zr_YpufImnxyF47HLiJT3ee21-CiUnGhTS0XWlwBy39bNiciKYu3Dre8N5FoeGKrxX097r9TLkwnupIi4RlIOZnjVoiUA1rMu20YGikuKwUCNaVtT8cMfgbkBvw"
  }
];

/* -------------------------------------------
   Product Editor Modals
------------------------------------------- */
interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: Omit<Product, 'id'>) => void;
  categories: Category[];
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, product: Partial<Product>) => void;
  categories: Category[];
  product: Product | null;
}

type ImageDraft = { file: File; preview: string };
type ProductColor = { name: string; hex: string };
type ProductDraft = {
  name: string;
  sku: string;
  categoryId: string;
  price: string;
  originalPrice: string;
  stock: string;
  sizeStock: Record<string, string>;
  description: string;
  composition: string;
  care: string;
  details: string[];
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  imageFiles: ImageDraft[];
  secondaryImage: string;
  secondaryImageFile?: File;
  status: Product['status'];
};

const defaultSizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '26', '28', '30', '32', '34', '36', '38', '40', '42', '44', '6', '7', '8', '9', '10', '11', '12', '13'];

const makeSku = (name: string) => {
  const prefix = (name || 'STORY').replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() || 'STY';
  return `${prefix}-${Math.floor(100 + Math.random() * 900)}-IN`;
};

const cleanList = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);

function ProductEditorModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  product,
  mode
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'> | Partial<Product>) => void;
  categories: Category[];
  product?: Product | null;
  mode: 'create' | 'edit';
}) {
  const activeCategories = React.useMemo(
    () => categories.filter((category) => category.status === 'Active' || category.id === product?.categoryId),
    [categories, product?.categoryId]
  );

  const defaultDraft = React.useCallback((): ProductDraft => {
    const imageList = product?.images?.length ? product.images : product?.image ? [product.image] : [productPresets[0].url];

    return {
      name: product?.name || '',
      sku: product?.sku || '',
      categoryId: product?.categoryId || activeCategories[0]?.id || '',
      price: product?.price ? String(product.price) : '',
      originalPrice: product?.originalPrice ? String(product.originalPrice) : '',
      stock: product?.stock !== undefined ? String(product.stock) : '',
      sizeStock: product?.sizeStock ? Object.fromEntries(Object.entries(product.sizeStock).map(([k, v]) => [k, String(v)])) : {},
      description: product?.description || '',
      composition: product?.composition || '',
      care: product?.care || '',
      details: product?.details?.length ? product.details : [''],
      sizes: product?.sizes?.length ? product.sizes : ['S', 'M', 'L'],
      colors: product?.colors?.length ? product.colors : [{ name: 'Black', hex: '#111111' }],
      images: imageList.filter(Boolean),
      imageFiles: [],
      secondaryImage: product?.secondaryImage || '',
      status: product?.status || 'active'
    };
  }, [activeCategories, product]);

  const [draft, setDraft] = useState<ProductDraft>(defaultDraft);

  React.useEffect(() => {
    if (isOpen) setDraft(defaultDraft());
  }, [defaultDraft, isOpen]);

  const selectedCategory = activeCategories.find((item) => item.id === draft.categoryId) || activeCategories[0];

  const sizeOptions = React.useMemo(() => {
    const catSizes = selectedCategory?.sizes;
    if (Array.isArray(catSizes) && catSizes.length > 0) return catSizes as string[];
    return defaultSizeOptions;
  }, [selectedCategory?.sizes]);

  const updateDetail = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      details: current.details.map((item, itemIndex) => (itemIndex === index ? value : item))
    }));
  };

  const updateColor = (index: number, patch: Partial<ProductColor>) => {
    setDraft((current) => ({
      ...current,
      colors: current.colors.map((color, colorIndex) => (colorIndex === index ? { ...color, ...patch } : color))
    }));
  };

  const updateImage = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => (imageIndex === index ? value : image))
    }));
  };

  const removeImage = (image: string) => {
    setDraft((current) => ({
      ...current,
      images: current.images.filter((item) => item !== image),
      imageFiles: current.imageFiles.filter((item) => item.preview !== image)
    }));
  };

  const toggleSize = (size: string) => {
    setDraft((current) => ({
      ...current,
      sizes: current.sizes.includes(size)
        ? current.sizes.filter((item) => item !== size)
        : [...current.sizes, size]
    }));
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const nextFiles = Array.from(files).slice(0, 8).map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setDraft((current) => ({
      ...current,
      images: [...current.images, ...nextFiles.map((item) => item.preview)],
      imageFiles: [...current.imageFiles, ...nextFiles]
    }));
  };

  const handleSecondaryFile = (file?: File) => {
    if (!file) return;
    setDraft((current) => ({
      ...current,
      secondaryImage: URL.createObjectURL(file),
      secondaryImageFile: file
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const images = cleanList(draft.images);
    const payload: Omit<Product, 'id'> | Partial<Product> = {
      name: draft.name.trim(),
      sku: draft.sku.trim() || makeSku(draft.name),
      category: selectedCategory?.name || '',
      categoryId: selectedCategory?.id,
      price: Number(draft.price),
      originalPrice: draft.originalPrice ? Number(draft.originalPrice) : undefined,
      stock: Number(draft.stock),
      sizeStock: Object.keys(draft.sizeStock).length > 0 ? Object.fromEntries(Object.entries(draft.sizeStock).map(([k, v]) => [k, Number(v) || 0])) : undefined,
      image: images[0] || '',
      images,
      imageFiles: draft.imageFiles.map((item) => item.file),
      secondaryImage: draft.secondaryImage,
      secondaryImageFile: draft.secondaryImageFile,
      description: draft.description,
      composition: draft.composition,
      care: draft.care,
      details: cleanList(draft.details),
      sizes: draft.sizes,
      colors: draft.colors.filter((color) => color.name.trim() && color.hex.trim()),
      status: draft.status
    };

    onSubmit(payload);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-neutral-200/60 bg-white text-left shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-150 bg-neutral-50/20 p-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">{mode === 'create' ? 'New catalog item' : 'Edit catalog item'}</p>
                <h3 className="mt-1 font-sans text-base font-bold text-neutral-900">{mode === 'create' ? 'Register Product' : draft.name || 'Edit Product'}</h3>
              </div>
              <button onClick={onClose} className="rounded-full p-1 text-neutral-400 transition-all hover:bg-neutral-100 hover:text-black">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 text-xs font-sans lg:grid-cols-[1.1fr_0.9fr]">
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-1.5 md:col-span-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Name</span>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={event => setDraft({ ...draft, name: event.target.value, sku: draft.sku || makeSku(event.target.value) })}
                      className="rounded-lg border border-neutral-200 p-2.5 text-sm outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      placeholder="Relaxed Linen Shirt"
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">SKU</span>
                    <input
                      type="text"
                      value={draft.sku}
                      onChange={event => setDraft({ ...draft, sku: event.target.value })}
                      className="rounded-lg border border-neutral-200 p-2.5 font-mono outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      placeholder="TOP-449-LIN"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Category</span>
                    <select
                      value={draft.categoryId}
                      onChange={event => setDraft({ ...draft, categoryId: event.target.value })}
                      className="rounded-lg border border-neutral-200 bg-white p-2.5 outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      required
                    >
                      {activeCategories.length === 0 ? (
                        <option value="">Create a category first</option>
                      ) : (
                        activeCategories.map((categoryItem) => (
                          <option key={categoryItem.id} value={categoryItem.id}>{categoryItem.name}</option>
                        ))
                      )}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Selling Price</span>
                    <input
                      type="number"
                      min="0"
                      value={draft.price}
                      onChange={event => setDraft({ ...draft, price: event.target.value })}
                      className="rounded-lg border border-neutral-200 p-2.5 font-mono outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      required
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Original Price</span>
                    <input
                      type="number"
                      min="0"
                      value={draft.originalPrice}
                      onChange={event => setDraft({ ...draft, originalPrice: event.target.value })}
                      className="rounded-lg border border-neutral-200 p-2.5 font-mono outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      placeholder="Optional MRP"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Stock</span>
                    <input
                      type="number"
                      min="0"
                      value={draft.stock}
                      onChange={event => setDraft({ ...draft, stock: event.target.value })}
                      className="rounded-lg border border-neutral-200 p-2.5 font-mono outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      required
                    />
                  </label>

                </div>

                {/* Size Stock Editor */}
                {draft.sizes.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Stock per Size</span>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                      {draft.sizes.map((size) => (
                        <label key={size} className="flex flex-col items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-2">
                          <span className="text-[11px] font-bold text-neutral-900">{size}</span>
                          <input
                            type="number"
                            min="0"
                            value={draft.sizeStock[size] || ''}
                            onChange={(e) => setDraft({ ...draft, sizeStock: { ...draft.sizeStock, [size]: e.target.value } })}
                            placeholder="0"
                            className="w-full rounded border border-neutral-200 bg-white p-1.5 text-center font-mono text-xs outline-hidden focus:border-neutral-900"
                          />
                        </label>
                      ))}
                    </div>
                    <p className="text-[10px] text-neutral-400">Set quantity per size. Leave empty to use total stock.</p>
                  </div>
                )}

                <label className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Description</span>
                  <textarea
                    value={draft.description}
                    onChange={event => setDraft({ ...draft, description: event.target.value })}
                    rows={4}
                    className="resize-none rounded-lg border border-neutral-200 p-2.5 leading-relaxed outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                </label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Composition</span>
                    <input
                      value={draft.composition}
                      onChange={event => setDraft({ ...draft, composition: event.target.value })}
                      className="rounded-lg border border-neutral-200 p-2.5 outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      placeholder="90% organic cotton, 10% linen"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Care</span>
                    <input
                      value={draft.care}
                      onChange={event => setDraft({ ...draft, care: event.target.value })}
                      className="rounded-lg border border-neutral-200 p-2.5 outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      placeholder="Dry clean only"
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Details</span>
                    <button type="button" onClick={() => setDraft({ ...draft, details: [...draft.details, ''] })} className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-600 hover:text-neutral-950">
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  {draft.details.map((detail, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={detail}
                        onChange={event => updateDetail(index, event.target.value)}
                        className="flex-1 rounded-lg border border-neutral-200 p-2.5 outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                        placeholder="High waist"
                      />
                      <button type="button" onClick={() => setDraft({ ...draft, details: draft.details.filter((_, itemIndex) => itemIndex !== index) })} className="rounded-lg border border-neutral-200 p-2 text-neutral-400 hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Status</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['active', 'draft'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setDraft({ ...draft, status })}
                        className={`rounded-lg border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition ${draft.status === status ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 text-neutral-600 hover:border-neutral-950'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Sizes</span>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`h-8 min-w-10 rounded-lg border px-2 font-mono text-[10px] uppercase tracking-widest transition ${draft.sizes.includes(size) ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 text-neutral-600 hover:border-neutral-950'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Colors</span>
                    <button type="button" onClick={() => setDraft({ ...draft, colors: [...draft.colors, { name: '', hex: '#111111' }] })} className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-600 hover:text-neutral-950">
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  {draft.colors.map((color, index) => (
                    <div key={index} className="grid grid-cols-[42px_1fr_42px] gap-2">
                      <input type="color" value={color.hex || '#111111'} onChange={event => updateColor(index, { hex: event.target.value })} className="h-10 w-10 rounded border border-neutral-200 bg-white p-1" />
                      <input value={color.name} onChange={event => updateColor(index, { name: event.target.value })} className="rounded-lg border border-neutral-200 p-2.5 outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" placeholder="Off-White" />
                      <button type="button" onClick={() => setDraft({ ...draft, colors: draft.colors.filter((_, colorIndex) => colorIndex !== index) })} className="rounded-lg border border-neutral-200 p-2 text-neutral-400 hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Images</span>
                  <div className="grid grid-cols-4 gap-2">
                    {productPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setDraft({ ...draft, images: [preset.url, ...draft.images.filter((image) => image !== preset.url)] })}
                        className="h-14 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 hover:border-neutral-950"
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="h-full w-full object-cover grayscale" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>

                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 p-3 font-mono text-[10px] uppercase tracking-widest text-neutral-500 hover:border-neutral-950 hover:text-neutral-950">
                    <Upload size={14} />
                    Upload Images
                    <input type="file" accept="image/*" multiple className="hidden" onChange={event => handleImageFiles(event.target.files)} />
                  </label>

                  <div className="flex flex-col gap-2">
                    {draft.images.map((image, index) => (
                      <div key={`${image}-${index}`} className="flex items-center gap-2">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
                          {image ? <img alt="" className="h-full w-full object-cover" src={image} referrerPolicy="no-referrer" /> : <ImageIcon size={14} className="m-3 text-neutral-300" />}
                        </div>
                        <input value={image} onChange={event => updateImage(index, event.target.value)} className="min-w-0 flex-1 rounded-lg border border-neutral-200 p-2 font-mono text-[11px] outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" placeholder="https://..." />
                        <button type="button" onClick={() => removeImage(image)} className="rounded-lg border border-neutral-200 p-2 text-neutral-400 hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setDraft({ ...draft, images: [...draft.images, ''] })} className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-600 hover:border-neutral-950 hover:text-neutral-950">
                      <Plus size={13} /> Add URL
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">Secondary Image</span>
                  <input value={draft.secondaryImage} onChange={event => setDraft({ ...draft, secondaryImage: event.target.value, secondaryImageFile: undefined })} className="rounded-lg border border-neutral-200 p-2.5 font-mono text-[11px] outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" placeholder="https://..." />
                  <input type="file" accept="image/*" onChange={event => handleSecondaryFile(event.target.files?.[0])} className="rounded-lg border border-neutral-200 p-2.5 text-[11px] outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
                </div>

                <div className="mt-auto flex gap-3 border-t border-neutral-150 pt-4">
                  <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-neutral-250 py-3 text-center text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-neutral-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={activeCategories.length === 0} className="flex-1 rounded-lg bg-black py-3 text-center text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-neutral-850 disabled:cursor-not-allowed disabled:opacity-50">
                    {mode === 'create' ? 'Register Item' : 'Save Product'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function AddProductModal({ isOpen, onClose, onAdd, categories }: AddProductModalProps) {
  return (
    <ProductEditorModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={(product) => {
        onAdd(product as Omit<Product, 'id'>);
        onClose();
      }}
      categories={categories}
      mode="create"
    />
  );
}

export function EditProductModal({ isOpen, onClose, onSave, categories, product }: EditProductModalProps) {
  return (
    <ProductEditorModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={(patch) => {
        if (product) onSave(product.id, patch);
      }}
      categories={categories}
      product={product}
      mode="edit"
    />
  );
}

/* -------------------------------------------
   AddCategoryModal
------------------------------------------- */
interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: Omit<Category, 'id' | 'productCount'>) => void;
}

export function AddCategoryModal({ isOpen, onClose, onAdd }: AddCategoryModalProps) {
  const [name, setName] = useState('');

  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(categoryPresets[0].url);
  const [imageFile, setImageFile] = useState<File | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name,
      parent: 'None',
      isDynamic: false,
      description: description || 'No summary description.',
      image: imageUrl,
      imageFile,
      status: 'Active'
    });
    setName('');
    setDescription('');
    setImageFile(undefined);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="relative bg-white rounded-xl shadow-2xl border border-neutral-200/60 w-full max-w-md overflow-hidden text-left flex flex-col"
          >
            <div className="p-5 border-b border-neutral-150 flex justify-between items-center bg-neutral-50/20">
              <h3 className="font-bold font-sans text-neutral-900 text-base">Add New Category</h3>
              <button onClick={onClose} className="p-1 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 text-xs font-sans">
              
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-neutral-700">Category Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
              placeholder="e.g. Story Jewelry"
                  className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm"
                  required
                />
              </div>



              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-neutral-700">Brief catalog description</label>
                <textarea 
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Premium accessories designed to finish monochrome looks."
                  className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 leading-relaxed font-sans"
                />
              </div>

              <div className="flex flex-col gap-3.5 border-t border-neutral-100 pt-4">
                <label className="font-semibold text-neutral-700">Cover Image Source</label>
                <div className="grid grid-cols-3 gap-2">
                  {categoryPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setImageFile(undefined);
                        setImageUrl(preset.url);
                      }}
                      className={`h-12 rounded overflow-hidden border relative flex items-center justify-center bg-neutral-100 ${
                        imageUrl === preset.url ? 'border-black ring-1 ring-black' : 'border-neutral-205'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="object-cover w-full h-full grayscale" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setImageFile(file);
                    setImageUrl(URL.createObjectURL(file));
                  }}
                  className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-[11px]"
                />
              </div>

              <div className="pt-4 border-t border-neutral-150 mt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 border border-neutral-250 py-3 rounded-lg text-xs font-semibold hover:bg-neutral-50 transition-colors uppercase tracking-wider text-center"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-black text-white hover:bg-neutral-850 py-3 rounded-lg text-xs font-semibold transition-colors uppercase tracking-wider text-center"
                >
                  Register Category
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------
   CreateCouponModal
------------------------------------------- */
interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (coupon: Omit<Coupon, 'usageUsed'>) => void;
}

export function CreateCouponModal({ isOpen, onClose, onCreate }: CreateCouponModalProps) {
  const [code, setCode] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      code: code.toUpperCase() || 'STORYDISC',
      discountText: discountText || 'Discount Incentive',
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      expiryDate: expiryDate || 'No Expiry',
      description: description || 'Promotional Coupon.',
      status: 'Active'
    });
    setCode('');
    setDiscountText('');
    setUsageLimit('');
    setExpiryDate('');
    setDescription('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="relative bg-white rounded-xl shadow-2xl border border-neutral-200/60 w-full max-w-md overflow-hidden text-left flex flex-col"
          >
            <div className="p-5 border-b border-neutral-150 flex justify-between items-center bg-neutral-50/20">
              <h3 className="font-bold font-sans text-neutral-900 text-base">Generate Promo Code</h3>
              <button onClick={onClose} className="p-1 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 text-xs font-sans">
              
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-neutral-700">Promo Code String (Caps)</label>
                <input 
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME15"
                  className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono text-sm tracking-widest font-bold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-neutral-700">Discount Description Tagline</label>
                <input 
                  type="text"
                  value={discountText}
                  onChange={e => setDiscountText(e.target.value)}
                  placeholder="e.g. 15% Off on New Arrival"
                  className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-neutral-700">Global Usage limit (Optional)</label>
                  <input 
                    type="number"
                    value={usageLimit}
                    onChange={e => setUsageLimit(e.target.value)}
                    placeholder="Unlimited"
                    className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-neutral-700">Expiry Date Description</label>
                  <input 
                    type="text"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    placeholder="e.g. Jul 31, 2026 or No Expiry"
                    className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 font-sans">
                <label className="font-semibold text-neutral-700">Incentive Campaign Goal context</label>
                <textarea 
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Explain internal motivation or terms..."
                  className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-sans leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-neutral-150 mt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 border border-neutral-250 py-3 rounded-lg text-xs font-semibold hover:bg-neutral-50 transition-colors uppercase tracking-wider text-center"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-black text-white hover:bg-neutral-850 py-3 rounded-lg text-xs font-semibold transition-colors uppercase tracking-wider text-center"
                >
                  Save Code
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
