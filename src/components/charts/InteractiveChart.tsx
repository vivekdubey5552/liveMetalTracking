import React, { useState, useMemo } from 'react';
import { 
  BarChart2, 
  LineChart as LineChartIcon, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  EyeOff,
  Maximize2
} from 'lucide-react';
import { MetalPrice, CandlePoint, Currency, MetalSymbol } from '../../types';
import { formatPrice } from '../../services/marketData';

interface InteractiveChartProps {
  metals: Record<MetalSymbol, MetalPrice>;
  currency: Currency;
  usdInrRate: number;
  initialSymbol?: MetalSymbol;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  metals,
  currency,
  usdInrRate,
  initialSymbol = 'XAU',
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<MetalSymbol>(initialSymbol);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | '5Y'>('1M');
  const [chartType, setChartType] = useState<'line' | 'candle'>('candle');
  const [showSMA20, setShowSMA20] = useState<boolean>(true);
  const [showSMA50, setShowSMA50] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [hoveredCandle, setHoveredCandle] = useState<CandlePoint | null>(null);

  const currentMetal = metals[selectedSymbol];

  // Retrieve candle points for selected timeframe
  const rawCandles = useMemo(() => {
    switch (timeframe) {
      case '1D': return currentMetal.historical1D;
      case '1W': return currentMetal.historical1W;
      case '1M': return currentMetal.historical1M;
      case '1Y': return currentMetal.historical1Y;
      case '5Y': return currentMetal.historical5Y;
      default: return currentMetal.historical1M;
    }
  }, [currentMetal, timeframe]);

  // Adjust candle values based on selected currency
  const candles = useMemo(() => {
    const multiplier = currency === 'INR' ? usdInrRate : 1;
    return rawCandles.map((c) => ({
      ...c,
      open: c.open * multiplier,
      high: c.high * multiplier,
      low: c.low * multiplier,
      close: c.close * multiplier,
    }));
  }, [rawCandles, currency, usdInrRate]);

  // Calculate moving averages (SMA 20, SMA 50)
  const sma20 = useMemo(() => {
    const period = 10; // Scaled for sample set
    return candles.map((_, idx, arr) => {
      if (idx < period - 1) return null;
      const slice = arr.slice(idx - period + 1, idx + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      return sum / period;
    });
  }, [candles]);

  const sma50 = useMemo(() => {
    const period = 20;
    return candles.map((_, idx, arr) => {
      if (idx < period - 1) return null;
      const slice = arr.slice(idx - period + 1, idx + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      return sum / period;
    });
  }, [candles]);

  // Chart bounds
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (!candles.length) return { minPrice: 0, maxPrice: 100, maxVolume: 100 };
    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;

    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    const padding = (max - min) * 0.08;
    return {
      minPrice: Math.max(0, min - padding),
      maxPrice: max + padding,
      maxVolume: maxVol,
    };
  }, [candles]);

  // Period performance stats
  const performance = useMemo(() => {
    if (!candles.length) return { change: 0, changePct: 0, high: 0, low: 0 };
    const firstClose = candles[0].open;
    const lastClose = candles[candles.length - 1].close;
    const diff = lastClose - firstClose;
    const diffPct = (diff / firstClose) * 100;
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    return {
      change: diff,
      changePct: diffPct,
      high: Math.max(...highs),
      low: Math.min(...lows),
      start: firstClose,
      current: lastClose,
    };
  }, [candles]);

  // SVG dimensions
  const svgWidth = 860;
  const svgHeight = 360;
  const priceChartHeight = showVolume ? 280 : 340;
  const volumeChartHeight = showVolume ? 60 : 0;
  const paddingX = 40;

  const getX = (index: number) => {
    const usableWidth = svgWidth - paddingX * 2;
    return paddingX + (index / (candles.length - 1)) * usableWidth;
  };

  const getY = (price: number) => {
    const range = maxPrice - minPrice;
    if (range === 0) return priceChartHeight / 2;
    return priceChartHeight - ((price - minPrice) / range) * (priceChartHeight - 20) - 10;
  };

  const getVolY = (volume: number) => {
    const height = (volume / maxVolume) * (volumeChartHeight - 10);
    return svgHeight - height;
  };

  // Line chart SVG path
  const linePath = useMemo(() => {
    if (!candles.length) return '';
    return candles.reduce((acc, curr, idx) => {
      const x = getX(idx);
      const y = getY(curr.close);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [candles, maxPrice, minPrice]);

  const areaPath = useMemo(() => {
    if (!linePath || !candles.length) return '';
    const firstX = getX(0);
    const lastX = getX(candles.length - 1);
    return `${linePath} L ${lastX} ${priceChartHeight} L ${firstX} ${priceChartHeight} Z`;
  }, [linePath, candles, priceChartHeight]);

  // SMA paths
  const sma20Path = useMemo(() => {
    let path = '';
    sma20.forEach((val, idx) => {
      if (val === null) return;
      const x = getX(idx);
      const y = getY(val);
      path = path === '' ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    });
    return path;
  }, [sma20, maxPrice, minPrice]);

  const sma50Path = useMemo(() => {
    let path = '';
    sma50.forEach((val, idx) => {
      if (val === null) return;
      const x = getX(idx);
      const y = getY(val);
      path = path === '' ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    });
    return path;
  }, [sma50, maxPrice, minPrice]);

  const activeCandle = hoveredCandle || (candles.length ? candles[candles.length - 1] : null);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-5">
      {/* Chart Top Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        {/* Metal selector tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1 overflow-x-auto">
          {(['XAU', 'XAG', 'XPT', 'XPD'] as MetalSymbol[]).map((sym) => {
            const m = metals[sym];
            const isSelected = selectedSymbol === sym;
            return (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {m.name} ({sym})
              </button>
            );
          })}
        </div>

        {/* Timeframe & Display toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe buttons */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
            {(['1D', '1W', '1M', '1Y', '5Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-slate-800 text-amber-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Candle vs Line Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                chartType === 'line'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Line Chart"
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('candle')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                chartType === 'candle'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Candlestick Chart"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>

          {/* Indicators toggles */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setShowSMA20(!showSMA20)}
              className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
                showSMA20
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => setShowSMA50(!showSMA50)}
              className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
                showSMA50
                  ? 'bg-purple-500/10 border-purple-500/40 text-purple-400'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              SMA 50
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-1 rounded border transition-colors cursor-pointer ${
                showVolume
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              {showVolume ? <Eye className="w-3.5 h-3.5 inline mr-1" /> : <EyeOff className="w-3.5 h-3.5 inline mr-1" />}
              Vol
            </button>
          </div>
        </div>
      </div>

      {/* Real-time OHLC inspection banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div>
            <span className="text-slate-500 mr-1.5">Asset:</span>
            <span className="font-bold text-white font-sans">{currentMetal.name}</span>
          </div>
          {activeCandle && (
            <>
              <div>
                <span className="text-slate-500 mr-1.5">Time:</span>
                <span className="text-slate-300">{activeCandle.timeStr}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-1.5">O:</span>
                <span className="text-slate-200">{formatPrice(activeCandle.open, currency, 2)}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-1.5">H:</span>
                <span className="text-emerald-400">{formatPrice(activeCandle.high, currency, 2)}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-1.5">L:</span>
                <span className="text-rose-400">{formatPrice(activeCandle.low, currency, 2)}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-1.5">C:</span>
                <span className="font-bold text-white">{formatPrice(activeCandle.close, currency, 2)}</span>
              </div>
              {showVolume && (
                <div>
                  <span className="text-slate-500 mr-1.5">Vol:</span>
                  <span className="text-slate-400">{activeCandle.volume.toLocaleString()}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Period Return Badge */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Period Return:</span>
          <span
            className={`font-bold tabular-nums flex items-center ${
              performance.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {performance.changePct >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
            )}
            {performance.changePct >= 0 ? '+' : ''}
            {performance.changePct.toFixed(2)}% ({formatPrice(performance.change, currency, 1)})
          </span>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative w-full overflow-hidden bg-slate-950 rounded-xl border border-slate-800/80 p-2 sm:p-4 select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-[320px] sm:h-[400px] overflow-visible"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>

          {/* Horizontal grid guide lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const priceVal = minPrice + (maxPrice - minPrice) * (1 - pct);
            const yPos = getY(priceVal);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={yPos}
                  x2={svgWidth - paddingX}
                  y2={yPos}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={svgWidth - paddingX + 6}
                  y={yPos + 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  {formatPrice(priceVal, currency, 0)}
                </text>
              </g>
            );
          })}

          {/* Volume sub-chart bars */}
          {showVolume &&
            candles.map((candle, idx) => {
              const x = getX(idx);
              const volY = getVolY(candle.volume);
              const isBullish = candle.close >= candle.open;
              const barWidth = Math.max(3, (svgWidth - paddingX * 2) / candles.length - 2);
              return (
                <rect
                  key={`vol-${idx}`}
                  x={x - barWidth / 2}
                  y={volY}
                  width={barWidth}
                  height={svgHeight - volY}
                  fill={isBullish ? 'rgba(52, 211, 153, 0.3)' : 'rgba(248, 113, 113, 0.3)'}
                />
              );
            })}

          {/* Area Line Chart */}
          {chartType === 'line' && (
            <>
              <path d={areaPath} fill="url(#areaGradient)" />
              <path
                d={linePath}
                fill="none"
                stroke="url(#lineGlow)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Candlestick Chart */}
          {chartType === 'candle' &&
            candles.map((candle, idx) => {
              const x = getX(idx);
              const openY = getY(candle.open);
              const closeY = getY(candle.close);
              const highY = getY(candle.high);
              const lowY = getY(candle.low);
              const isBullish = candle.close >= candle.open;
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(2, Math.abs(closeY - openY));
              const barWidth = Math.max(4, Math.min(12, (svgWidth - paddingX * 2) / candles.length - 3));

              return (
                <g key={`candle-${idx}`}>
                  {/* High/Low wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={isBullish ? '#34d399' : '#f87171'}
                    strokeWidth="1.2"
                  />
                  {/* Candle body */}
                  <rect
                    x={x - barWidth / 2}
                    y={bodyTop}
                    width={barWidth}
                    height={bodyHeight}
                    fill={isBullish ? '#10b981' : '#ef4444'}
                    rx="1"
                  />
                </g>
              );
            })}

          {/* SMA 20 Overlay */}
          {showSMA20 && sma20Path && (
            <path
              d={sma20Path}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="none"
            />
          )}

          {/* SMA 50 Overlay */}
          {showSMA50 && sma50Path && (
            <path
              d={sma50Path}
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}

          {/* Hover Crosshair & interaction hit areas */}
          {candles.map((candle, idx) => {
            const x = getX(idx);
            const width = (svgWidth - paddingX * 2) / candles.length;
            const isHovered = hoveredCandle === candle;
            return (
              <g key={`hit-${idx}`}>
                <rect
                  x={x - width / 2}
                  y={0}
                  width={width}
                  height={svgHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredCandle(candle)}
                />
                {isHovered && (
                  <>
                    <line
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={svgHeight}
                      stroke="#f59e0b"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    <circle
                      cx={x}
                      cy={getY(candle.close)}
                      r="4"
                      fill="#f59e0b"
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-900 px-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" /> Bullish Candle
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" /> Bearish Candle
            </span>
            {showSMA20 && (
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> SMA (20)
              </span>
            )}
            {showSMA50 && (
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-3 h-0.5 bg-purple-400 inline-block" /> SMA (50)
              </span>
            )}
          </div>
          <span className="text-slate-500 hidden sm:inline">
            Interactive hover crosshair enabled · {timeframe} View
          </span>
        </div>
      </div>
    </div>
  );
};
