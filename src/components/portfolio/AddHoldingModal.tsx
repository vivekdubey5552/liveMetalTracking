import React, { useState } from 'react';
import { X, Plus, ShieldCheck } from 'lucide-react';
import { AssetCategory, GoldPurity, PortfolioHolding } from '../../types';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHolding: (holding: Omit<PortfolioHolding, 'id'>) => void;
  initialSymbol?: string;
  initialName?: string;
}

export const AddHoldingModal: React.FC<AddHoldingModalProps> = ({
  isOpen,
  onClose,
  onAddHolding,
  initialSymbol = 'XAU',
  initialName = 'Physical Gold Bullion',
}) => {
  const [name, setName] = useState<string>(initialName);
  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [category, setCategory] = useState<AssetCategory>('PHYSICAL_GOLD');
  const [purity, setPurity] = useState<GoldPurity>('24K');
  const [unit, setUnit] = useState<'g' | 'kg' | 'units' | 'tola'>('g');
  const [quantity, setQuantity] = useState<number>(10);
  const [buyPrice, setBuyPrice] = useState<number>(135000);
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || quantity <= 0 || buyPrice <= 0) return;

    onAddHolding({
      name,
      symbol,
      category,
      purity: category === 'PHYSICAL_GOLD' ? purity : undefined,
      unit,
      quantity,
      averageBuyPrice: buyPrice,
      purchaseDate,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Asset to Portfolio</h3>
              <p className="text-xs text-slate-400">Track physical gold, SGBs, ETFs, or equities.</p>
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
          {/* Category */}
          <div>
            <label className="text-slate-300 font-sans font-semibold block mb-1.5">Asset Category</label>
            <select
              value={category}
              onChange={(e) => {
                const cat = e.target.value as AssetCategory;
                setCategory(cat);
                if (cat === 'PHYSICAL_GOLD') {
                  setUnit('g');
                  setSymbol('XAU');
                } else if (cat === 'PHYSICAL_SILVER') {
                  setUnit('kg');
                  setSymbol('XAG');
                } else if (cat === 'SOVEREIGN_GOLD_BOND') {
                  setUnit('units');
                  setSymbol('SGB');
                } else {
                  setUnit('units');
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="PHYSICAL_GOLD">Physical Gold (24K / 22K Jewellery / Coins)</option>
              <option value="SOVEREIGN_GOLD_BOND">Sovereign Gold Bond (SGB)</option>
              <option value="GOLD_ETF">Gold ETF (Nippon Gold BeES, etc.)</option>
              <option value="DIGITAL_GOLD">Digital Gold (Augmont / MMTC-PAMP)</option>
              <option value="PHYSICAL_SILVER">Physical Silver (Bars / Utensils)</option>
              <option value="SILVER_ETF">Silver ETF (Silver BeES)</option>
              <option value="PLATINUM_PALLADIUM">Platinum / Palladium</option>
              <option value="INDIAN_EQUITIES">Indian Equities (Stocks & Index)</option>
              <option value="CASH_FD">Cash / Fixed Deposit Reserve</option>
            </select>
          </div>

          {/* Name & Symbol */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-sans font-semibold block mb-1">Asset Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 24K Minted Gold Bar"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-sans font-semibold block mb-1">Ticker / Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="XAU / GOLDBEES"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Purity if Physical Gold */}
          {category === 'PHYSICAL_GOLD' && (
            <div>
              <label className="text-slate-300 font-sans font-semibold block mb-1">Gold Purity</label>
              <div className="grid grid-cols-3 gap-2">
                {(['24K', '22K', '18K'] as GoldPurity[]).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPurity(p)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${
                      purity === p
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {p} {p === '24K' ? '(999)' : p === '22K' ? '(916)' : '(750)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-sans font-semibold block mb-1">Quantity</label>
              <input
                type="number"
                step="any"
                min="0.001"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-sans font-semibold block mb-1">Unit of Measure</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'g' | 'kg' | 'units' | 'tola')}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="g">Grams (g)</option>
                <option value="tola">Tola (10g)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="units">Shares / Units</option>
              </select>
            </div>
          </div>

          {/* Buy Price & Purchase Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-sans font-semibold block mb-1">
                Avg Buy Price (₹ INR {unit === 'g' ? '/ 10g or / g' : '/ unit'})
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={buyPrice}
                onChange={(e) => setBuyPrice(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-sans font-semibold block mb-1">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-300 font-sans font-semibold block mb-1">Locker / Demat / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bank Locker #42, Hallmarked 916 with invoice"
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
              Save Holding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
