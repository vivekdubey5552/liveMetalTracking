import React, { useState } from 'react';
import { 
  Building2, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp, 
  Percent, 
  CheckCircle2,
  Bell
} from 'lucide-react';
import { IBJAMarketSession, IBJARateItem } from '../../types';
import { OFFICIAL_IBJA_DATA, INDIAN_GST_PCT } from '../../services/marketData';

interface IBJARatesTableProps {
  onOpenAlertModal: (symbol: string, name: string) => void;
  onSelectPurityForCalc?: (purity: '24K' | '22K' | '18K') => void;
}

export const IBJARatesTable: React.FC<IBJARatesTableProps> = ({
  onOpenAlertModal,
  onSelectPurityForCalc,
}) => {
  const [sessionData] = useState<IBJAMarketSession>(OFFICIAL_IBJA_DATA);
  const [includeGST, setIncludeGST] = useState<boolean>(false);
  const [selectedUnit, setSelectedUnit] = useState<'10g' | '1g' | '8g'>('10g');

  const unitMultipliers: Record<'10g' | '1g' | '8g', number> = {
    '10g': 1,
    '1g': 0.1,
    '8g': 0.8,
  };

  return (
    <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-5 sm:p-6 space-y-6 shadow-md relative overflow-hidden">
      {/* Decorative top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

      {/* Header with official branding */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                India Bullion and Jewellers Association (IBJA)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                Official Benchmark
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
              <span>National statutory benchmark published twice daily (Opening & Closing)</span>
              <span>·</span>
              <a
                href="https://ibjarates.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 underline inline-flex items-center gap-1 font-semibold"
              >
                ibjarates.com <ExternalLink className="w-3 h-3 inline" />
              </a>
            </p>
          </div>
        </div>

        {/* GST Toggle & Session Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* GST Toggle */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-400 px-2 font-medium">Pricing:</span>
            <button
              onClick={() => setIncludeGST(false)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                !includeGST
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Official IBJA benchmark rate without GST (used by RBI for SGBs)"
            >
              Base (Ex-GST)
            </button>
            <button
              onClick={() => setIncludeGST(true)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                includeGST
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Retail jeweller rate including 3% GST"
            >
              With 3% GST
            </button>
          </div>

          {/* Unit selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
            {(['10g', '1g', '8g'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setSelectedUnit(u)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  selectedUnit === u
                    ? 'bg-slate-800 text-amber-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {u === '10g' ? 'Per 10g' : u === '1g' ? 'Per 1g' : '8g (Pavan)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Official IBJA Rates Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-sans">
              <th className="py-3 px-4">Purity & Standard</th>
              <th className="py-3 px-3 text-right">
                Opening Rate (AM)
                <span className="block text-[10px] font-normal text-slate-500">11:30 AM IST</span>
              </th>
              <th className="py-3 px-3 text-right">
                Closing Rate (PM)
                <span className="block text-[10px] font-normal text-slate-500">05:00 PM IST</span>
              </th>
              <th className="py-3 px-3 text-right">Day Variance</th>
              <th className="py-3 px-3 text-right">
                {includeGST ? 'Base (Ex-GST)' : 'Retail (Incl. 3% GST)'}
              </th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sessionData.rates.map((item: IBJARateItem) => {
              const isSilver = item.purityCode === 'SILVER_999';
              const multiplier = isSilver ? 1 : unitMultipliers[selectedUnit];
              const gstMultiplier = includeGST ? 1 + INDIAN_GST_PCT : 1;

              const displayOpening = Math.round(item.openingRateAM * multiplier * gstMultiplier);
              const displayClosing = Math.round(item.closingRatePM * multiplier * gstMultiplier);
              const isUp = item.change >= 0;

              // Alternate price to show in column 5
              const alternatePrice = includeGST
                ? Math.round(item.closingRatePM * multiplier) // show base
                : Math.round(item.closingRatePM * multiplier * (1 + INDIAN_GST_PCT)); // show with GST

              return (
                <tr
                  key={item.purityCode}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Purity & Hallmark */}
                  <td className="py-3 px-4">
                    <div className="font-sans font-bold text-white text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      {item.purityLabel}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {isSilver ? 'Fine Silver 99.9% fineness (per 1 Kg)' : `Benchmark unit: ${selectedUnit} (IBJA Code: ${item.purityCode})`}
                    </div>
                  </td>

                  {/* Opening Rate AM */}
                  <td className="py-3 px-3 text-right text-slate-200 font-semibold tabular-nums text-sm">
                    ₹{displayOpening.toLocaleString('en-IN')}
                  </td>

                  {/* Closing Rate PM */}
                  <td className="py-3 px-3 text-right text-amber-300 font-bold tabular-nums text-sm">
                    ₹{displayClosing.toLocaleString('en-IN')}
                  </td>

                  {/* Variance */}
                  <td className="py-3 px-3 text-right tabular-nums">
                    <span
                      className={`font-semibold flex items-center justify-end ${
                        isUp ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                      {isUp ? '+' : ''}₹{Math.round(Math.abs(item.change) * multiplier).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ({item.changePct.toFixed(2)}%)
                    </span>
                  </td>

                  {/* Alternate Price (Base or with GST) */}
                  <td className="py-3 px-3 text-right tabular-nums text-slate-400 text-xs">
                    ₹{alternatePrice.toLocaleString('en-IN')}
                    <span className="block text-[10px] text-slate-500">
                      {includeGST ? 'Ex-GST' : '+3% GST'}
                    </span>
                  </td>

                  {/* Quick Action */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenAlertModal('XAU', item.purityLabel)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-400 text-slate-300 transition-colors cursor-pointer"
                        title="Set price alert for this IBJA purity"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                      {onSelectPurityForCalc && (item.purityCode === '999' || item.purityCode === '916' || item.purityCode === '750') && (
                        <button
                          onClick={() => {
                            const pMap: Record<string, '24K' | '22K' | '18K'> = {
                              '999': '24K',
                              '916': '22K',
                              '750': '18K',
                            };
                            onSelectPurityForCalc(pMap[item.purityCode]);
                          }}
                          className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 text-[11px] font-sans font-medium transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Estimate Bill
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Statutory RBI Notice & Explainer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block font-sans mb-0.5">
              Statutory RBI Sovereign Gold Bond (SGB) Benchmark
            </strong>
            The Reserve Bank of India (RBI) officially mandates IBJA rates for Sovereign Gold Bond (SGB) redemption. The redemption price is based on the simple average of the closing gold price of 999 purity published by IBJA for the previous 3 business days.
          </div>
        </div>

        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block font-sans mb-0.5">
              Publication Schedule & Ex-GST Structure
            </strong>
            IBJA collects polling data from 10+ bullion dealers across India and publishes rates twice daily from Monday through Friday. Official IBJA rates are published <strong>exclusive of 3% GST</strong>; retail jewellers add 3% GST + making charges.
          </div>
        </div>
      </div>
    </div>
  );
};
