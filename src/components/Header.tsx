import React from 'react';
import { Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { Currency } from '../types';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  usdInrRate: number;
  onRefreshData: () => void;
  isRefreshing: boolean;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  currency,
  onCurrencyChange,
  soundEnabled,
  onToggleSound,
  usdInrRate,
  onRefreshData,
  isRefreshing,
  activeAlertsCount,
}) => {
  const navItems = [
    { id: 'metals', label: 'Bullion Spot' },
    { id: 'purity', label: 'IBJA Rates & Purity' },
    { id: 'catalogue', label: 'Jewellery Menu & Invoices' },
    { id: 'charts', label: 'Historical Charts' },
    { id: 'indian-markets', label: 'Indian Markets & SGB' },
    { id: 'portfolio', label: 'Portfolio Wealth' },
    { id: 'alerts', label: `Alerts${activeAlertsCount > 0 ? ` (${activeAlertsCount})` : ''}` },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-500/20">
            <span className="text-slate-950 font-black text-lg tracking-tighter">BP</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            BullionPulse
          </span>
        </div>

        {/* Zone 2: 4-6 concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => onCurrencyChange('INR')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                currency === 'INR'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Indian Rupee (Default domestic benchmark)"
            >
              ₹ INR
            </button>
            <button
              onClick={() => onCurrencyChange('USD')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                currency === 'USD'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="US Dollar (International COMEX / LBMA spot)"
            >
              $ USD
            </button>
          </div>

          {/* Sound alert toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={soundEnabled ? 'Price alert audio enabled' : 'Price alert audio muted'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            title={`USD/INR FX Rate: ₹${usdInrRate.toFixed(2)} - Click to refresh market quotes`}
            aria-label="Refresh Market Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-200 bg-white gap-1.5 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-amber-50 text-amber-900 border border-amber-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
