import { PriceAlert, MetalPrice, IndianStockQuote, FXRate } from '../types';
import { calculateGoldRates, calculateSilverRates } from './marketData';

class AlertManager {
  private audioCtx: AudioContext | null = null;

  public playChime(type: 'alert' | 'tick' = 'alert') {
    try {
      if (typeof window === 'undefined') return;
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (type === 'alert') {
        // Double pleasant bell chime
        const osc1 = this.audioCtx.createOscillator();
        const gain1 = this.audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15); // E6
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc1.connect(gain1);
        gain1.connect(this.audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1760, now + 0.15); // A6
        gain2.gain.setValueAtTime(0.2, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc2.connect(gain2);
        gain2.connect(this.audioCtx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.7);
      } else {
        // Subtle tick sound
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch {
      // Audio might be blocked until user interacts with the page
    }
  }

  public checkAlerts(
    alerts: PriceAlert[],
    metals: Record<string, MetalPrice>,
    stocks: IndianStockQuote[],
    fx: FXRate
  ): { triggeredAlerts: PriceAlert[]; updatedAlerts: PriceAlert[] } {
    const goldRates = calculateGoldRates(metals.XAU.priceUSDPerOz, fx.USDINR);
    const silverRates = calculateSilverRates(metals.XAG.priceUSDPerOz, fx.USDINR);
    const newlyTriggered: PriceAlert[] = [];

    const updatedAlerts = alerts.map((alert) => {
      if (!alert.isActive || alert.isTriggered) return alert;

      let currentPriceToCompare: number | null = null;

      if (alert.assetSymbol === 'XAU') {
        if (alert.currency === 'USD') {
          currentPriceToCompare = metals.XAU.priceUSDPerOz;
        } else if (alert.currency === 'INR') {
          const purity = alert.purity || '24K';
          const rateObj = purity === '24K' ? goldRates.rate24K : purity === '22K' ? goldRates.rate22K : goldRates.rate18K;
          if (alert.unit === '10g') currentPriceToCompare = rateObj.per10g;
          else if (alert.unit === 'g') currentPriceToCompare = rateObj.perGram;
          else if (alert.unit === 'sovereign') currentPriceToCompare = rateObj.per8g;
          else if (alert.unit === 'kg') currentPriceToCompare = rateObj.perKg;
          else currentPriceToCompare = rateObj.per10g;
        }
      } else if (alert.assetSymbol === 'XAG') {
        if (alert.currency === 'USD') {
          currentPriceToCompare = metals.XAG.priceUSDPerOz;
        } else if (alert.currency === 'INR') {
          if (alert.unit === 'kg') currentPriceToCompare = silverRates.perKg;
          else if (alert.unit === 'g') currentPriceToCompare = silverRates.perGram;
          else currentPriceToCompare = silverRates.perKg;
        }
      } else if (alert.assetSymbol === 'XPT') {
        currentPriceToCompare = alert.currency === 'USD' ? metals.XPT.priceUSDPerOz : (metals.XPT.priceUSDPerOz * fx.USDINR) / 3.11035;
      } else if (alert.assetSymbol === 'XPD') {
        currentPriceToCompare = alert.currency === 'USD' ? metals.XPD.priceUSDPerOz : (metals.XPD.priceUSDPerOz * fx.USDINR) / 3.11035;
      } else {
        // Stock / ETF / SGB
        const stock = stocks.find((s) => s.symbol === alert.assetSymbol);
        if (stock) {
          currentPriceToCompare = stock.currentPrice;
        }
      }

      if (currentPriceToCompare !== null) {
        let isConditionMet = false;
        if (alert.condition === 'ABOVE' && currentPriceToCompare >= alert.targetPrice) {
          isConditionMet = true;
        } else if (alert.condition === 'BELOW' && currentPriceToCompare <= alert.targetPrice) {
          isConditionMet = true;
        }

        if (isConditionMet) {
          const triggeredAlert: PriceAlert = {
            ...alert,
            isTriggered: true,
            triggeredAt: Date.now(),
          };
          newlyTriggered.push(triggeredAlert);
          return triggeredAlert;
        }
      }

      return alert;
    });

    return { triggeredAlerts: newlyTriggered, updatedAlerts };
  }
}

export const alertService = new AlertManager();
