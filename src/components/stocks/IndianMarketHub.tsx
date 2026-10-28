import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Bell, 
  PlusCircle, 
  ShieldCheck, 
  Coins, 
  Building2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { IndianStockQuote } from '../../types';

interface IndianMarketHubProps {
  stocks: IndianStockQuote[];
  onOpenAlertModal: (symbol: string, name: string) => void;
  onOpenPortfolioModal: (symbol: string, name: string) => void;
}

export const IndianMarketHub: React.FC<IndianMarketHubProps> = ({
  stocks,
  onOpenAlertModal,
  onOpenPortfolioModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredStocks = useMemo(() => {
    return stocks.filter((item) => {
      const matchesCategory =
        activeCategory === 'ALL' || item.category === activeCategory;
      const matchesSearch =
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.underlyingAsset && item.underlyingAsset.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [stocks, activeCategory, searchQuery]);

  const indices = stocks.filter((s) => s.category === 'INDEX');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Indian Stock Market & Bullion Financial Instruments
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30">
                NSE / BSE Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Track NIFTY 50, SENSEX, Sovereign Gold Bonds (SGB), Gold & Silver ETFs, and leading market equities.
            </p>
          </div>
        </div>

        {/* 4 Major Indices Snapshot Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {indices.map((idx) => {
            const isUp = idx.changePercent >= 0;
            return (
              <div
                key={idx.symbol}
                className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-white font-sans">{idx.symbol}</span>
                    <span className="text-[11px] text-slate-400 block line-clamp-1">{idx.name}</span>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold flex items-center tabular-nums ${
                      isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                    {isUp ? '+' : ''}
                    {idx.changePercent.toFixed(2)}%
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between font-mono">
                  <div className="text-xl font-bold text-slate-100 tabular-nums">
                    {idx.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-400 tabular-nums">
                    {isUp ? '+' : ''}{idx.change.toFixed(2)}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>L: {idx.dayLow.toLocaleString('en-IN')}</span>
                  <span>H: {idx.dayHigh.toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SGB Sovereign Gold Bond Explainer Banner */}
      <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Why Sovereign Gold Bonds (SGB) Outperform Physical Gold
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  RBI Issued
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                1. <strong>2.50% Annual Interest</strong> paid semi-annually directly to bank account.<br />
                2. <strong>Zero Making Charges, Zero Storage Fees & Zero Purity Risk</strong> (denominated in 999 gold grams).<br />
                3. <strong>100% Tax-Free Capital Gains</strong> under Section 47 of Income Tax Act upon 8-year maturity redemption.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveCategory('SGB')}
            className="self-start lg:self-center px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            View SGB Tranches
          </button>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-950 border border-slate-800 rounded-lg scrollbar-none">
          {[
            { id: 'ALL', label: 'All Instruments' },
            { id: 'INDEX', label: 'Market Indices' },
            { id: 'GOLD_ETF', label: 'Gold ETFs' },
            { id: 'SILVER_ETF', label: 'Silver ETFs' },
            { id: 'SGB', label: 'Sovereign Gold Bonds' },
            { id: 'STOCK', label: 'Equities' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search symbol, ETF, SGB..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Instruments Grid Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-sans">
                <th className="py-3 px-4">Instrument</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-right">Price (₹)</th>
                <th className="py-3 px-3 text-right">Day Change</th>
                <th className="py-3 px-3 text-right">Day Range (L - H)</th>
                <th className="py-3 px-3 text-right">52W Range</th>
                <th className="py-3 px-3">Underlying / Details</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStocks.map((item) => {
                const isUp = item.changePercent >= 0;
                return (
                  <tr
                    key={item.symbol}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Instrument name & symbol */}
                    <td className="py-3 px-4">
                      <div className="font-sans font-bold text-white text-sm">
                        {item.symbol}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {item.name}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.category === 'INDEX'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : item.category === 'GOLD_ETF'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : item.category === 'SILVER_ETF'
                            ? 'bg-slate-500/15 text-slate-300 border border-slate-500/30'
                            : item.category === 'SGB'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 text-right text-slate-100 font-bold text-sm tabular-nums">
                      ₹{item.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>

                    {/* Day change */}
                    <td className="py-3 px-3 text-right tabular-nums">
                      <span
                        className={`font-semibold flex items-center justify-end ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                        {isUp ? '+' : ''}
                        {item.changePercent.toFixed(2)}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {isUp ? '+' : ''}₹{item.change.toFixed(2)}
                      </span>
                    </td>

                    {/* Day Range */}
                    <td className="py-3 px-3 text-right text-slate-400 tabular-nums text-[11px]">
                      <span>₹{item.dayLow.toLocaleString('en-IN')}</span>
                      <span className="text-slate-600 mx-1">-</span>
                      <span>₹{item.dayHigh.toLocaleString('en-IN')}</span>
                    </td>

                    {/* 52W Range */}
                    <td className="py-3 px-3 text-right text-slate-400 tabular-nums text-[11px]">
                      <span>₹{item.yearLow.toLocaleString('en-IN')}</span>
                      <span className="text-slate-600 mx-1">-</span>
                      <span>₹{item.yearHigh.toLocaleString('en-IN')}</span>
                    </td>

                    {/* Underlying details or SGB coupon */}
                    <td className="py-3 px-3 text-[11px] text-slate-400">
                      {item.sgbDetails ? (
                        <div>
                          <span className="text-amber-400 font-semibold block">
                            2.5% p.a. · Maturity: {item.sgbDetails.maturityDate}
                          </span>
                          <span className="text-slate-500">
                            Issue Price: ₹{item.sgbDetails.issuePrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <span>{item.underlyingAsset || `Volume: ${item.volume}`}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenAlertModal(item.symbol, item.name)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 transition-colors cursor-pointer"
                          title="Set Price Alert"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenPortfolioModal(item.symbol, item.name)}
                          className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-400 transition-colors cursor-pointer"
                          title="Add to Portfolio"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
