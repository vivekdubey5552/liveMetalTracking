import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  MapPin, 
  ShieldCheck, 
  Receipt, 
  Percent, 
  Scale, 
  Info,
  CheckCircle2,
  Building2,
  ExternalLink,
  Printer,
  FileText,
  Sparkles
} from 'lucide-react';
import { MetalPrice, FXRate, GoldPurity, CityGoldRate } from '../../types';
import { calculateGoldRates, estimateJewelryCost, INITIAL_CITY_RATES } from '../../services/marketData';
import { IBJARatesTable } from './IBJARatesTable';
import { SavedInvoice } from '../../types';

interface PurityCalculatorProps {
  goldPrice: MetalPrice;
  fx: FXRate;
  onOpenAlertModal: (symbol: string, name: string) => void;
  onOpenPortfolioModal: (symbol: string, name: string) => void;
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
  onGenerateInvoice?: (invoice: SavedInvoice) => void;
  onOpenSavedInvoices?: () => void;
  savedInvoicesCount?: number;
}

export const PurityCalculator: React.FC<PurityCalculatorProps> = ({
  goldPrice,
  fx,
  onOpenAlertModal,
  onOpenPortfolioModal,
  selectedCity: parentSelectedCity,
  onSelectCity: parentOnSelectCity,
  onGenerateInvoice,
  onOpenSavedInvoices,
  savedInvoicesCount = 0,
}) => {
  // Calculator state
  const [calcPurity, setCalcPurity] = useState<GoldPurity>('22K');
  const [calcWeight, setCalcWeight] = useState<number>(10);
  const [makingChargesPct, setMakingChargesPct] = useState<number>(10);
  const [internalCity, setInternalCity] = useState<string>('Mumbai');

  const selectedCity = parentSelectedCity || internalCity;
  const setSelectedCity = (c: string) => {
    if (parentOnSelectCity) {
      parentOnSelectCity(c);
    } else {
      setInternalCity(c);
    }
  };

  // Compute live purity rates based on spot and FX
  const goldRates = useMemo(() => {
    return calculateGoldRates(goldPrice.priceUSDPerOz, fx.USDINR);
  }, [goldPrice.priceUSDPerOz, fx.USDINR]);

  // Active City Rate object for IBJA city benchmark
  const activeCityRateObj = useMemo(() => {
    return INITIAL_CITY_RATES.find((c) => c.city === selectedCity) || INITIAL_CITY_RATES[0];
  }, [selectedCity]);

  // Compute estimated jewelry bill applying the active city IBJA benchmark rates
  const invoiceEstimate = useMemo(() => {
    return estimateJewelryCost(calcPurity, calcWeight, makingChargesPct, goldRates, activeCityRateObj);
  }, [calcPurity, calcWeight, makingChargesPct, goldRates, activeCityRateObj]);

  const purityCards: {
    purity: GoldPurity;
    title: string;
    fineness: string;
    useCase: string;
    color: string;
    border: string;
    badgeBg: string;
    ratePerGram: number;
    ratePer10g: number;
    ratePer8g: number;
    ratePer100g: number;
  }[] = [
    {
      purity: '24K',
      title: '24 Karat (Pure Bullion)',
      fineness: '99.9% Pure (999 Hallmark)',
      useCase: 'Investment bars, coins, sovereign reserve; too soft for stone jewellery',
      color: 'text-amber-400',
      border: 'border-amber-500/40 bg-amber-500/5',
      badgeBg: 'bg-amber-500/15 text-amber-300',
      ratePerGram: goldRates.rate24K.perGram,
      ratePer10g: goldRates.rate24K.per10g,
      ratePer8g: goldRates.rate24K.per8g,
      ratePer100g: goldRates.rate24K.per100g,
    },
    {
      purity: '22K',
      title: '22 Karat (Standard Hallmark)',
      fineness: '91.6% Pure (916 Hallmark)',
      useCase: 'Primary Indian jewellery benchmark, bridal sets, bangles, chains',
      color: 'text-yellow-400',
      border: 'border-yellow-500/40 bg-yellow-500/5',
      badgeBg: 'bg-yellow-500/15 text-yellow-300',
      ratePerGram: goldRates.rate22K.perGram,
      ratePer10g: goldRates.rate22K.per10g,
      ratePer8g: goldRates.rate22K.per8g,
      ratePer100g: goldRates.rate22K.per100g,
    },
    {
      purity: '18K',
      title: '18 Karat (Diamond & Stone)',
      fineness: '75.0% Pure (750 Hallmark)',
      useCase: 'Diamond & gemstone studded jewellery, luxury watches, modern minimalist rings',
      color: 'text-orange-400',
      border: 'border-orange-500/40 bg-orange-500/5',
      badgeBg: 'bg-orange-500/15 text-orange-300',
      ratePerGram: goldRates.rate18K.perGram,
      ratePer10g: goldRates.rate18K.per10g,
      ratePer8g: goldRates.rate18K.per8g,
      ratePer100g: goldRates.rate18K.per100g,
    },
    {
      purity: '14K',
      title: '14 Karat (Modern Daily Wear)',
      fineness: '58.3% Pure (585 Hallmark)',
      useCase: 'Lightweight western everyday jewellery, high durability & scratch resistance',
      color: 'text-slate-300',
      border: 'border-slate-600/40 bg-slate-800/20',
      badgeBg: 'bg-slate-700/50 text-slate-200',
      ratePerGram: goldRates.rate14K.perGram,
      ratePer10g: goldRates.rate14K.per10g,
      ratePer8g: goldRates.rate14K.per8g,
      ratePer100g: goldRates.rate14K.per100g,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Live Gold Purity Rates & Indian Benchmark
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                BIS 916 / 999 Standard
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Calculated live from Spot Gold (${goldPrice.priceUSDPerOz.toFixed(2)}/oz) + USD/INR (₹{fx.USDINR.toFixed(2)}) + 6% Import Duty + 3% GST.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenAlertModal('XAU', 'Gold 22K (India)')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Set Purity Alert
            </button>
            <button
              onClick={() => onOpenPortfolioModal('XAU', 'Physical Gold')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Add Physical Gold
            </button>
          </div>
        </div>
      </div>

      {/* Official IBJA Benchmark Rates Table */}
      <IBJARatesTable
        onOpenAlertModal={onOpenAlertModal}
        onSelectPurityForCalc={(p) => setCalcPurity(p)}
      />

      {/* 24K, 22K, 18K, 14K Purity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {purityCards.map((card) => (
          <div
            key={card.purity}
            className={`border ${card.border} rounded-xl p-5 flex flex-col justify-between transition-all`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${card.badgeBg}`}>
                    {card.purity} Purity
                  </span>
                  <h3 className="text-base font-bold text-white mt-2">
                    {card.title}
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">{card.fineness}</span>
              </div>

              {/* Main rate: 10 Grams */}
              <div className="mt-4">
                <span className="text-[11px] text-slate-400 block font-mono">10 Grams (1 Tola)</span>
                <div className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums ${card.color}`}>
                  ₹{card.ratePer10g.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Breakdown sub-rates */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">1 Gram:</span>
                  <span className="font-semibold text-white">₹{card.ratePerGram.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">8 Grams (Sovereign/Pavan):</span>
                  <span className="font-semibold text-white">₹{card.ratePer8g.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">100 Grams:</span>
                  <span className="font-semibold text-white">₹{card.ratePer100g.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-4 leading-relaxed pt-3 border-t border-slate-800/60">
                {card.useCase}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Jewellery Invoice Calculator & Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input parameters */}
        <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calculator className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Jewellery Purchase Invoice Estimator
              </h3>
              <p className="text-xs text-slate-400">
                Calculates real purchase bills applying official IBJA rates for your active city.
              </p>
            </div>
          </div>

          {/* Active City IBJA Selector */}
          <div className="bg-slate-950/90 border border-amber-500/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Active City IBJA Benchmark:
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                IBJA {selectedCity} Active
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {INITIAL_CITY_RATES.map((c) => (
                <button
                  key={c.city}
                  type="button"
                  onClick={() => setSelectedCity(c.city)}
                  className={`py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors cursor-pointer text-center whitespace-nowrap ${
                    selectedCity === c.city
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {c.city}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1.5 border-t border-slate-900">
              <span>Applied {selectedCity} {calcPurity} Rate:</span>
              <span className="text-amber-400 font-bold">
                ₹{invoiceEstimate.ratePerGram.toLocaleString('en-IN')}/g (₹{(invoiceEstimate.ratePerGram * 10).toLocaleString('en-IN')}/10g)
              </span>
            </div>
          </div>

          {/* Purity selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Select Gold Purity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['24K', '22K', '18K'] as GoldPurity[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setCalcPurity(p)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${
                    calcPurity === p
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {p} ({p === '24K' ? '999 Bullion' : p === '22K' ? '916 Hallmark' : '750 Diamond'})
                </button>
              ))}
            </div>
          </div>

          {/* Weight selector with quick presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                Weight in Grams:
              </label>
              <div className="flex items-center gap-1">
                {[4, 8, 10, 16, 25, 50].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCalcWeight(preset)}
                    className={`px-2 py-0.5 text-[11px] rounded transition-colors cursor-pointer ${
                      calcWeight === preset
                        ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40'
                        : 'text-slate-400 hover:text-white bg-slate-800/80'
                    }`}
                  >
                    {preset}g
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={calcWeight}
                onChange={(e) => setCalcWeight(Math.max(0.1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                grams
              </span>
            </div>
          </div>

          {/* Making charge slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                Making Charges (Wastage + Craftsmanship):
              </label>
              <span className="text-xs font-bold text-amber-400 font-mono">
                {makingChargesPct}%
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="25"
              step="1"
              value={makingChargesPct}
              onChange={(e) => setMakingChargesPct(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
              <span>3% (Plain Coin)</span>
              <span>8-12% (Chains/Bangles)</span>
              <span>18-25% (Antiques/Kundan)</span>
            </div>
          </div>
        </div>

        {/* Right: Bill Invoice Output & Resale Scrap Value */}
        <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Estimated Jeweller Invoice
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-mono mt-0.5">
                    <MapPin className="w-3 h-3 inline" />
                    <span>Applied: IBJA {selectedCity} Rate</span>
                  </div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-bold text-white block">
                  ₹{invoiceEstimate.ratePerGram.toLocaleString('en-IN')}/g
                </span>
                <span className="text-[10px] text-slate-400">
                  ₹{(invoiceEstimate.ratePerGram * 10).toLocaleString('en-IN')}/10g
                </span>
              </div>
            </div>

            {/* Invoice Line Items */}
            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <div>
                  <span className="text-slate-400 block">
                    1. Base Pure Metal Cost ({calcWeight}g × ₹{invoiceEstimate.ratePerGram.toLocaleString('en-IN')}/g)
                  </span>
                  <span className="text-[10px] text-amber-400/80">
                    Official IBJA {selectedCity} {calcPurity} rate applied
                  </span>
                </div>
                <span className="font-semibold text-white">
                  ₹{invoiceEstimate.baseGoldCost.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">
                  2. Making Charges ({makingChargesPct}% of metal)
                </span>
                <span className="font-semibold text-amber-400">
                  + ₹{invoiceEstimate.makingCharges.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">
                  3. BIS Hallmarking (HUID fee ₹45 + 18% GST)
                </span>
                <span className="font-semibold text-slate-300">
                  + ₹{invoiceEstimate.huidHallmarkFee.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">
                  4. GST (3% on metal & making charges)
                </span>
                <span className="font-semibold text-slate-300">
                  + ₹{invoiceEstimate.gstAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Total Invoice */}
              <div className="pt-3 border-t border-slate-700 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-white block">
                    Total Estimated Invoice
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Inclusive of IBJA {selectedCity} rate, making, HUID & 3% GST
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-amber-400 tabular-nums">
                  ₹{invoiceEstimate.totalInvoiceAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Resale Reality Box */}
          <div className="mt-5 bg-slate-950/80 border border-slate-800 rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Instant Scrap / Resale Realization ({selectedCity} Buyback)</span>
            </div>
            <div className="flex items-baseline justify-between mt-2 font-mono">
              <span className="text-lg font-bold text-emerald-400 tabular-nums">
                ₹{invoiceEstimate.scrapResaleValue.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-rose-400">
                - ₹{(invoiceEstimate.totalInvoiceAmount - invoiceEstimate.scrapResaleValue).toLocaleString('en-IN')} (Making & GST sunk cost)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-normal">
              Based on {selectedCity} IBJA bullion rates. Jewellers deduct making charges & GST, returning 98% of the pure metal spot value.
            </p>
          </div>

          {/* Invoice Actions */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                if (onGenerateInvoice) {
                  const invoiceNumber = `BP-EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                  const newInvoice: SavedInvoice = {
                    id: `inv-${Date.now()}`,
                    invoiceNumber,
                    dateStr: new Date().toISOString().split('T')[0],
                    timestamp: Date.now(),
                    customerName: 'Customer Estimate',
                    itemDescription: `${calcWeight}g ${calcPurity} Hallmarked Gold Jewellery`,
                    purity: calcPurity,
                    weightGrams: calcWeight,
                    ratePerGram: invoiceEstimate.ratePerGram,
                    baseMetalCost: invoiceEstimate.baseGoldCost,
                    makingChargePct: makingChargesPct,
                    makingChargesAmount: invoiceEstimate.makingCharges,
                    huidHallmarkFee: invoiceEstimate.huidHallmarkFee,
                    taxableAmount: invoiceEstimate.baseGoldCost + invoiceEstimate.makingCharges + invoiceEstimate.huidHallmarkFee,
                    cgstAmount: Math.round(invoiceEstimate.gstAmount / 2),
                    sgstAmount: Math.round(invoiceEstimate.gstAmount / 2),
                    totalGstAmount: invoiceEstimate.gstAmount,
                    totalInvoiceAmount: invoiceEstimate.totalInvoiceAmount,
                    scrapResaleValue: invoiceEstimate.scrapResaleValue,
                    appliedCity: selectedCity,
                    sourceBenchmark: `Official IBJA ${selectedCity} Benchmark Rate (${activeCityRateObj.publishedDate || 'Live Session'})`,
                    status: 'ESTIMATE',
                    notes: `Calculated at ₹${invoiceEstimate.ratePerGram.toLocaleString('en-IN')}/g (IBJA ${selectedCity})`,
                  };
                  onGenerateInvoice(newInvoice);
                }
              }}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Print Tax Invoice ({selectedCity} IBJA)</span>
            </button>

            {onOpenSavedInvoices && (
              <button
                onClick={onOpenSavedInvoices}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="View All Tracked Invoices"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Saved Invoices</span>
                {savedInvoicesCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold flex items-center justify-center">
                    {savedInvoicesCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Major Indian Cities Benchmark Rates */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Major Indian Cities Live Bullion Benchmark (IBJA Rates)
              </h3>
              <p className="text-xs text-slate-400">
                City-wise retail association prices for 10g Gold (24K, 22K, 18K) and 1kg Silver.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Selected City:</span>
            <span className="font-bold text-amber-400">{selectedCity}</span>
          </div>
        </div>

        {/* City table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-sans">
                <th className="py-2.5 px-3">City & Region</th>
                <th className="py-2.5 px-3 text-right">24K Gold (10g)</th>
                <th className="py-2.5 px-3 text-right">22K Gold (10g)</th>
                <th className="py-2.5 px-3 text-right">18K Gold (10g)</th>
                <th className="py-2.5 px-3 text-right">Silver (1 Kg)</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {INITIAL_CITY_RATES.map((cityRate: CityGoldRate) => {
                const isSelected = selectedCity === cityRate.city;
                return (
                  <tr
                    key={cityRate.city}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-amber-500/10' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-sans font-medium text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {cityRate.city}
                      <span className="text-[11px] text-slate-400">({cityRate.state})</span>
                    </td>
                    <td className="py-3 px-3 text-right text-amber-300 font-bold tabular-nums">
                      ₹{cityRate.price24K10g.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right text-yellow-300 font-semibold tabular-nums">
                      ₹{cityRate.price22K10g.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right text-orange-300 tabular-nums">
                      ₹{cityRate.price18K10g.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                      ₹{cityRate.silver1kg.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedCity(cityRate.city)}
                        className={`px-2.5 py-1 rounded text-[11px] font-sans font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                        title={`Apply ${cityRate.city} IBJA rates to the Jewellery Invoice Estimator`}
                      >
                        {isSelected ? '✓ Applied to Invoice' : 'Apply to Invoice'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BIS Hallmarking Trust & Purity Guide */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">
            Mandatory BIS Hallmarking Standards in India
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <span className="font-bold text-white block mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              BIS Logo (Triangular Mark)
            </span>
            Certifies the piece has been verified by a Bureau of Indian Standards approved assaying center.
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <span className="font-bold text-white block mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Purity & Fineness Code
            </span>
            999 indicates 24K (99.9% purity), 916 indicates 22K (91.6% purity), and 750 indicates 18K (75.0% purity).
          </div>
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
            <span className="font-bold text-white block mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              6-Digit Alphanumeric HUID
            </span>
            Every individual jewelry item has a unique Hallmarking Unique ID (HUID) trackable via the BIS Care mobile app.
          </div>
        </div>
      </div>
    </div>
  );
};
