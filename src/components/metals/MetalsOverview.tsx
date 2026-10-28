import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Bell, 
  PlusCircle, 
  Sparkles,
  ArrowRight,
  ShoppingBag,
  FileText
} from 'lucide-react';
import { MetalPrice, FXRate, Currency, WeightUnit, MetalSymbol } from '../../types';
import { formatPrice, convertPrice } from '../../services/marketData';

interface MetalsOverviewProps {
  metals: Record<MetalSymbol, MetalPrice>;
  fx: FXRate;
  currency: Currency;
  onOpenAlertModal: (symbol: string, name: string) => void;
  onOpenPortfolioModal: (symbol: string, name: string) => void;
  onViewCharts: (symbol: MetalSymbol) => void;
  onViewPurity: () => void;
  onViewCatalogue?: () => void;
}

export const MetalsOverview: React.FC<MetalsOverviewProps> = ({
  metals,
  fx,
  currency,
  onOpenAlertModal,
  onOpenPortfolioModal,
  onViewCharts,
  onViewPurity,
  onViewCatalogue,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<WeightUnit>('10g');

  const metalList: {
    symbol: MetalSymbol;
    name: string;
    color: string;
    bgGlow: string;
    borderGlow: string;
    accentText: string;
    description: string;
  }[] = [
    {
      symbol: 'XAU',
      name: 'Gold (Au 79)',
      color: 'amber',
      bgGlow: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderGlow: 'border-amber-500/30 hover:border-amber-500/60',
      accentText: 'text-amber-400',
      description: 'Global safe-haven reserve asset & sovereign wealth store',
    },
    {
      symbol: 'XAG',
      name: 'Silver (Ag 47)',
      color: 'slate',
      bgGlow: 'from-slate-400/10 via-slate-400/5 to-transparent',
      borderGlow: 'border-slate-500/30 hover:border-slate-400/60',
      accentText: 'text-slate-300',
      description: 'Dual role: monetary hedge & green-energy industrial metal (solar/EVs)',
    },
    {
      symbol: 'XPT',
      name: 'Platinum (Pt 78)',
      color: 'teal',
      bgGlow: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      borderGlow: 'border-cyan-500/30 hover:border-cyan-500/60',
      accentText: 'text-cyan-400',
      description: 'Rare catalytic metal & luxury jewelry standard, 30x rarer than gold',
    },
    {
      symbol: 'XPD',
      name: 'Palladium (Pd 46)',
      color: 'indigo',
      bgGlow: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
      borderGlow: 'border-indigo-500/30 hover:border-indigo-500/60',
      accentText: 'text-indigo-400',
      description: 'Crucial for hybrid automotive catalysts & semiconductor contacts',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Zone */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Precious Metals Real-Time Spot
            </h1>
            <span className="inline-flex items-center text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Institutional COMEX / LBMA spot rates synced with Indian retail import duty (6%) & GST (3%).
          </p>
        </div>

        {/* Weight Unit Segmented Filter */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1 self-start md:self-center">
          <span className="text-xs text-slate-400 px-2 font-medium">Unit:</span>
          {(['10g', 'g', 'sovereign', 'oz', 'kg'] as WeightUnit[]).map((unit) => {
            const labels: Record<WeightUnit, string> = {
              '10g': '10g (Tola)',
              'g': '1 Gram',
              'sovereign': '8g (Pavan)',
              'oz': '1 Oz (Troy)',
              'kg': '1 Kg',
            };
            const isSelected = selectedUnit === unit;
            return (
              <button
                key={unit}
                onClick={() => setSelectedUnit(unit)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {labels[unit]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Metals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metalList.map((item) => {
          const metal = metals[item.symbol];
          const isIndian = currency === 'INR';
          const convertedPrice = convertPrice(
            metal.priceUSDPerOz,
            currency,
            selectedUnit,
            fx,
            isIndian // Include Indian landed taxes when viewing in INR
          );

          const convertedHigh = convertPrice(
            metal.high24hUSD,
            currency,
            selectedUnit,
            fx,
            isIndian
          );

          const convertedLow = convertPrice(
            metal.low24hUSD,
            currency,
            selectedUnit,
            fx,
            isIndian
          );

          const isUp = metal.change24hPercent >= 0;
          const rangePct = Math.max(
            0,
            Math.min(
              100,
              ((metal.priceUSDPerOz - metal.low24hUSD) / (metal.high24hUSD - metal.low24hUSD)) * 100
            )
          );

          return (
            <div
              key={item.symbol}
              className={`bg-slate-900/70 border ${item.borderGlow} rounded-xl p-5 flex flex-col justify-between transition-all duration-200 relative group shadow-sm`}
            >
              <div>
                {/* Header: Name and Symbol */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                  <span className={`text-xs font-mono font-bold ${item.accentText}`}>
                    {item.symbol}
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                    {formatPrice(convertedPrice, currency, currency === 'INR' && (selectedUnit === '10g' || selectedUnit === 'kg') ? 0 : 2)}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`inline-flex items-center text-xs font-semibold font-mono tabular-nums ${
                        isUp ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                      {isUp ? '+' : ''}
                      {metal.change24hPercent.toFixed(2)}%
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      (24h: {isUp ? '+' : ''}
                      {formatPrice(
                        (metal.change24hUSD / 31.1035) * (selectedUnit === '10g' ? 10 : selectedUnit === 'kg' ? 1000 : 1) * (currency === 'INR' ? fx.USDINR : 1),
                        currency,
                        1
                      )})
                    </span>
                  </div>
                </div>

                {/* 24H Range Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                    <span>L: {formatPrice(convertedLow, currency, 0)}</span>
                    <span className="text-slate-500">24h Range</span>
                    <span>H: {formatPrice(convertedHigh, currency, 0)}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isUp ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${rangePct}%` }}
                    />
                  </div>
                </div>

                {/* Bid / Ask info */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-mono text-slate-400 bg-slate-950/60 rounded-lg p-2">
                  <div>
                    <span className="text-slate-500 block">Bid (Sell)</span>
                    <span className="text-slate-200">
                      ${metal.bidUSD.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Ask (Buy)</span>
                    <span className="text-slate-200">
                      ${metal.askUSD.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-1.5 mt-5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => onViewCharts(item.symbol)}
                  className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Open interactive historical charts"
                >
                  Chart
                </button>
                <button
                  onClick={() => onOpenAlertModal(item.symbol, item.name)}
                  className="py-1.5 px-2 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Set custom price alert"
                >
                  <Bell className="w-3 h-3" />
                  Alert
                </button>
                <button
                  onClick={() => onOpenPortfolioModal(item.symbol, item.name)}
                  className="py-1.5 px-2 bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Add to portfolio"
                >
                  <PlusCircle className="w-3 h-3" />
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Purity Engine Callout */}
        <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/20 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              IBJA Rates Benchmark
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              Live 24K, 22K, 18K City Engine
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Official IBJA benchmark rates across Mumbai, Delhi, Chennai, Bengaluru, and 10+ major bullion centers with making charges.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              22K: ~₹13,154/g
            </span>
            <button
              onClick={onViewPurity}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              Open Purity <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Jewellery Menu & Printable Invoices (NEW FEATURE) */}
        <div className="bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-between ring-1 ring-emerald-500/20">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
                <ShoppingBag className="w-4 h-4" />
                Jeweller Suite
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                New
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              Jewellery Menu & Tax Invoices
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Upload product photos, set weights & categories, calculate dynamic IBJA pricing, and generate printable GST tax invoices.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400">
              3% GST + BIS Hallmarking
            </span>
            <button
              onClick={onViewCatalogue}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              Open Catalogue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 3: Indian Market & SGB Callout */}
        <div className="bg-gradient-to-br from-blue-950/30 via-slate-900 to-slate-900 border border-blue-500/20 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs tracking-wider uppercase">
              <TrendingUp className="w-4 h-4" />
              Indian Wealth
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              SGBs, ETFs & NIFTY 50
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Track RBI Sovereign Gold Bonds, GOLDBEES, SILVERBEES, and leading precious metal equities with real-time portfolio tracking.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              SGB · GOLDBEES · NIFTY 50
            </span>
            <button
              onClick={() => onViewCharts('XAU')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Analyze Trends <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
