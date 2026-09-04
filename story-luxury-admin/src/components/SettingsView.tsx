/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, ShieldCheck, Heart, Sparkles, CreditCard, ChevronRight } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import ImageInput from './ImageInput';

interface SettingsViewProps {
  settings: StoreSettings;
  products: Product[];
  onSaveSettings: (updated: StoreSettings) => Promise<void>;
}

const productKey = (product: Product) => product.id || product.sku;

const ProductOrderPicker = ({
  title,
  description,
  selectedIds,
  products,
  onChange
}: {
  title: string;
  description: string;
  selectedIds: string[];
  products: Product[];
  onChange: (ids: string[]) => void;
}) => {
  const addProduct = (id: string) => {
    if (!id || selectedIds.includes(id)) return;
    onChange([...selectedIds, id]);
  };

  const removeProduct = (id: string) => onChange(selectedIds.filter((item) => item !== id));
  const moveProduct = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  };

  const selectedProducts = selectedIds.map((id) => products.find((product) => productKey(product) === id)).filter(Boolean) as Product[];
  const availableProducts = products.filter((product) => !selectedIds.includes(productKey(product)));

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">{title}</h4>
        <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
      </div>

      <select
        value=""
        onChange={(event) => addProduct(event.target.value)}
        className="w-full rounded-lg border border-neutral-200 bg-white p-2.5 text-xs outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
      >
        <option value="">Add product to this section</option>
        {availableProducts.map((product) => (
          <option key={productKey(product)} value={productKey(product)}>
            {product.name}
          </option>
        ))}
      </select>

      <div className="mt-4 space-y-2">
        {selectedProducts.length === 0 ? (
          <div className="border border-dashed border-neutral-300 bg-white p-4 text-xs text-neutral-500">
            No manual order selected. Storefront will fall back to the live product catalog.
          </div>
        ) : (
          selectedProducts.map((product, index) => (
            <div key={productKey(product)} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-2">
              <img src={product.image} alt="" className="h-12 w-10 rounded object-cover grayscale" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-neutral-900">{product.name}</p>
                <p className="font-mono text-[10px] uppercase text-neutral-400">{product.category}</p>
              </div>
              <button type="button" onClick={() => moveProduct(index, -1)} className="rounded border border-neutral-200 px-2 py-1 text-[10px] uppercase text-neutral-600 disabled:opacity-30" disabled={index === 0}>Up</button>
              <button type="button" onClick={() => moveProduct(index, 1)} className="rounded border border-neutral-200 px-2 py-1 text-[10px] uppercase text-neutral-600 disabled:opacity-30" disabled={index === selectedProducts.length - 1}>Down</button>
              <button type="button" onClick={() => removeProduct(productKey(product))} className="rounded bg-neutral-950 px-2 py-1 text-[10px] uppercase text-white">Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default function SettingsView({ settings, products, onSaveSettings }: SettingsViewProps) {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [currency, setCurrency] = useState(settings.currency);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(settings.baseDeliveryFee);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(settings.freeDeliveryThreshold);
  const [defaultGstRate, setDefaultGstRate] = useState(settings.defaultGstRate);
  
  const [razorpayActive, setRazorpayActive] = useState(settings.razorpayActive);
  const [razorpayKeyId, setRazorpayKeyId] = useState(settings.razorpayKeyId);
  const [razorpayKeySecret, setRazorpayKeySecret] = useState(settings.razorpayKeySecret);
  const [heroEyebrow, setHeroEyebrow] = useState(settings.heroEyebrow);
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle);
  const [heroBody, setHeroBody] = useState(settings.heroBody);
  const [heroPrimaryCta, setHeroPrimaryCta] = useState(settings.heroPrimaryCta);
  const [heroSecondaryCta, setHeroSecondaryCta] = useState(settings.heroSecondaryCta);
  const [heroImagePrimary, setHeroImagePrimary] = useState(settings.heroImagePrimary);
  const [heroImageSecondary, setHeroImageSecondary] = useState(settings.heroImageSecondary);
  const [heroImageDetail, setHeroImageDetail] = useState(settings.heroImageDetail);
  const [heroBadgeEyebrow, setHeroBadgeEyebrow] = useState(settings.heroBadgeEyebrow);
  const [heroBadgeText, setHeroBadgeText] = useState(settings.heroBadgeText);
  const [productsEyebrow, setProductsEyebrow] = useState(settings.productsEyebrow);
  const [productsTitle, setProductsTitle] = useState(settings.productsTitle);
  const [homeProductIds, setHomeProductIds] = useState(settings.homeProductIds);
  const [collectionEyebrow, setCollectionEyebrow] = useState(settings.collectionEyebrow);
  const [collectionTitle, setCollectionTitle] = useState(settings.collectionTitle);
  const [collectionBody, setCollectionBody] = useState(settings.collectionBody);
  const [collectionImage, setCollectionImage] = useState(settings.collectionImage);
  const [collectionProductIds, setCollectionProductIds] = useState(settings.collectionProductIds);
  const [discoverEyebrow, setDiscoverEyebrow] = useState(settings.discoverEyebrow);
  const [discoverTitle, setDiscoverTitle] = useState(settings.discoverTitle);
  const [discoverSearchPlaceholder, setDiscoverSearchPlaceholder] = useState(settings.discoverSearchPlaceholder);
  const [discoverTagLabel, setDiscoverTagLabel] = useState(settings.discoverTagLabel);
  const [jewelryEyebrow, setJewelryEyebrow] = useState(settings.jewelryEyebrow);
  const [jewelryTitle, setJewelryTitle] = useState(settings.jewelryTitle);
  const [jewelryBody, setJewelryBody] = useState(settings.jewelryBody);
  const [recommendationEyebrow, setRecommendationEyebrow] = useState(settings.recommendationEyebrow);
  const [recommendationTitle, setRecommendationTitle] = useState(settings.recommendationTitle);
  const [recommendationProductIds, setRecommendationProductIds] = useState(settings.recommendationProductIds);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await onSaveSettings({
        ...settings,
        storeName,
        currency,
        contactEmail,
        baseDeliveryFee,
        freeDeliveryThreshold,
        defaultGstRate,
        razorpayActive,
        razorpayKeyId,
        razorpayKeySecret,
        heroEyebrow,
        heroTitle,
        heroBody,
        heroPrimaryCta,
        heroSecondaryCta,
        heroImagePrimary,
        heroImageSecondary,
        heroImageDetail,
        heroBadgeEyebrow,
        heroBadgeText,
        productsEyebrow,
        productsTitle,
        homeProductIds,
        collectionEyebrow,
        collectionTitle,
        collectionBody,
        collectionImage,
        collectionProductIds,
        discoverEyebrow,
        discoverTitle,
        discoverSearchPlaceholder,
        discoverTagLabel,
        jewelryEyebrow,
        jewelryTitle,
        jewelryBody,
        recommendationEyebrow,
        recommendationTitle,
        recommendationProductIds
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 text-left max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold font-sans text-neutral-900 tracking-tight">Settings</h2>
        <p className="text-sm font-sans text-neutral-500 mt-1">Configure India storefront details, GST, shipping rules, and Razorpay settings.</p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-black border border-neutral-900 rounded-xl text-white text-xs font-mono flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-white shrink-0" />
              <span>India storefront settings saved for the admin workspace.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        
        {/* Row 1: Core Parameters */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200/60 shadow-xs flex flex-col gap-5">
          <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider font-sans border-b border-neutral-100 pb-3">Global Store Parameters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-sans">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Official Label Name</label>
              <input 
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                placeholder="STORY India"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Admin Contact Email</label>
              <input 
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                placeholder="care@story.in"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Currency Denomination</label>
              <select 
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="p-2.5 bg-white border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
              >
                <option value="INR">Indian Rupee (INR)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Default Goods & Services Tax (GST)</label>
              <select 
                value={defaultGstRate}
                onChange={e => setDefaultGstRate(Number(e.target.value))}
                className="p-2.5 bg-white border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
              >
                <option value={18}>18% (Luxury accessories / imports)</option>
                <option value={12}>12% (Selected apparel categories)</option>
                <option value={5}>5% (Handloom / crafts exemption bands)</option>
                <option value={0}>0% (Exempt)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Delivery Parameters */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200/60 shadow-xs flex flex-col gap-5">
          <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider font-sans border-b border-neutral-100 pb-3">Delivery Parameters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-sans">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Base Delivery Fee (INR)</label>
              <input 
                type="number"
                value={baseDeliveryFee}
                onChange={e => setBaseDeliveryFee(Number(e.target.value))}
                className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Free Delivery Threshold (INR)</label>
              <input 
                type="number"
                value={freeDeliveryThreshold}
                onChange={e => setFreeDeliveryThreshold(Number(e.target.value))}
                className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Row 3: Homepage merchandising */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200/60 shadow-xs flex flex-col gap-6">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider font-sans">Storefront Homepage</h3>
            <p className="mt-1 text-xs text-neutral-500">Edit the customer-facing hero, collection feature, jewelry module, and recommendation labels.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 text-xs font-sans md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Hero Eyebrow</label>
              <input value={heroEyebrow} onChange={e => setHeroEyebrow(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Hero Title</label>
              <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Hero Body</label>
              <textarea value={heroBody} onChange={e => setHeroBody(e.target.value)} rows={3} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 resize-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Primary CTA</label>
              <input value={heroPrimaryCta} onChange={e => setHeroPrimaryCta(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Secondary CTA</label>
              <input value={heroSecondaryCta} onChange={e => setHeroSecondaryCta(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Hero Badge Eyebrow</label>
              <input value={heroBadgeEyebrow} onChange={e => setHeroBadgeEyebrow(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Hero Badge Text</label>
              <input value={heroBadgeText} onChange={e => setHeroBadgeText(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 text-xs font-sans lg:grid-cols-3">
            {[
              ['Primary Hero Image', heroImagePrimary, setHeroImagePrimary],
              ['Secondary Hero Image', heroImageSecondary, setHeroImageSecondary],
              ['Detail Hero Image', heroImageDetail, setHeroImageDetail]
            ].map(([label, value, setter]) => (
              <div key={label as string}>
                <ImageInput
                  label={label as string}
                  value={value as string}
                  onChange={(url) => (setter as React.Dispatch<React.SetStateAction<string>>)(url)}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 border-t border-neutral-100 pt-5 text-xs font-sans md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Products Eyebrow</label>
              <input value={productsEyebrow} onChange={e => setProductsEyebrow(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Products Title</label>
              <input value={productsTitle} onChange={e => setProductsTitle(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Collection Eyebrow</label>
              <input value={collectionEyebrow} onChange={e => setCollectionEyebrow(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Collection Title</label>
              <input value={collectionTitle} onChange={e => setCollectionTitle(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Collection Body</label>
              <textarea value={collectionBody} onChange={e => setCollectionBody(e.target.value)} rows={3} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 resize-none" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <ImageInput label="Collection Image" value={collectionImage} onChange={setCollectionImage} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 border-t border-neutral-100 pt-5 text-xs font-sans md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Collections Page Eyebrow</label>
              <input value={discoverEyebrow} onChange={e => setDiscoverEyebrow(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Collections Page Title</label>
              <input value={discoverTitle} onChange={e => setDiscoverTitle(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Search Placeholder</label>
              <input value={discoverSearchPlaceholder} onChange={e => setDiscoverSearchPlaceholder(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Tag Row Label</label>
              <input value={discoverTagLabel} onChange={e => setDiscoverTagLabel(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 border-t border-neutral-100 pt-5 text-xs font-sans md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Jewelry Eyebrow</label>
              <input value={jewelryEyebrow} onChange={e => setJewelryEyebrow(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Jewelry Title</label>
              <input value={jewelryTitle} onChange={e => setJewelryTitle(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Jewelry Body</label>
              <textarea value={jewelryBody} onChange={e => setJewelryBody(e.target.value)} rows={3} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 resize-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Recommendation Eyebrow</label>
              <input value={recommendationEyebrow} onChange={e => setRecommendationEyebrow(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Recommendation Title</label>
              <input value={recommendationTitle} onChange={e => setRecommendationTitle(e.target.value)} className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 border-t border-neutral-100 pt-5 lg:grid-cols-3">
            <ProductOrderPicker
              title="Main Page Products"
              description="Controls the exact products and order shown under Seasonal selection / Our Products."
              selectedIds={homeProductIds}
              products={products}
              onChange={setHomeProductIds}
            />
            <ProductOrderPicker
              title="Collections Page"
              description="Controls product order on the Collections grid. Leave empty to use the full catalog."
              selectedIds={collectionProductIds}
              products={products}
              onChange={setCollectionProductIds}
            />
            <ProductOrderPicker
              title="Recommendation"
              description="Controls the recommendation row at the bottom of the homepage."
              selectedIds={recommendationProductIds}
              products={products}
              onChange={setRecommendationProductIds}
            />
          </div>
        </div>

        {/* Row 4: Razorpay Payment Gateways */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200/60 shadow-xs flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider font-sans">Razorpay Gateway Integration</h3>
            {/* Toggle switch */}
            <button
              type="button"
              onClick={() => setRazorpayActive(!razorpayActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                razorpayActive ? 'bg-black' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  razorpayActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-sans transition-all duration-300 ${
            razorpayActive ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none select-none'
          }`}>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-neutral-700">Razorpay Key ID</label>
                <span className="text-[10px] font-mono text-neutral-400">rzp_live_*</span>
              </div>
              <input 
                type="text"
                value={razorpayKeyId}
                onChange={e => setRazorpayKeyId(e.target.value)}
                disabled={!razorpayActive}
                className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                placeholder="rzp_live_xxxxxxxxxxxx"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-neutral-700">Razorpay Client Secret</label>
              <input 
                type="password"
                value={razorpayKeySecret}
                onChange={e => setRazorpayKeySecret(e.target.value)}
                disabled={!razorpayActive}
                className="p-2.5 border border-neutral-200 rounded-lg outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 font-mono"
                placeholder="stored in backend environment"
              />
            </div>
          </div>
        </div>

        {/* Floating Save CTA button footer bar */}
        <div className="flex justify-end gap-3.5 mt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-black hover:bg-neutral-850 text-white font-semibold py-3.5 px-7 rounded-lg text-xs transition-colors uppercase tracking-wider min-w-[120px] flex items-center justify-center cursor-pointer"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span>Save Configuration</span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
