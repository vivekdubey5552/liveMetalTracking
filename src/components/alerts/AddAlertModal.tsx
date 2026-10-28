import React, { useState } from 'react';
import { X, Bell, TrendingUp, TrendingDown } from 'lucide-react';
import { Currency, GoldPurity, PriceAlert, WeightUnit } from '../../types';

interface AddAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>) => void;
  initialSymbol?: string;
  initialName?: string;
  defaultCurrency?: Currency;
}

export const AddAlertModal: React.FC<AddAlertModalProps> = ({
  isOpen,
  onClose,
  onAddAlert,
  initialSymbol = 'XAU',
  initialName = 'Gold',
  defaultCurrency = 'INR',
}) => {
  const [assetSymbol, setAssetSymbol] = useState<string>(initialSymbol);
  const [assetName, setAssetName] = useState<string>(initialName);
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [targetPrice, setTargetPrice] = useState<number>(currency === 'INR' ? 145000 : 4100);
  const [unit, setUnit] = useState<WeightUnit>('10g');
  const [purity, setPurity] = useState<GoldPurity>('24K');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const isGold = assetSymbol === 'XAU';
  const isSilver = assetSymbol === 'XAG';
  const isMetal = ['XAU', 'XAG', 'XPT', 'XPD'].includes(assetSymbol);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPrice <= 0) return;

    onAddAlert({
      assetSymbol,
      assetName,
      assetType: isMetal ? 'METAL' : 'STOCK',
      targetPrice,
      currency,
      condition,
      unit: isMetal ? unit : undefined,
      purity: isGold ? purity : undefined,
      createdPrice: targetPrice,
      isActive: true,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Custom Price Alert</h3>
              <p className="text-xs text-slate-400">Receive instant visual & audio notifications.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs font-mono">
          {/* Target Asset Selector */}
          <div>
            <label className="text-slate-300 font-sans font-semibold block mb-1">Target Asset</label>
            <select
              value={assetSymbol}
              onChange={(e) => {
                const sym = e.target.value;
                setAssetSymbol(sym);
                const names: Record<string, string> = {
                  XAU: 'Gold',
                  XAG: 'Silver',
                  XPT: 'Platinum',
                  XPD: 'Palladium',
                  GOLDBEES: 'Nippon India Gold BeES ETF',
                  SILVERBEES: 'Nippon India Silver ETF',
                  'NIFTY 50': 'NIFTY 50 Benchmark',
                  TITAN: 'Titan Company Ltd',
                  'SGB2028-IV': 'SGB 2028-29 Series IV',
                };
                setAssetName(names[sym] || sym);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
            >
              <optgroup label="Precious Metals">
                <option value="XAU">Gold (XAU)</option>
                <option value="XAG">Silver (XAG)</option>
                <option value="XPT">Platinum (XPT)</option>
                <option value="XPD">Palladium (XPD)</option>
              </optgroup>
              <optgroup label="Gold & Silver ETFs / SGB">
                <option value="GOLDBEES">Nippon India Gold BeES (NSE: GOLDBEES)</option>
                <option value="SILVERBEES">Nippon India Silver ETF (NSE: SILVERBEES)</option>
                <option value="SGB2028-IV">SGB 2028-29 Series IV</option>
              </optgroup>
              <optgroup label="Indian Equities & Indices">
                <option value="NIFTY 50">NIFTY 50 Benchmark Index</option>
                <option value="TITAN">Titan Company (Tanishq Jewellery)</option>
              </optgroup>
            </select>
          </div>

          {/* Condition: ABOVE or BELOW */}
          <div>
            <label className="text-slate-300 font-sans font-semibold block mb-1">Trigger Condition</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCondition('ABOVE')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  condition === 'ABOVE'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Price Rises Above (≥)
              </button>
              <button
                type="button"
                onClick={() => setCondition('BELOW')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  condition === 'BELOW'
                    ? 'bg-rose-500 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                Price Drops Below (≤)
              </button>
            </div>
          </div>

          {/* Purity & Unit (For Gold) */}
          {isGold && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-sans font-semibold block mb-1">Purity</label>
                <select
                  value={purity}
                  onChange={(e) => setPurity(e.target.value as GoldPurity)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="24K">24K (Pure 999 Bullion)</option>
                  <option value="22K">22K (Hallmark 916 Jewellery)</option>
                  <option value="18K">18K (Diamond Jewellery)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 font-sans font-semibold block mb-1">Measure Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as WeightUnit)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="10g">10 Grams (Tola)</option>
                  <option value="g">1 Gram</option>
                  <option value="sovereign">8 Grams (Pavan)</option>
                  <option value="oz">1 Troy Ounce</option>
                  <option value="kg">1 Kilogram</option>
                </select>
              </div>
            </div>
          )}

          {/* Target Price & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-slate-300 font-sans font-semibold block mb-1">Target Price</label>
              <input
                type="number"
                step="any"
                min="0.1"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-sans font-semibold block mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
              </select>
            </div>
          </div>

          {/* Custom Note */}
          <div>
            <label className="text-slate-300 font-sans font-semibold block mb-1">Note / Objective</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Diwali gold purchase dip / Book 50% profit"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold cursor-pointer shadow-xs"
            >
              Set Active Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
