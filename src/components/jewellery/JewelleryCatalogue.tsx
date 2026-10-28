import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Plus, 
  Upload, 
  Trash2, 
  FileText, 
  MapPin, 
  Search, 
  Filter, 
  Receipt, 
  ShieldCheck, 
  Tag, 
  Layers, 
  Eye, 
  X, 
  ArrowUpDown, 
  Briefcase, 
  CheckCircle,
  Gem,
  Scale,
  Percent,
  Clock,
  Heart,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { 
  JewelleryProduct, 
  JewelleryCategory, 
  GoldPurity, 
  SavedInvoice, 
  CityGoldRate,
  FXRate,
  MetalPrice
} from '../../types';
import { INITIAL_CITY_RATES, calculateGoldRates } from '../../services/marketData';
import { ProductDetailPage } from './ProductDetailPage';

interface JewelleryCatalogueProps {
  products: JewelleryProduct[];
  onAddProduct: (prod: Omit<JewelleryProduct, 'id' | 'createdAt'>) => void;
  onDeleteProduct: (id: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onGenerateInvoiceForProduct: (product: JewelleryProduct, invoice: SavedInvoice) => void;
  onOpenSavedInvoices: () => void;
  onOpenPortfolioModal: (symbol: string, name: string) => void;
  goldPrice: MetalPrice;
  fx: FXRate;
  savedInvoicesCount: number;
}

const CATEGORY_TABS: { id: JewelleryCategory | 'ALL'; label: string; icon: string }[] = [
  { id: 'ALL', label: 'All Designs', icon: '✨' },
  { id: 'MANGALSUTRA', label: 'Mangalsutras', icon: '💛' },
  { id: 'NECKLACES', label: 'Necklaces & Sets', icon: '📿' },
  { id: 'RINGS', label: 'Rings & Solitaires', icon: '💍' },
  { id: 'BANGLES_BRACELETS', label: 'Bangles & Kadas', icon: '⭕' },
  { id: 'CHAINS', label: 'Chains & Daily Wear', icon: '🔗' },
  { id: 'EARRINGS', label: 'Earrings & Jhumkas', icon: '✨' },
  { id: 'COINS_BARS', label: 'Coins & Bullion', icon: '🪙' },
  { id: 'SILVERWARE', label: 'Silverware & Articles', icon: '🥈' },
];

export const JewelleryCatalogue: React.FC<JewelleryCatalogueProps> = ({
  products,
  onAddProduct,
  onDeleteProduct,
  selectedCity,
  onSelectCity,
  onGenerateInvoiceForProduct,
  onOpenSavedInvoices,
  onOpenPortfolioModal,
  goldPrice,
  fx,
  savedInvoicesCount,
}) => {
  // Navigation & Detail Page State
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<JewelleryProduct | null>(null);

  // Filters & Sorting
  const [selectedCategory, setSelectedCategory] = useState<JewelleryCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'weight-desc'>('newest');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  // Add Product Form State with Multiple Photos Support
  const [newProductName, setNewProductName] = useState<string>('');
  const [newSku, setNewSku] = useState<string>('KS00517-2Y0000');
  const [newCategory, setNewCategory] = useState<JewelleryCategory>('MANGALSUTRA');
  const [newPurity, setNewPurity] = useState<GoldPurity | 'SILVER_999'>('22K');
  const [newNetWeight, setNewNetWeight] = useState<number>(14.85);
  const [newGrossWeight, setNewGrossWeight] = useState<number>(15.20);
  const [newMakingPct, setNewMakingPct] = useState<number>(11.5);
  const [newStoneCharges, setNewStoneCharges] = useState<number>(0);
  const [newHuid, setNewHuid] = useState<string>('MH9168');
  const [newDimensions, setNewDimensions] = useState<string>('Height: 22.4 mm | Width: 20.8 mm | Chain: 18 inch');
  const [newDescription, setNewDescription] = useState<string>('Handcrafted exquisite jewellery designed with certified BIS hallmarking.');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [manualPhotoUrl, setManualPhotoUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active City Rate
  const activeCityRateObj = useMemo(() => {
    return INITIAL_CITY_RATES.find((c) => c.city === selectedCity) || INITIAL_CITY_RATES[0];
  }, [selectedCity]);

  // Helper to compute live rate per gram according to active city IBJA benchmark
  const getCityRatePerGram = (purity: GoldPurity | 'SILVER_999'): number => {
    if (purity === '24K') return activeCityRateObj.price24K10g / 10;
    if (purity === '22K') return activeCityRateObj.price22K10g / 10;
    if (purity === '18K') return activeCityRateObj.price18K10g / 10;
    if (purity === '14K') return (activeCityRateObj.price24K10g * 0.585) / 10;
    if (purity === 'SILVER_999') return activeCityRateObj.silver1kg / 1000;
    return activeCityRateObj.price22K10g / 10;
  };

  // Helper to compute full invoice breakdown for any product at current active IBJA city rates
  const calculateProductPricing = (product: JewelleryProduct) => {
    const ratePerGram = getCityRatePerGram(product.purity);
    const baseMetalCost = Math.round(product.netWeightGrams * ratePerGram);
    const makingCharges = Math.round((baseMetalCost * product.makingChargesPct) / 100);
    const stoneCharges = product.stoneChargesINR || 0;
    const huidFee = product.purity === 'SILVER_999' ? 0 : 53.10; // ₹45 + 18% GST

    const taxableAmount = baseMetalCost + makingCharges + stoneCharges + huidFee;
    const gstRate = 0.03; // 3% GST on jewellery in India
    const gstAmount = Math.round((baseMetalCost + makingCharges + stoneCharges) * gstRate);
    const totalAmount = taxableAmount + gstAmount;
    const scrapResale = Math.round(baseMetalCost * 0.98);

    return {
      ratePerGram,
      baseMetalCost,
      makingCharges,
      stoneCharges,
      huidFee,
      taxableAmount,
      cgst: Math.round(gstAmount / 2),
      sgst: Math.round(gstAmount / 2),
      gstAmount,
      totalAmount,
      scrapResale,
    };
  };

  // Multiple photos upload handler
  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) return; // 5MB cap

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setUploadedPhotos((prev) => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddManualPhotoUrl = () => {
    if (!manualPhotoUrl.trim()) return;
    setUploadedPhotos((prev) => [...prev, manualPhotoUrl.trim()]);
    setManualPhotoUrl('');
  };

  const handleRemovePhoto = (idx: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit new product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const primaryImage = uploadedPhotos.length > 0 ? uploadedPhotos[0] : undefined;

    onAddProduct({
      name: newProductName.trim(),
      sku: newSku.trim() || undefined,
      category: newCategory,
      purity: newPurity,
      netWeightGrams: Number(newNetWeight) || 1,
      grossWeightGrams: Number(newGrossWeight) || Number(newNetWeight),
      makingChargesPct: Number(newMakingPct) || 10,
      stoneChargesINR: Number(newStoneCharges) || 0,
      huidCode: newHuid.trim().toUpperCase() || undefined,
      dimensions: newDimensions.trim() || undefined,
      description: newDescription.trim() || undefined,
      imageUrl: primaryImage,
      images: uploadedPhotos.length > 0 ? uploadedPhotos : undefined,
      rating: 4.9,
      reviewCount: 1,
      inStock: true,
    });

    // Reset form
    setNewProductName('');
    setNewSku('KS00517-2Y0000');
    setNewCategory('MANGALSUTRA');
    setNewPurity('22K');
    setNewNetWeight(14.85);
    setNewGrossWeight(15.20);
    setNewMakingPct(11.5);
    setNewStoneCharges(0);
    setNewHuid('MH9168');
    setNewDimensions('Height: 22.4 mm | Width: 20.8 mm | Chain: 18 inch');
    setNewDescription('');
    setUploadedPhotos([]);
    setIsAddModalOpen(false);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
        const matchesSearch = 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.huidCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt - a.createdAt;
        if (sortBy === 'weight-desc') return b.netWeightGrams - a.netWeightGrams;
        const priceA = calculateProductPricing(a).totalAmount;
        const priceB = calculateProductPricing(b).totalAmount;
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        return 0;
      });
  }, [products, selectedCategory, searchTerm, sortBy, selectedCity]);

  // If user selected a product for details view, render the CaratLane Product Details Page!
  if (selectedProductForDetail) {
    return (
      <ProductDetailPage
        product={selectedProductForDetail}
        onBack={() => setSelectedProductForDetail(null)}
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
        onGenerateInvoice={onGenerateInvoiceForProduct}
        onOpenPortfolioModal={onOpenPortfolioModal}
        goldPrice={goldPrice}
        fx={fx}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: CaratLane Inspired Storefront Header in Lite White Theme */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Certified Fine Jewellery Collection</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal">CaratLane Edition</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Gold Jewellery & Mangalsutra Catalogue
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Explore exquisite 22KT & 18KT hallmarked jewellery with dynamic pricing linked to official IBJA city benchmarks. Click any design to view full photos and certified price breakups.
            </p>
          </div>

          {/* City Benchmark Selector & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  Active IBJA City
                </span>
                <select
                  value={selectedCity}
                  onChange={(e) => onSelectCity(e.target.value)}
                  className="bg-transparent font-bold text-xs text-slate-900 focus:outline-none cursor-pointer"
                >
                  {INITIAL_CITY_RATES.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city} (22K: ₹{(c.price22K10g / 10).toLocaleString('en-IN')}/g)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Design</span>
            </button>

            <button
              onClick={onOpenSavedInvoices}
              className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer whitespace-nowrap"
              title="View Invoices Ledger"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Invoices</span>
              {savedInvoicesCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">
                  {savedInvoicesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Live City Rates Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3 text-slate-600">
            <span>
              24K Pure: <strong className="text-slate-900 font-bold">₹{(activeCityRateObj.price24K10g / 10).toLocaleString('en-IN')}/g</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span>
              22K Hallmark: <strong className="text-amber-800 font-bold">₹{(activeCityRateObj.price22K10g / 10).toLocaleString('en-IN')}/g</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span>
              18K Diamond: <strong className="text-slate-900 font-bold">₹{(activeCityRateObj.price18K10g / 10).toLocaleString('en-IN')}/g</strong>
            </span>
            <span className="text-slate-300">·</span>
            <span>
              Silver: <strong className="text-slate-900 font-bold">₹{(activeCityRateObj.silver1kg / 1000).toLocaleString('en-IN')}/g</strong>
            </span>
          </div>

          <div className="text-slate-500 text-[11px] flex items-center gap-2">
            <span>Official IBJA Rates ({activeCityRateObj.publishedDate || 'Live Session'})</span>
            <span>·</span>
            <span className="text-emerald-700 font-semibold">{filteredProducts.length} Designs Available</span>
          </div>
        </div>
      </div>

      {/* Category Tabs: CaratLane Style Segmented Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id;
          const count = tab.id === 'ALL' 
            ? products.length 
            : products.filter((p) => p.category === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search mangalsutra, necklaces, rings, SKU (e.g. KS00517)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-600 cursor-pointer shadow-xs"
          >
            <option value="newest">Featured & Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="weight-desc">Weight: Heaviest First</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid: CaratLane Style (Just displaying the final price) */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center mb-3">
            <Gem className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No Designs Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            {searchTerm 
              ? `No items match "${searchTerm}". Try checking your spelling or clear search.` 
              : `No items in this category yet. Click 'Add Design' to attach photos and set weights.`}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl hover:bg-amber-700 transition-colors cursor-pointer"
          >
            + Add First Design
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const pricing = calculateProductPricing(product);
            const isWish = !!wishlist[product.id];
            const primaryPhoto = (product.images && product.images.length > 0)
              ? product.images[0]
              : product.imageUrl;
            const photoCount = product.images?.length || (product.imageUrl ? 1 : 0);

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProductForDetail(product)}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative"
              >
                <div>
                  {/* Photo Display Container */}
                  <div className="relative aspect-[4/3] bg-[#f8f7f4] flex items-center justify-center overflow-hidden border-b border-slate-100">
                    {primaryPhoto ? (
                      <img
                        src={primaryPhoto}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                        <Gem className="w-12 h-12 text-amber-500/30 mb-2" />
                        <span className="text-xs font-semibold text-slate-600">
                          {product.category.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">Photo not attached</span>
                      </div>
                    )}

                    {/* Top Left Purity Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
                      <span className="px-2 py-0.5 rounded bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-bold tracking-wider uppercase border border-slate-200/80 shadow-xs">
                        {product.purity} Gold
                      </span>
                      {product.huidCode && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-900/85 text-white text-[9px] font-mono tracking-tight backdrop-blur-md">
                          HUID
                        </span>
                      )}
                    </div>

                    {/* Top Right Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWishlist((prev) => ({ ...prev, [product.id]: !prev[product.id] }));
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-600 hover:text-rose-600 hover:scale-110 transition-all border border-slate-200/80 shadow-xs cursor-pointer z-10"
                      title="Save to Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Multiple Photos indicator */}
                    {photoCount > 1 && (
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-1">
                        <ImageIcon className="w-2.5 h-2.5" />
                        <span>{photoCount} photos</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body: CaratLane Style (JUST DISPLAY FINAL PRICE PROMINENTLY) */}
                  <div className="p-4 sm:p-5">
                    {/* SKU & Category kicker */}
                    <div className="text-[11px] text-slate-400 font-medium mb-1 truncate">
                      {product.sku ? `${product.sku} · ` : ''}{product.category.replace('_', ' ')}
                    </div>

                    {/* Product Title */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug line-clamp-1 group-hover:text-amber-800 transition-colors">
                      {product.name}
                    </h3>

                    {/* Subtle Specifications line */}
                    <p className="text-xs text-slate-500 mt-1">
                      {product.purity} Hallmark · {product.netWeightGrams.toFixed(2)}g Net
                    </p>

                    {/* PROMINENT FINAL PRICE (CaratLane Signature) */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                      <div>
                        <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
                          ₹{pricing.totalAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          (Inclusive of 3% GST)
                        </div>
                      </div>

                      {/* View Details CTA */}
                      <span className="inline-flex items-center text-xs font-semibold text-amber-700 group-hover:text-amber-800 transition-colors">
                        View Details <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subtle bottom bar: Quick Action & Delete */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px] font-mono text-slate-500">
                    IBJA {selectedCity}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${product.name}" from catalogue?`)) {
                        onDeleteProduct(product.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal (Supports attaching multiple photos!) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Add Jewellery Design to Catalogue
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Attach multiple photos, configure purity, weight, and calculate live dynamic pricing.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* Product Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Design / Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hiranya 22KT Gold Mangalsutra"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    SKU / Design Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KS00517-2Y0000"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Category & Purity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Category Menu
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as JewelleryCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600 cursor-pointer"
                  >
                    <option value="MANGALSUTRA">Mangalsutra</option>
                    <option value="NECKLACES">Necklaces & Sets</option>
                    <option value="RINGS">Rings & Solitaires</option>
                    <option value="BANGLES_BRACELETS">Bangles & Kadas</option>
                    <option value="CHAINS">Chains</option>
                    <option value="EARRINGS">Earrings</option>
                    <option value="COINS_BARS">Coins & Bullion</option>
                    <option value="SILVERWARE">Silverware</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Metal & Purity Standard
                  </label>
                  <select
                    value={newPurity}
                    onChange={(e) => setNewPurity(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600 cursor-pointer"
                  >
                    <option value="22K">22K Gold (916 Hallmark)</option>
                    <option value="18K">18K Gold (750 Fine)</option>
                    <option value="24K">24K Bullion (999 Pure)</option>
                    <option value="14K">14K Gold (585 Fine)</option>
                    <option value="SILVER_999">999 Fine Silver</option>
                  </select>
                </div>
              </div>

              {/* Weights & Making Charges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Net Wt (grams) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={newNetWeight}
                    onChange={(e) => setNewNetWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Gross Wt (grams)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={newGrossWeight}
                    onChange={(e) => setNewGrossWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Making Charges (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newMakingPct}
                    onChange={(e) => setNewMakingPct(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Stone Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={newStoneCharges}
                    onChange={(e) => setNewStoneCharges(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* HUID & Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    BIS Hallmarking HUID Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. MH9168"
                    value={newHuid}
                    onChange={(e) => setNewHuid(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Dimensions / Size Specifications
                  </label>
                  <input
                    type="text"
                    placeholder="Height: 22 mm | Width: 20 mm | Chain: 18 inch"
                    value={newDimensions}
                    onChange={(e) => setNewDimensions(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* MULTIPLE PHOTOS ATTACHMENT SECTION */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 block">
                      Attach Multiple Photos (Front, Angles, Model View)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Upload photos from your computer or paste image URLs
                    </p>
                  </div>
                  <span className="text-xs font-mono text-amber-700 font-semibold">
                    {uploadedPhotos.length} Attached
                  </span>
                </div>

                {/* Upload from Computer */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleMultipleImageUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="multi-photo-input"
                  />
                  <label
                    htmlFor="multi-photo-input"
                    className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                    <span>Upload Image Files</span>
                  </label>

                  <span className="text-xs text-slate-400">or</span>

                  {/* Add URL */}
                  <div className="flex-1 flex gap-1">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={manualPhotoUrl}
                      onChange={(e) => setManualPhotoUrl(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualPhotoUrl}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Thumbnail Preview Strip */}
                {uploadedPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pt-3">
                    {uploadedPhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 group bg-white shadow-xs"
                      >
                        <img
                          src={photo}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-amber-600/90 text-white text-[8px] font-bold text-center py-0.5">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Product Description & Craftsmanship Story
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe design inspiration, motifs, occasions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600 resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Save Design to Catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
