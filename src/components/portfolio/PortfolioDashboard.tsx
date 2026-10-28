import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  ShieldCheck, 
  Coins, 
  Wallet,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { 
  PortfolioHolding, 
  MetalPrice, 
  IndianStockQuote, 
  FXRate, 
  Currency, 
  AssetCategory 
} from '../../types';
import { calculateGoldRates, calculateSilverRates, formatPrice } from '../../services/marketData';

interface PortfolioDashboardProps {
  holdings: PortfolioHolding[];
  metals: Record<string, MetalPrice>;
  stocks: IndianStockQuote[];
  fx: FXRate;
  currency: Currency;
  onOpenAddHolding: () => void;
  onDeleteHolding: (id: string) => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => void;
  onResetDemo: () => void;
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  holdings,
  metals,
  stocks,
  fx,
  currency,
  onOpenAddHolding,
  onDeleteHolding,
  onExportBackup,
  onImportBackup,
  onResetDemo,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'holdings' | 'allocation' | 'analytics'>('holdings');

  // Compute live gold & silver benchmark rates
  const goldRates = useMemo(() => {
    return calculateGoldRates(metals.XAU.priceUSDPerOz, fx.USDINR);
  }, [metals.XAU.priceUSDPerOz, fx.USDINR]);

  const silverRates = useMemo(() => {
    return calculateSilverRates(metals.XAG.priceUSDPerOz, fx.USDINR);
  }, [metals.XAG.priceUSDPerOz, fx.USDINR]);

  // Compute live valuation for each holding
  const evaluatedHoldings = useMemo(() => {
    return holdings.map((h) => {
      let currentUnitPriceINR = 0;

      if (h.category === 'PHYSICAL_GOLD') {
        const ratePerGram = h.purity === '22K' 
          ? goldRates.rate22K.perGram 
          : h.purity === '18K' 
          ? goldRates.rate18K.perGram 
          : goldRates.rate24K.perGram;
        
        // Handle units: if user stored quantity in grams vs tola
        if (h.unit === 'tola') {
          currentUnitPriceINR = ratePerGram * 10;
        } else {
          currentUnitPriceINR = ratePerGram;
        }
      } else if (h.category === 'PHYSICAL_SILVER') {
        if (h.unit === 'kg') {
          currentUnitPriceINR = silverRates.perKg;
        } else {
          currentUnitPriceINR = silverRates.perGram;
        }
      } else if (h.category === 'SOVEREIGN_GOLD_BOND') {
        const sgbQuote = stocks.find((s) => s.symbol === h.symbol) || stocks.find((s) => s.category === 'SGB');
        currentUnitPriceINR = sgbQuote ? sgbQuote.currentPrice : goldRates.rate24K.perGram;
      } else if (h.category === 'GOLD_ETF') {
        const etfQuote = stocks.find((s) => s.symbol === h.symbol) || stocks.find((s) => s.symbol === 'GOLDBEES');
        currentUnitPriceINR = etfQuote ? etfQuote.currentPrice : 117.13;
      } else if (h.category === 'SILVER_ETF') {
        const etfQuote = stocks.find((s) => s.symbol === h.symbol) || stocks.find((s) => s.symbol === 'SILVERBEES');
        currentUnitPriceINR = etfQuote ? etfQuote.currentPrice : 183.90;
      } else if (h.category === 'CASH_FD') {
        currentUnitPriceINR = h.averageBuyPrice; // Par value
      } else {
        // Equities or other
        const stockQuote = stocks.find((s) => s.symbol === h.symbol);
        currentUnitPriceINR = stockQuote ? stockQuote.currentPrice : h.averageBuyPrice;
      }

      // If averageBuyPrice is per 10g for gold in tola format, normalize
      let buyUnitPrice = h.averageBuyPrice;
      if (h.category === 'PHYSICAL_GOLD' && h.unit === 'g' && h.averageBuyPrice > 35000) {
        // User entered price per 10g instead of per gram
        buyUnitPrice = h.averageBuyPrice / 10;
      }

      const totalInvestedINR = h.quantity * buyUnitPrice;
      const currentTotalValueINR = h.quantity * currentUnitPriceINR;
      const unrealizedPnlINR = currentTotalValueINR - totalInvestedINR;
      const returnPct = totalInvestedINR > 0 ? (unrealizedPnlINR / totalInvestedINR) * 100 : 0;

      return {
        ...h,
        normalizedBuyPrice: buyUnitPrice,
        currentUnitPriceINR,
        totalInvestedINR,
        currentTotalValueINR,
        unrealizedPnlINR,
        returnPct,
      };
    });
  }, [holdings, goldRates, silverRates, stocks]);

  // Aggregate Portfolio Totals
  const portfolioSummary = useMemo(() => {
    let totalInvestedINR = 0;
    let currentTotalValueINR = 0;
    let totalGoldGrams = 0;

    evaluatedHoldings.forEach((h) => {
      totalInvestedINR += h.totalInvestedINR;
      currentTotalValueINR += h.currentTotalValueINR;

      if (h.category === 'PHYSICAL_GOLD') {
        totalGoldGrams += h.unit === 'tola' ? h.quantity * 10 : h.quantity;
      } else if (h.category === 'SOVEREIGN_GOLD_BOND') {
        totalGoldGrams += h.quantity; // 1 SGB unit = 1g gold
      }
    });

    const totalGainLossINR = currentTotalValueINR - totalInvestedINR;
    const totalReturnPct = totalInvestedINR > 0 ? (totalGainLossINR / totalInvestedINR) * 100 : 0;

    return {
      totalInvestedINR,
      currentTotalValueINR,
      totalGainLossINR,
      totalReturnPct,
      totalGoldGrams,
    };
  }, [evaluatedHoldings]);

  // Category Allocation Breakdown
  const categoryAllocation = useMemo(() => {
    const map: Record<string, { label: string; valueINR: number; color: string }> = {
      PHYSICAL_GOLD: { label: 'Physical Gold (24K/22K)', valueINR: 0, color: '#f59e0b' },
      SOVEREIGN_GOLD_BOND: { label: 'Sovereign Gold Bonds (SGB)', valueINR: 0, color: '#fbbf24' },
      GOLD_ETF: { label: 'Gold ETFs (Gold BeES)', valueINR: 0, color: '#eab308' },
      PHYSICAL_SILVER: { label: 'Physical Silver', valueINR: 0, color: '#94a3b8' },
      SILVER_ETF: { label: 'Silver ETFs', valueINR: 0, color: '#cbd5e1' },
      INDIAN_EQUITIES: { label: 'Indian Equities (Stocks)', valueINR: 0, color: '#3b82f6' },
      CASH_FD: { label: 'Liquid Cash / FD Reserve', valueINR: 0, color: '#10b981' },
      PLATINUM_PALLADIUM: { label: 'Platinum & Palladium', valueINR: 0, color: '#06b6d4' },
      DIGITAL_GOLD: { label: 'Digital Gold', valueINR: 0, color: '#d97706' },
    };

    evaluatedHoldings.forEach((h) => {
      if (map[h.category]) {
        map[h.category].valueINR += h.currentTotalValueINR;
      }
    });

    const total = portfolioSummary.currentTotalValueINR || 1;
    return Object.values(map)
      .filter((item) => item.valueINR > 0)
      .map((item) => ({
        ...item,
        percentage: (item.valueINR / total) * 100,
      }))
      .sort((a, b) => b.valueINR - a.valueINR);
  }, [evaluatedHoldings, portfolioSummary.currentTotalValueINR]);

  // File import helper
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onImportBackup(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const isINR = currency === 'INR';
  const currencyMultiplier = isINR ? 1 : 1 / fx.USDINR;

  return (
    <div className="space-y-6">
      {/* Portfolio Header & Global Actions */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Multi-Asset Wealth & Portfolio Tracker
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Diversified Wealth
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Consolidated real-time tracking for Physical Bullion, SGBs, ETFs, Indian Equities, and Liquid Reserves.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddHolding}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Investment
            </button>
            <button
              onClick={onExportBackup}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
              title="Export Portfolio Backup (JSON)"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
              title="Import Portfolio Backup"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
            <button
              onClick={onResetDemo}
              className="px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs transition-colors cursor-pointer"
              title="Reset to default diversified demo portfolio"
            >
              Reset Demo
            </button>
          </div>
        </div>

        {/* 4 Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* Total Net Worth */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4">
            <span className="text-xs text-slate-400 font-sans block">Total Portfolio Value</span>
            <div className="text-2xl font-extrabold text-white font-mono tabular-nums mt-1">
              {formatPrice(portfolioSummary.currentTotalValueINR * currencyMultiplier, currency, 0)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              Invested: {formatPrice(portfolioSummary.totalInvestedINR * currencyMultiplier, currency, 0)}
            </span>
          </div>

          {/* Unrealized Gain/Loss */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4">
            <span className="text-xs text-slate-400 font-sans block">Total Unrealized P&L</span>
            <div
              className={`text-2xl font-extrabold font-mono tabular-nums mt-1 flex items-center ${
                portfolioSummary.totalGainLossINR >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {portfolioSummary.totalGainLossINR >= 0 ? (
                <TrendingUp className="w-5 h-5 mr-1 inline" />
              ) : (
                <TrendingDown className="w-5 h-5 mr-1 inline" />
              )}
              {portfolioSummary.totalGainLossINR >= 0 ? '+' : ''}
              {formatPrice(portfolioSummary.totalGainLossINR * currencyMultiplier, currency, 0)}
            </div>
            <span
              className={`text-[11px] font-mono font-bold mt-1 block ${
                portfolioSummary.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {portfolioSummary.totalReturnPct >= 0 ? '+' : ''}
              {portfolioSummary.totalReturnPct.toFixed(2)}% Overall Return
            </span>
          </div>

          {/* Physical & SGB Gold Accumulation */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4">
            <span className="text-xs text-slate-400 font-sans block">Total Gold Reserve</span>
            <div className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums mt-1 flex items-center">
              <Coins className="w-5 h-5 mr-1.5" />
              {portfolioSummary.totalGoldGrams.toFixed(1)}g
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">
              {(portfolioSummary.totalGoldGrams / 10).toFixed(2)} Tolas · {(portfolioSummary.totalGoldGrams / 8).toFixed(2)} Sovereign Pavans
            </span>
          </div>

          {/* Annual Passive Yield */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4">
            <span className="text-xs text-slate-400 font-sans block">Annual SGB & FD Interest</span>
            <div className="text-2xl font-extrabold text-cyan-400 font-mono tabular-nums mt-1">
              ₹14,440 <span className="text-xs text-slate-400 font-normal">/ yr</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              2.5% RBI coupon + 7.5% Liquid FD yield
            </span>
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs: Holdings vs Allocation vs Risk Health */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('holdings')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeSubTab === 'holdings'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Asset Holdings ({evaluatedHoldings.length})
        </button>
        <button
          onClick={() => setActiveSubTab('allocation')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeSubTab === 'allocation'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Asset Allocation Breakdown
        </button>
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeSubTab === 'analytics'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Diversification Health & SGB Perks
        </button>
      </div>

      {/* Tab 1: Holdings Table */}
      {activeSubTab === 'holdings' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-sans">
                  <th className="py-3 px-4">Asset / Security</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3 text-right">Avg Buy (₹)</th>
                  <th className="py-3 px-3 text-right">Current Rate (₹)</th>
                  <th className="py-3 px-3 text-right">Current Value</th>
                  <th className="py-3 px-3 text-right">Unrealized P&L</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {evaluatedHoldings.map((h) => {
                  const isGain = h.unrealizedPnlINR >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-sans font-bold text-white text-sm">
                          {h.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span className="text-amber-400 font-semibold">{h.symbol}</span>
                          {h.purity && <span>· {h.purity} Purity</span>}
                          {h.purchaseDate && <span>· Acquired {h.purchaseDate}</span>}
                        </div>
                        {h.notes && (
                          <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 italic">
                            {h.notes}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            h.category.includes('GOLD')
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : h.category.includes('SILVER')
                              ? 'bg-slate-500/15 text-slate-300 border border-slate-500/30'
                              : h.category === 'INDIAN_EQUITIES'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {h.category.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-3 text-right text-slate-200 font-bold tabular-nums">
                        {h.quantity.toLocaleString()} {h.unit}
                      </td>

                      {/* Avg Buy */}
                      <td className="py-3 px-3 text-right text-slate-400 tabular-nums">
                        ₹{h.normalizedBuyPrice.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                      </td>

                      {/* Current Rate */}
                      <td className="py-3 px-3 text-right text-slate-200 font-semibold tabular-nums">
                        ₹{h.currentUnitPriceINR.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                      </td>

                      {/* Total Value */}
                      <td className="py-3 px-3 text-right text-white font-bold tabular-nums text-sm">
                        {formatPrice(h.currentTotalValueINR * currencyMultiplier, currency, 0)}
                      </td>

                      {/* Unrealized P&L */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span className={`font-bold ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isGain ? '+' : ''}
                          {formatPrice(h.unrealizedPnlINR * currencyMultiplier, currency, 0)}
                        </span>
                        <span
                          className={`text-[10px] block font-semibold ${
                            isGain ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          ({isGain ? '+' : ''}{h.returnPct.toFixed(2)}%)
                        </span>
                      </td>

                      {/* Delete Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onDeleteHolding(h.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove holding"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Allocation Breakdown */}
      {activeSubTab === 'allocation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Visual Bar Breakdown & Donut */}
          <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-400" />
              Asset Class Allocation
            </h3>
            <p className="text-xs text-slate-400">
              Balanced distribution across physical bullion, sovereign paper gold, ETFs, and growth equities.
            </p>

            {/* Stacked Progress Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-800 mt-4">
              {categoryAllocation.map((cat, idx) => (
                <div
                  key={idx}
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  title={`${cat.label}: ${cat.percentage.toFixed(1)}%`}
                />
              ))}
            </div>

            {/* List with percentages */}
            <div className="space-y-3 mt-4 pt-2">
              {categoryAllocation.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-300 font-sans">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">
                      {formatPrice(cat.valueINR * currencyMultiplier, currency, 0)}
                    </span>
                    <span className="font-bold text-white w-14 text-right">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Benchmark Comparison */}
          <div className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Wealth Preservation Benchmark Comparison
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Comparison against Ray Dalio All-Weather & Indian Family Office Gold allocation standards.
              </p>

              <div className="mt-4 space-y-4 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80">
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-amber-400">Precious Metals Total (Gold + Silver)</span>
                    <span className="text-white font-mono">
                      {(
                        categoryAllocation
                          .filter((c) => c.label.includes('Gold') || c.label.includes('Silver'))
                          .reduce((acc, curr) => acc + curr.percentage, 0)
                      ).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Recommended Indian wealth allocation is <strong>15% - 25%</strong> as a non-correlated inflation hedge and rupee currency depreciation protector.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80">
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-blue-400">Growth Equities & Stocks</span>
                    <span className="text-white font-mono">
                      {(
                        categoryAllocation
                          .find((c) => c.label.includes('Equities'))
                          ?.percentage || 0
                      ).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Recommended long-term compounding growth bucket in Indian blue-chip indices (NIFTY 50 / SENSEX) is <strong>50% - 60%</strong>.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80">
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-emerald-400">Cash / Liquid Emergency Buffer</span>
                    <span className="text-white font-mono">
                      {(
                        categoryAllocation
                          .find((c) => c.label.includes('Cash'))
                          ?.percentage || 0
                      ).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Ensures you never need to sell gold or equities during market crashes to fund sudden expenses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Risk & SGB Perks */}
      {activeSubTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Sovereign Gold Bond (SGB) Tax Architecture
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              In India, Sovereign Gold Bonds offer an unmatched regulatory advantage over physical jewellery:
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Exempt Capital Gains:</strong> Unlike physical gold which incurs 12.5% Long-Term Capital Gains (LTCG) tax, SGB capital gains upon maturity redemption are <strong>100% tax-free</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Zero GST on Purchase:</strong> Physical gold incurs 3% GST + 6% import customs duty. SGBs have 0% GST.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>
                  <strong>2.5% Annual Interest:</strong> Paid directly every 6 months to your linked bank account.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Physical Gold Security & Storage Guidelines
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Best practices for safeguarding physical bullion in India:
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Bank Locker Insurance:</strong> Under RBI guidelines, banks offer security lockers, but ensure you also maintain personal jewellery insurance for transit or household wear.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Hallmark Certificate Verification:</strong> Always retain the original tax invoice and verify the 6-digit HUID code using the official BIS Care app.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Tamper-Proof Packaging:</strong> Minted bullion bars (such as MMTC-PAMP, BRPL, or Kundan) should remain in their original assay certified certicard blisters for 100% buyback guarantee without melting losses.
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
