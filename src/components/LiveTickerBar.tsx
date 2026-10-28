import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MetalPrice, IndianStockQuote, FXRate, Currency } from '../types';
import { formatPrice } from '../services/marketData';

interface LiveTickerBarProps {
  metals: Record<string, MetalPrice>;
  stocks: IndianStockQuote[];
  fx: FXRate;
  currency: Currency;
  onSelectAsset?: (symbol: string) => void;
}

export const LiveTickerBar: React.FC<LiveTickerBarProps> = ({
  metals,
  stocks,
  fx,
  currency,
  onSelectAsset,
}) => {
  const gold = metals.XAU;
  const silver = metals.XAG;
  const platinum = metals.XPT;
  const palladium = metals.XPD;

  const nifty = stocks.find((s) => s.symbol === 'NIFTY 50');
  const sensex = stocks.find((s) => s.symbol === 'SENSEX');
  const goldBees = stocks.find((s) => s.symbol === 'GOLDBEES');
  const silverBees = stocks.find((s) => s.symbol === 'SILVERBEES');

  // Convert metal spot to selected currency for quick glance
  const displayGoldPrice = currency === 'INR'
    ? (gold.priceUSDPerOz / 31.1035) * fx.USDINR * 1.06 * 1.03 * 10 // 10g 24K landed
    : gold.priceUSDPerOz;

  const displaySilverPrice = currency === 'INR'
    ? (silver.priceUSDPerOz / 31.1035) * fx.USDINR * 1.06 * 1.03 * 1000 // 1kg landed
    : silver.priceUSDPerOz;

  const items = [
    {
      symbol: 'IBJA-999',
      label: 'IBJA 24K (10g)',
      price: '₹1,41,730',
      changePercent: -0.40,
      isUp: false,
    },
    {
      symbol: 'IBJA-916',
      label: 'IBJA 22K (10g)',
      price: '₹1,29,771',
      changePercent: -0.44,
      isUp: false,
    },
    {
      symbol: 'XAU',
      label: currency === 'INR' ? 'Gold Spot (10g)' : 'Gold Spot (oz)',
      price: formatPrice(displayGoldPrice, currency, currency === 'INR' ? 0 : 2),
      changePercent: gold.change24hPercent,
      isUp: gold.change24hPercent >= 0,
    },
    {
      symbol: 'XAG',
      label: currency === 'INR' ? 'Silver (1kg)' : 'Silver Spot (oz)',
      price: formatPrice(displaySilverPrice, currency, currency === 'INR' ? 0 : 2),
      changePercent: silver.change24hPercent,
      isUp: silver.change24hPercent >= 0,
    },
    {
      symbol: 'XPT',
      label: 'Platinum (oz)',
      price: formatPrice(platinum.priceUSDPerOz, 'USD', 2),
      changePercent: platinum.change24hPercent,
      isUp: platinum.change24hPercent >= 0,
    },
    {
      symbol: 'XPD',
      label: 'Palladium (oz)',
      price: formatPrice(palladium.priceUSDPerOz, 'USD', 2),
      changePercent: palladium.change24hPercent,
      isUp: palladium.change24hPercent >= 0,
    },
    ...(nifty
      ? [
          {
            symbol: nifty.symbol,
            label: 'NIFTY 50',
            price: nifty.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
            changePercent: nifty.changePercent,
            isUp: nifty.changePercent >= 0,
          },
        ]
      : []),
    ...(sensex
      ? [
          {
            symbol: sensex.symbol,
            label: 'SENSEX',
            price: sensex.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
            changePercent: sensex.changePercent,
            isUp: sensex.changePercent >= 0,
          },
        ]
      : []),
    ...(goldBees
      ? [
          {
            symbol: goldBees.symbol,
            label: 'Gold BeES ETF',
            price: `₹${goldBees.currentPrice.toFixed(2)}`,
            changePercent: goldBees.changePercent,
            isUp: goldBees.changePercent >= 0,
          },
        ]
      : []),
    ...(silverBees
      ? [
          {
            symbol: silverBees.symbol,
            label: 'Silver BeES ETF',
            price: `₹${silverBees.currentPrice.toFixed(2)}`,
            changePercent: silverBees.changePercent,
            isUp: silverBees.changePercent >= 0,
          },
        ]
      : []),
    {
      symbol: 'USDINR',
      label: 'USD / INR',
      price: `₹${fx.USDINR.toFixed(2)}`,
      changePercent: 0.05,
      isUp: true,
    },
  ];

  return (
    <div className="bg-[#f5f4ef] border-b border-slate-200 overflow-hidden py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 text-xs font-mono">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-0.5">
          {items.map((item) => (
            <button
              key={item.symbol}
              onClick={() => onSelectAsset && onSelectAsset(item.symbol)}
              className="flex items-center gap-2 whitespace-nowrap hover:opacity-80 transition-opacity cursor-pointer shrink-0"
            >
              <span className="text-slate-600 font-sans font-medium">{item.label}</span>
              <span className="font-bold text-slate-900 tabular-nums">{item.price}</span>
              <span
                className={`flex items-center text-[11px] tabular-nums font-semibold ${
                  item.isUp ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {item.isUp ? (
                  <TrendingUp className="w-3 h-3 inline mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 inline mr-0.5" />
                )}
                {item.isUp ? '+' : ''}
                {item.changePercent.toFixed(2)}%
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
