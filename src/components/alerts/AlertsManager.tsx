import React from 'react';
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Volume2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { PriceAlert, Currency } from '../../types';
import { formatPrice } from '../../services/marketData';

interface AlertsManagerProps {
  alerts: PriceAlert[];
  currency: Currency;
  onOpenCreateAlert: () => void;
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  onRearmAlert: (id: string) => void;
  onTestSoundAlert: () => void;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({
  alerts,
  currency,
  onOpenCreateAlert,
  onToggleAlert,
  onDeleteAlert,
  onRearmAlert,
  onTestSoundAlert,
}) => {
  const activeAlerts = alerts.filter((a) => !a.isTriggered);
  const triggeredAlerts = alerts.filter((a) => a.isTriggered);

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Precious Metals & Market Price Alerts
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Real-Time Monitor
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Custom thresholds for Gold (24K/22K/18K), Silver, ETFs, and Equities with instant chimes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTestSoundAlert}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Test web audio chime and toast notification"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              Test Alert Audio
            </button>
            <button
              onClick={onOpenCreateAlert}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Create Alert
            </button>
          </div>
        </div>
      </div>

      {/* Active Alerts Section */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Active Alerts ({activeAlerts.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Automatically evaluated on live ticks
          </span>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-400">No active alerts configured</p>
            <p>Click "Create Alert" to set price notifications on gold or stocks.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 mt-2">
            {activeAlerts.map((alert) => {
              const isAbove = alert.condition === 'ABOVE';
              return (
                <div
                  key={alert.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded-lg transition-colors font-mono"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isAbove
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isAbove ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold text-white text-sm">
                          {alert.assetName}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {alert.assetSymbol}
                        </span>
                        {alert.purity && (
                          <span className="text-xs text-amber-400 font-semibold">
                            {alert.purity}
                          </span>
                        )}
                        {alert.unit && (
                          <span className="text-xs text-slate-400">
                            per {alert.unit}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>
                          Target: {isAbove ? '≥' : '≤'}{' '}
                          <strong className="text-white">
                            {formatPrice(alert.targetPrice, alert.currency, alert.targetPrice > 1000 ? 0 : 2)}
                          </strong>
                        </span>
                        <span>·</span>
                        <span>Created at: {formatPrice(alert.createdPrice, alert.currency, alert.createdPrice > 1000 ? 0 : 2)}</span>
                      </div>

                      {alert.notes && (
                        <p className="text-[11px] text-slate-500 font-sans mt-0.5 italic">
                          "{alert.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center font-sans">
                    <button
                      onClick={() => onToggleAlert(alert.id)}
                      className={`px-3 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                        alert.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {alert.isActive ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => onDeleteAlert(alert.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Triggered Alerts History */}
      {triggeredAlerts.length > 0 && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Triggered Alert Log ({triggeredAlerts.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Thresholds reached
            </span>
          </div>

          <div className="divide-y divide-slate-800/60 mt-2">
            {triggeredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/20 px-2 rounded-lg transition-colors font-mono"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-sans font-bold text-white text-sm">
                      {alert.assetName} reached target {formatPrice(alert.targetPrice, alert.currency, alert.targetPrice > 1000 ? 0 : 2)}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>
                        Triggered {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleTimeString() : 'recently'}
                      </span>
                      {alert.notes && <span>· Note: {alert.notes}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center font-sans">
                  <button
                    onClick={() => onRearmAlert(alert.id)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Re-Arm Alert
                  </button>
                  <button
                    onClick={() => onDeleteAlert(alert.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
