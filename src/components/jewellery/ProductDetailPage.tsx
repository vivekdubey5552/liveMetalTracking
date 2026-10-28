import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Printer, 
  Sparkles, 
  MapPin, 
  Check, 
  Star, 
  Info,
  Calendar,
  Layers,
  Gem,
  Scale
} from 'lucide-react';
import { 
  JewelleryProduct, 
  SavedInvoice, 
  GoldPurity, 
  CityGoldRate,
  FXRate,
  MetalPrice
} from '../../types';
import { INITIAL_CITY_RATES } from '../../services/marketData';

interface ProductDetailPageProps {
  product: JewelleryProduct;
  onBack: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onGenerateInvoice: (product: JewelleryProduct, invoice: SavedInvoice) => void;
  onOpenPortfolioModal: (symbol: string, name: string) => void;
  goldPrice: MetalPrice;
  fx: FXRate;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  selectedCity,
  onSelectCity,
  onGenerateInvoice,
  onOpenPortfolioModal,
  goldPrice,
  fx,
}) => {
  // Multiple photos gallery
  const photosList = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    if (product.imageUrl) {
      return [product.imageUrl];
    }
    return [];
  }, [product]);

  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [selectedPurity, setSelectedPurity] = useState<GoldPurity | 'SILVER_999'>(product.purity);
  const [selectedSize, setSelectedSize] = useState<string>('18 inch');
  const [isPriceBreakupOpen, setIsPriceBreakupOpen] = useState<boolean>(true);
  const [pincode, setPincode] = useState<string>('400001');
  const [pincodeChecked, setPincodeChecked] = useState<boolean>(true);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [showInvoiceCustomerModal, setShowInvoiceCustomerModal] = useState<boolean>(false);

  // Active City Rate
  const activeCityRateObj = useMemo(() => {
    return INITIAL_CITY_RATES.find((c) => c.city === selectedCity) || INITIAL_CITY_RATES[0];
  }, [selectedCity]);

  // Rate per gram based on selected purity
  const ratePerGram = useMemo(() => {
    if (selectedPurity === '24K') return activeCityRateObj.price24K10g / 10;
    if (selectedPurity === '22K') return activeCityRateObj.price22K10g / 10;
    if (selectedPurity === '18K') return activeCityRateObj.price18K10g / 10;
    if (selectedPurity === '14K') return (activeCityRateObj.price24K10g * 0.585) / 10;
    if (selectedPurity === 'SILVER_999') return activeCityRateObj.silver1kg / 1000;
    return activeCityRateObj.price22K10g / 10;
  }, [selectedPurity, activeCityRateObj]);

  // Pricing calculations
  const pricing = useMemo(() => {
    const baseMetalCost = Math.round(product.netWeightGrams * ratePerGram);
    const makingCharges = Math.round((baseMetalCost * product.makingChargesPct) / 100);
    const stoneCharges = product.stoneChargesINR || 0;
    const huidFee = selectedPurity === 'SILVER_999' ? 0 : 53.10; // ₹45 + 18% GST

    const taxableAmount = baseMetalCost + makingCharges + stoneCharges + huidFee;
    const gstRate = 0.03;
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
  }, [product, ratePerGram, selectedPurity]);

  const handleGenerateInvoice = () => {
    const invoiceNumber = `BP-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: SavedInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      dateStr: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      customerName: customerName.trim() || 'Valued Jewellery Client',
      customerPhone: customerPhone.trim() || undefined,
      itemDescription: `${product.name} (${selectedPurity} BIS Hallmarked - SKU: ${product.sku || 'KS00517'})`,
      purity: selectedPurity,
      weightGrams: product.netWeightGrams,
      ratePerGram: pricing.ratePerGram,
      baseMetalCost: pricing.baseMetalCost,
      makingChargePct: product.makingChargesPct,
      makingChargesAmount: pricing.makingCharges,
      huidHallmarkFee: pricing.huidFee,
      taxableAmount: pricing.taxableAmount,
      cgstAmount: pricing.cgst,
      sgstAmount: pricing.sgst,
      totalGstAmount: pricing.gstAmount,
      totalInvoiceAmount: pricing.totalAmount,
      scrapResaleValue: pricing.scrapResale,
      appliedCity: selectedCity,
      sourceBenchmark: `Official IBJA ${selectedCity} Rate (${activeCityRateObj.publishedDate || 'Live Session'})`,
      status: 'ESTIMATE',
      notes: product.huidCode ? `HUID: ${product.huidCode}` : 'Hallmarked jewelry item',
    };

    onGenerateInvoice(product, newInvoice);
    setShowInvoiceCustomerModal(false);
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length >= 6) {
      setPincodeChecked(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-amber-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Catalogue
          </button>
          <span>/</span>
          <span>Jewellery</span>
          <span>/</span>
          <span className="capitalize">{product.category.toLowerCase().replace('_', ' ')}</span>
          <span>/</span>
          <span className="font-medium text-slate-900 truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`p-2 rounded-full border transition-colors cursor-pointer ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: product.name,
                  text: `Check out ${product.name} priced at ₹${pricing.totalAmount.toLocaleString('en-IN')}`,
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
            className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Share Product"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main PDP Grid: Left Gallery + Right Purchase & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Multi-photo Gallery (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Vertical Thumbnail Strip (if multiple photos) */}
            {photosList.length > 1 && (
              <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[500px] shrink-0 scrollbar-none">
                {photosList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-slate-50 shrink-0 ${
                      activePhotoIndex === idx 
                        ? 'border-amber-600 shadow-sm ring-1 ring-amber-600/30' 
                        : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Showcase Image */}
            <div className="relative flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-square flex items-center justify-center shadow-xs">
              {photosList.length > 0 ? (
                <img
                  src={photosList[activePhotoIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <Gem className="w-16 h-16 text-amber-500/40 mb-3" />
                  <p className="text-sm font-medium text-slate-600">No Image Uploaded</p>
                  <p className="text-xs text-slate-400 mt-1">Attach photos in the Add Product dialog</p>
                </div>
              )}

              {/* Badges on main image */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                <span className="px-2.5 py-1 rounded bg-amber-600/90 backdrop-blur-md text-white text-[11px] font-bold tracking-wider uppercase shadow-xs">
                  {selectedPurity} Hallmark
                </span>
                {product.huidCode && (
                  <span className="px-2 py-0.5 rounded bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200 text-[10px] font-mono font-bold shadow-xs">
                    HUID: {product.huidCode}
                  </span>
                )}
              </div>

              {/* Image counter indicator */}
              {photosList.length > 1 && (
                <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white text-xs font-mono font-medium">
                  {activePhotoIndex + 1} / {photosList.length}
                </div>
              )}
            </div>
          </div>

          {/* CaratLane Assurance Strip below Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-slate-900 block">100% Certified</span>
                <span className="text-slate-500">BIS Hallmark</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-slate-900 block">15-Day Return</span>
                <span className="text-slate-500">Money Back</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-slate-900 block">Lifetime</span>
                <span className="text-slate-500">Exchange & Buyback</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-slate-900 block">Free Shipping</span>
                <span className="text-slate-500">Transit Insured</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase & Breakdown Module (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Title & SKU */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold tracking-wider uppercase text-amber-700">
                CaratLane · BullionPulse Exclusives
              </span>
              <span className="font-mono text-slate-400">
                SKU: {product.sku || 'KS00517-2Y0000'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {product.name}
            </h1>

            {/* Ratings Bar */}
            <div className="flex items-center gap-2 mt-2">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <span>{product.rating || 4.9}</span>
                <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
              </div>
              <span className="text-xs text-slate-500">
                ({product.reviewCount || 38} Verified Reviews)
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> In Stock & Ready to Dispatch
              </span>
            </div>
          </div>

          {/* Prominent Final Price Box (CaratLane Signature) */}
          <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  ₹{pricing.totalAmount.toLocaleString('en-IN')}
                </span>
                <div className="text-xs text-slate-500 mt-0.5">
                  (MRP inclusive of all taxes, 3% GST & BIS Hallmarking)
                </div>
              </div>

              {/* City rate badge */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  IBJA Benchmark
                </span>
                <span className="text-xs font-bold text-amber-700 font-mono">
                  {selectedCity}: ₹{pricing.ratePerGram.toLocaleString('en-IN')}/g
                </span>
              </div>
            </div>

            {/* Dynamic City Benchmark Selector Dropdown */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <label className="text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Pricing City:</span>
              </label>
              <select
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 font-semibold rounded px-2.5 py-1 text-xs focus:outline-none focus:border-amber-600 cursor-pointer"
              >
                {INITIAL_CITY_RATES.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.city} ({selectedPurity}: ₹{((selectedPurity === '24K' ? c.price24K10g : selectedPurity === '18K' ? c.price18K10g : selectedPurity === 'SILVER_999' ? c.silver1kg / 100 : c.price22K10g) / 10).toLocaleString('en-IN')}/g)
                  </option>
                ))}
              </select>
            </div>

            {/* Price Breakup Accordion Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPriceBreakupOpen(!isPriceBreakupOpen)}
                className="w-full flex items-center justify-between text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors py-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  View Detailed Price Breakup
                </span>
                {isPriceBreakupOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Price Breakup Table (Signature CaratLane Feature) */}
              {isPriceBreakupOpen && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Gold Rate ({selectedPurity}):</span>
                    <span className="font-medium text-slate-900">₹{pricing.ratePerGram.toLocaleString('en-IN')} / g</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pure Gold Value ({product.netWeightGrams}g):</span>
                    <span className="font-medium text-slate-900">₹{pricing.baseMetalCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Making Charges ({product.makingChargesPct}%):</span>
                    <span className="font-medium text-slate-900">₹{pricing.makingCharges.toLocaleString('en-IN')}</span>
                  </div>
                  {pricing.stoneCharges > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Certified Gemstones:</span>
                      <span className="font-medium text-slate-900">₹{pricing.stoneCharges.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>BIS Hallmarking (HUID):</span>
                    <span className="font-medium text-slate-900">₹45.00</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between text-slate-700 font-semibold">
                    <span>Taxable Value:</span>
                    <span>₹{pricing.taxableAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>3% GST (1.5% CGST + 1.5% SGST):</span>
                    <span>₹{pricing.gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Hallmarking GST (18% on ₹45):</span>
                    <span>₹8.10</span>
                  </div>
                  <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline text-slate-950 font-bold text-sm">
                    <span>Final Payable Amount:</span>
                    <span className="text-base text-amber-700">₹{pricing.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-500 flex justify-between">
                    <span>Estimated 98% Resale Value:</span>
                    <span className="font-medium text-emerald-700">₹{pricing.scrapResale.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customisation: Metal Purity & Size Selectors */}
          <div className="space-y-4 p-4 bg-white border border-slate-200 rounded-xl">
            {/* Purity selector */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-2 uppercase tracking-wider">
                Select Metal & Purity:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['22K', '18K', '24K'] as GoldPurity[]).map((p) => {
                  const isSelected = selectedPurity === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setSelectedPurity(p)}
                      className={`p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 border-amber-600 text-amber-900 ring-1 ring-amber-600/30'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="block">{p} Gold</span>
                      <span className="text-[10px] font-normal text-slate-500">
                        {p === '22K' ? '916 Hallmark' : p === '18K' ? '750 Fine' : '999 Pure'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size / Length selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select Size / Chain Length:
                </label>
                <span className="text-[11px] text-amber-700 font-semibold cursor-pointer">
                  Size Guide
                </span>
              </div>
              <div className="flex gap-2">
                {['16 inch', '18 inch', '20 inch'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      selectedSize === s
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-1 ring-amber-600/30'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery & Pincode Checker */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Delivery & Store Availability
            </span>
            <form onSubmit={handlePincodeSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Check
              </button>
            </form>

            {pincodeChecked && (
              <div className="pt-2 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Free Insured Delivery to {pincode} by Tomorrow</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Cash on Delivery / Card swipe on delivery available in {selectedCity}
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => setShowInvoiceCustomerModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-amber-600/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Generate Estimated Jeweller Invoice</span>
            </button>

            <button
              onClick={() => onOpenPortfolioModal('XAU', product.name)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Add to Wealth Portfolio ({product.netWeightGrams}g)</span>
            </button>
          </div>

          {/* Product Specifications Table */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Product Specifications & BIS Hallmarking
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Design Code / SKU</span>
                <span className="font-mono font-semibold text-slate-900">{product.sku || 'KS00517-2Y0000'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Net Metal Weight</span>
                <span className="font-semibold text-slate-900">{product.netWeightGrams.toFixed(2)} grams</span>
              </div>
              {product.grossWeightGrams && (
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Gross Weight</span>
                  <span className="font-semibold text-slate-900">{product.grossWeightGrams.toFixed(2)} grams</span>
                </div>
              )}
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Metal & Purity</span>
                <span className="font-semibold text-slate-900">{selectedPurity} Hallmark Yellow Gold</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Dimensions</span>
                <span className="font-semibold text-slate-900">{product.dimensions || 'Height: 22.4 mm | Width: 20.8 mm'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">BIS Hallmarking Standard</span>
                <span className="font-semibold text-emerald-700">IS 1417:2019 Certified</span>
              </div>
              {product.huidCode && (
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">Unique HUID</span>
                  <span className="font-mono font-bold text-slate-900">{product.huidCode}</span>
                </div>
              )}
            </div>

            {product.description && (
              <div className="pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                <p>{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer details modal for generating official invoice */}
      {showInvoiceCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Customer Invoice Details
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prepare printable GST invoice for {product.name}
                </p>
              </div>
              <button
                onClick={() => setShowInvoiceCustomerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Customer / Buyer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Phone Number (Optional for SMS / WhatsApp bill)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98200 XXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>Selected Rate ({selectedCity}):</span>
                  <span>₹{pricing.ratePerGram.toLocaleString('en-IN')}/g</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>3% GST (1.5% CGST + 1.5% SGST):</span>
                  <span>₹{pricing.gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-950 pt-1 border-t border-amber-200 text-sm">
                  <span>Total Invoice Amount:</span>
                  <span className="text-amber-800">₹{pricing.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInvoiceCustomerModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateInvoice}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Open Printable Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
