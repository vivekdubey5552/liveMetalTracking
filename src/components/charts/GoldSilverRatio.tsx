import React from 'react';
import { Scale, ArrowUpDown, Info } from 'lucide-react';
import { MetalPrice } from '../../types';

interface GoldSilverRatioProps {
  goldPrice: MetalPrice;
  silverPrice: MetalPrice;
  platinumPrice: MetalPrice;
}

export const GoldSilverRatio: React.FC<GoldSilverRatioProps> = ({
  goldPrice,
  silverPrice,
  platinumPrice,
}) => {
  const gsr = goldPrice.priceUSDPerOz / silverPrice.priceUSDPerOz;
  const platinumGoldRatio = platinumPrice.priceUSDPerOz / goldPrice.priceUSDPerOz;
  const platinumDiscount = ((goldPrice.priceUSDPerOz - platinumPrice.priceUSDPerOz) / goldPrice.priceUSDPerOz) * 100;

  // Valuation insight based on GSR
  const isSilverUndervalued = gsr > 80;
  const isSilverOvervalued = gsr < 60;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              Macro Valuation Ratios: Gold / Silver & Platinum
            </h3>
            <p className="text-xs text-slate-400">
              Institutional asset rotation and relative value indicators.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Gold / Silver Ratio Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Gold / Silver Ratio (GSR)
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  isSilverUndervalued
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : isSilverOvervalued
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isSilverUndervalued
                  ? 'Silver Undervalued'
                  : isSilverOvervalued
                  ? 'Gold Undervalued'
                  : 'Balanced Zone'}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <div className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
                {gsr.toFixed(2)} : 1
              </div>
              <span className="text-xs text-slate-400 font-mono">
                (1 oz Gold buys {gsr.toFixed(1)} oz Silver)
              </span>
            </div>

            {/* Visual ratio scale */}
            <div className="mt-4">
              <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
                <span>40:1 (Silver peak)</span>
                <span>65:1 (50-Yr Median)</span>
                <span>85:1+ (Silver Bargain)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(10, ((gsr - 35) / 65) * 100))}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed">
              {isSilverUndervalued ? (
                <>
                  <strong className="text-emerald-400">Historical signal:</strong> When the Gold/Silver ratio exceeds 80, silver has historically delivered explosive catch-up rallies as industrial solar and green tech demand accelerates.
                </>
              ) : (
                'Ratio currently trades near normalized historical balance.'
              )}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Spot: Gold ${goldPrice.priceUSDPerOz.toFixed(1)} / Silver ${silverPrice.priceUSDPerOz.toFixed(2)}
          </div>
        </div>

        {/* Platinum / Gold Discount Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Platinum vs Gold Spread
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                Historic Discount
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <div className="text-3xl font-extrabold text-cyan-400 font-mono tabular-nums">
                -{platinumDiscount.toFixed(1)}%
              </div>
              <span className="text-xs text-slate-400 font-mono">
                (Pt ${platinumPrice.priceUSDPerOz.toFixed(1)} vs Au ${goldPrice.priceUSDPerOz.toFixed(1)})
              </span>
            </div>

            <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              Historically, Platinum traded at a <strong>30% premium</strong> over gold due to extreme scarcity and automotive catalytic converter demand. Today, gold trades at nearly 2.7x platinum, creating a rare macro dislocation for physical bullion accumulators.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            Ratio: {(platinumGoldRatio).toFixed(3)} oz Pt / 1 oz Au
          </div>
        </div>
      </div>
    </div>
  );
};
