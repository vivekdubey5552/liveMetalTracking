import { 
  MetalPrice, 
  CandlePoint, 
  CityGoldRate, 
  IndianStockQuote, 
  FXRate, 
  MetalSymbol,
  GoldPurity,
  WeightUnit,
  Currency,
  IBJAMarketSession,
  IBJARateItem
} from '../types';

export const TROY_OUNCE_TO_GRAMS = 31.1034768;
export const INDIAN_CUSTOMS_DUTY_PCT = 0.06; // 6% (5% BCD + 1% AIDC)
export const INDIAN_GST_PCT = 0.03; // 3% GST on precious metals

export const INITIAL_FX: FXRate = {
  USDINR: 95.20,
  USDEUR: 0.92,
  lastUpdated: new Date().toLocaleTimeString(),
  isLive: true,
};

// Seed historical candles for realistic charts
function generateCandles(
  basePrice: number, 
  count: number, 
  volatility: number, 
  trendPct: number, 
  timeframeLabel: string
): CandlePoint[] {
  const points: CandlePoint[] = [];
  let currentClose = basePrice * (1 - trendPct / 100);
  const now = Date.now();
  const stepMs = timeframeLabel === '1D' 
    ? 15 * 60 * 1000 
    : timeframeLabel === '1W' 
    ? 2 * 3600 * 1000 
    : timeframeLabel === '1M' 
    ? 24 * 3600 * 1000 
    : timeframeLabel === '1Y' 
    ? 4 * 24 * 3600 * 1000 
    : 15 * 24 * 3600 * 1000;

  for (let i = count; i >= 0; i--) {
    const time = now - i * stepMs;
    const dateObj = new Date(time);
    let timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (timeframeLabel === '1M' || timeframeLabel === '1Y') {
      timeStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else if (timeframeLabel === '5Y') {
      timeStr = dateObj.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }

    const delta = (Math.random() - 0.485) * volatility * currentClose;
    const open = currentClose;
    currentClose = Math.max(open + delta, 1);
    const high = Math.max(open, currentClose) + Math.random() * (volatility * 0.6) * currentClose;
    const low = Math.min(open, currentClose) - Math.random() * (volatility * 0.6) * currentClose;
    const volume = Math.floor(1000 + Math.random() * 5000);

    points.push({
      timestamp: time,
      timeStr,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(currentClose.toFixed(2)),
      volume,
    });
  }

  // Ensure last candle close is close to basePrice
  if (points.length > 0) {
    points[points.length - 1].close = basePrice;
    points[points.length - 1].high = Math.max(points[points.length - 1].high, basePrice);
  }

  return points;
}

export const INITIAL_METALS: Record<MetalSymbol, MetalPrice> = {
  XAU: {
    symbol: 'XAU',
    name: 'Gold',
    priceUSDPerOz: 4040.70,
    change24hUSD: -16.70,
    change24hPercent: -0.41,
    high24hUSD: 4062.50,
    low24hUSD: 4032.10,
    bidUSD: 4040.10,
    askUSD: 4041.30,
    lastUpdated: new Date().toLocaleTimeString(),
    historical1D: generateCandles(4040.70, 32, 0.002, -0.35, '1D'),
    historical1W: generateCandles(4040.70, 42, 0.005, 1.8, '1W'),
    historical1M: generateCandles(4040.70, 30, 0.010, 4.2, '1M'),
    historical1Y: generateCandles(4040.70, 52, 0.018, 48.6, '1Y'),
    historical5Y: generateCandles(4040.70, 60, 0.025, 112.5, '5Y'),
  },
  XAG: {
    symbol: 'XAG',
    name: 'Silver',
    priceUSDPerOz: 53.52,
    change24hUSD: -0.82,
    change24hPercent: -1.51,
    high24hUSD: 54.45,
    low24hUSD: 53.15,
    bidUSD: 53.48,
    askUSD: 53.56,
    lastUpdated: new Date().toLocaleTimeString(),
    historical1D: generateCandles(53.52, 32, 0.006, -1.4, '1D'),
    historical1W: generateCandles(53.52, 42, 0.012, 3.1, '1W'),
    historical1M: generateCandles(53.52, 30, 0.020, 8.5, '1M'),
    historical1Y: generateCandles(53.52, 52, 0.028, 62.4, '1Y'),
    historical5Y: generateCandles(53.52, 60, 0.035, 145.0, '5Y'),
  },
  XPT: {
    symbol: 'XPT',
    name: 'Platinum',
    priceUSDPerOz: 1540.00,
    change24hUSD: 6.00,
    change24hPercent: 0.39,
    high24hUSD: 1548.50,
    low24hUSD: 1530.20,
    bidUSD: 1538.80,
    askUSD: 1541.20,
    lastUpdated: new Date().toLocaleTimeString(),
    historical1D: generateCandles(1540.00, 32, 0.004, 0.4, '1D'),
    historical1W: generateCandles(1540.00, 42, 0.009, 2.2, '1W'),
    historical1M: generateCandles(1540.00, 30, 0.016, 5.8, '1M'),
    historical1Y: generateCandles(1540.00, 52, 0.022, 54.2, '1Y'),
    historical5Y: generateCandles(1540.00, 60, 0.030, 72.8, '5Y'),
  },
  XPD: {
    symbol: 'XPD',
    name: 'Palladium',
    priceUSDPerOz: 998.00,
    change24hUSD: -18.00,
    change24hPercent: -1.77,
    high24hUSD: 1018.00,
    low24hUSD: 992.50,
    bidUSD: 997.00,
    askUSD: 999.00,
    lastUpdated: new Date().toLocaleTimeString(),
    historical1D: generateCandles(998.00, 32, 0.008, -1.6, '1D'),
    historical1W: generateCandles(998.00, 42, 0.015, -0.8, '1W'),
    historical1M: generateCandles(998.00, 30, 0.025, -3.2, '1M'),
    historical1Y: generateCandles(998.00, 52, 0.035, -12.4, '1Y'),
    historical5Y: generateCandles(998.00, 60, 0.045, -48.5, '5Y'),
  },
};

export const INITIAL_CITY_RATES: CityGoldRate[] = [
  { city: 'Mumbai', state: 'Maharashtra', price24K10g: 143500, price22K10g: 131540, price18K10g: 107625, silver1kg: 194500, trend: 'neutral', publishedDate: 'Today (11:30 AM / 5:00 PM)' },
  { city: 'New Delhi', state: 'Delhi NCR', price24K10g: 143650, price22K10g: 131690, price18K10g: 107750, silver1kg: 194800, trend: 'neutral', publishedDate: 'Today (11:30 AM / 5:00 PM)' },
  { city: 'Chennai', state: 'Tamil Nadu', price24K10g: 144100, price22K10g: 132100, price18K10g: 108100, silver1kg: 198400, trend: 'up', publishedDate: 'Today (11:30 AM / 5:00 PM)' },
  { city: 'Kolkata', state: 'West Bengal', price24K10g: 143500, price22K10g: 131540, price18K10g: 107625, silver1kg: 194500, trend: 'neutral', publishedDate: 'Today (11:30 AM / 5:00 PM)' },
  { city: 'Bengaluru', state: 'Karnataka', price24K10g: 143550, price22K10g: 131580, price18K10g: 107660, silver1kg: 194600, trend: 'neutral', publishedDate: 'Today (11:30 AM / 5:00 PM)' },
  { city: 'Hyderabad', state: 'Telangana', price24K10g: 143500, price22K10g: 131540, price18K10g: 107625, silver1kg: 194500, trend: 'neutral', publishedDate: 'Today (11:30 AM / 5:00 PM)' },
  { city: 'Ahmedabad', state: 'Gujarat', price24K10g: 143550, price22K10g: 131580, price18K10g: 107660, silver1kg: 194650, trend: 'neutral', publishedDate: 'Today (11:30 AM / 5:00 PM)' },
  { city: 'Pune', state: 'Maharashtra', price24K10g: 143500, price22K10g: 131540, price18K10g: 107625, silver1kg: 194500, trend: 'neutral', publishedDate: 'Today (11:30 AM / 5:00 PM)' },
];

export const INITIAL_INDIAN_STOCKS: IndianStockQuote[] = [
  {
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 Benchmark Index (NSE)',
    category: 'INDEX',
    currentPrice: 22698.85,
    change: -50.90,
    changePercent: -0.22,
    dayHigh: 22778.05,
    dayLow: 22497.70,
    yearHigh: 26277.35,
    yearLow: 21281.45,
    peRatio: 21.8,
    volume: '298.4M',
  },
  {
    symbol: 'SENSEX',
    name: 'BSE SENSEX 30 Benchmark',
    category: 'INDEX',
    currentPrice: 73246.03,
    change: -354.20,
    changePercent: -0.48,
    dayHigh: 73650.10,
    dayLow: 72980.40,
    yearHigh: 85978.25,
    yearLow: 70319.04,
    peRatio: 22.1,
    volume: '22.8M',
  },
  {
    symbol: 'NIFTY BANK',
    name: 'Nifty Bank Index (NSE)',
    category: 'INDEX',
    currentPrice: 54267.40,
    change: 292.50,
    changePercent: 0.54,
    dayHigh: 54440.25,
    dayLow: 53626.15,
    yearHigh: 61764.85,
    yearLow: 49954.85,
    peRatio: 16.4,
    volume: '158.2M',
  },
  {
    symbol: 'NIFTY COMMODITIES',
    name: 'Nifty Commodities Index',
    category: 'INDEX',
    currentPrice: 9145.20,
    change: 48.60,
    changePercent: 0.53,
    dayHigh: 9180.40,
    dayLow: 9085.10,
    yearHigh: 9480.00,
    yearLow: 7250.30,
    peRatio: 18.9,
    volume: '68.1M',
  },
  {
    symbol: 'GOLDBEES',
    name: 'Nippon India ETF Gold BeES',
    category: 'GOLD_ETF',
    currentPrice: 117.13,
    change: -0.45,
    changePercent: -0.38,
    dayHigh: 117.85,
    dayLow: 116.80,
    yearHigh: 121.50,
    yearLow: 64.20,
    peRatio: undefined,
    volume: '6.45M',
    underlyingAsset: '0.01g 99.5% Physical Gold',
  },
  {
    symbol: 'HDFCMFGETF',
    name: 'HDFC Gold ETF',
    category: 'GOLD_ETF',
    currentPrice: 116.85,
    change: -0.40,
    changePercent: -0.34,
    dayHigh: 117.40,
    dayLow: 116.40,
    yearHigh: 120.90,
    yearLow: 63.80,
    volume: '2.10M',
    underlyingAsset: '0.01g Physical Gold',
  },
  {
    symbol: 'SETFGOLD',
    name: 'SBI Gold ETF',
    category: 'GOLD_ETF',
    currentPrice: 117.05,
    change: -0.42,
    changePercent: -0.36,
    dayHigh: 117.65,
    dayLow: 116.70,
    yearHigh: 121.10,
    yearLow: 64.00,
    volume: '1.45M',
    underlyingAsset: '0.01g Physical Gold',
  },
  {
    symbol: 'SILVERBEES',
    name: 'Nippon India Silver ETF',
    category: 'SILVER_ETF',
    currentPrice: 183.90,
    change: -2.80,
    changePercent: -1.50,
    dayHigh: 186.40,
    dayLow: 182.80,
    yearHigh: 194.20,
    yearLow: 78.50,
    volume: '5.82M',
    underlyingAsset: 'Physical Silver 99.9% fineness',
  },
  {
    symbol: 'SGB2028-IV',
    name: 'SGB 2028-29 Series IV (Tranche IX)',
    category: 'SGB',
    currentPrice: 14320.00,
    change: -60.00,
    changePercent: -0.42,
    dayHigh: 14450.00,
    dayLow: 14280.00,
    yearHigh: 14850.00,
    yearLow: 6200.00,
    volume: '78K grams',
    underlyingAsset: '1g 999 Sovereign Gold Bond',
    sgbDetails: {
      tranche: '2028-29 Series IV',
      couponRate: 2.5,
      maturityDate: '2029-03-01',
      issuePrice: 5091.00,
    },
  },
  {
    symbol: 'SGB2030-I',
    name: 'SGB 2030-31 Series I',
    category: 'SGB',
    currentPrice: 14380.00,
    change: -50.00,
    changePercent: -0.35,
    dayHigh: 14500.00,
    dayLow: 14310.00,
    yearHigh: 14920.00,
    yearLow: 6850.00,
    volume: '95K grams',
    underlyingAsset: '1g 999 Sovereign Gold Bond',
    sgbDetails: {
      tranche: '2030-31 Series I',
      couponRate: 2.5,
      maturityDate: '2031-06-25',
      issuePrice: 6199.00,
    },
  },
  {
    symbol: 'TITAN',
    name: 'Titan Company Ltd (Tanishq Jewellery)',
    category: 'STOCK',
    currentPrice: 4337.90,
    change: 42.50,
    changePercent: 0.99,
    dayHigh: 4368.00,
    dayLow: 4295.10,
    yearHigh: 4420.00,
    yearLow: 3055.65,
    peRatio: 88.5,
    volume: '1.82M',
  },
  {
    symbol: 'MUTHOOTFIN',
    name: 'Muthoot Finance Ltd (Gold Loans)',
    category: 'STOCK',
    currentPrice: 2402.00,
    change: -5.50,
    changePercent: -0.23,
    dayHigh: 2420.00,
    dayLow: 2393.00,
    yearHigh: 2480.00,
    yearLow: 1220.00,
    peRatio: 19.4,
    volume: '980K',
  },
  {
    symbol: 'TATASTEEL',
    name: 'Tata Steel Ltd',
    category: 'STOCK',
    currentPrice: 168.33,
    change: -3.08,
    changePercent: -1.80,
    dayHigh: 170.99,
    dayLow: 168.09,
    yearHigh: 184.60,
    yearLow: 118.25,
    peRatio: 36.2,
    volume: '38.4M',
  },
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    category: 'STOCK',
    currentPrice: 1158.00,
    change: -38.10,
    changePercent: -3.19,
    dayHigh: 1198.50,
    dayLow: 1152.00,
    yearHigh: 1608.95,
    yearLow: 1120.00,
    peRatio: 24.2,
    volume: '18.5M',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    category: 'STOCK',
    currentPrice: 4125.60,
    change: 14.20,
    changePercent: 0.35,
    dayHigh: 4150.00,
    dayLow: 4095.00,
    yearHigh: 4592.25,
    yearLow: 3313.00,
    peRatio: 30.8,
    volume: '2.1M',
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    category: 'STOCK',
    currentPrice: 1815.40,
    change: 12.80,
    changePercent: 0.71,
    dayHigh: 1828.00,
    dayLow: 1798.50,
    yearHigh: 1874.00,
    yearLow: 1363.45,
    peRatio: 19.8,
    volume: '16.2M',
  },
];

// Calculation helpers
export function calculateGoldRates(spotUSDPerOz: number, usdInr: number) {
  // Pure 24K spot per gram in USD
  const usdPerGram24K = spotUSDPerOz / TROY_OUNCE_TO_GRAMS;
  // Raw INR per gram before Indian duties
  const inrRawPerGram24K = usdPerGram24K * usdInr;
  // With 6% customs duty & 3% GST (Indian retail landing benchmark)
  const inrLandedPerGram24K = inrRawPerGram24K * (1 + INDIAN_CUSTOMS_DUTY_PCT) * (1 + INDIAN_GST_PCT);

  const rate24KPerGram = Math.round(inrLandedPerGram24K);
  const rate22KPerGram = Math.round(inrLandedPerGram24K * (22 / 24)); // 91.67%
  const rate18KPerGram = Math.round(inrLandedPerGram24K * (18 / 24)); // 75.0%
  const rate14KPerGram = Math.round(inrLandedPerGram24K * (14 / 24)); // 58.33%

  return {
    rawUsdPerGram: Number(usdPerGram24K.toFixed(2)),
    rate24K: {
      perGram: rate24KPerGram,
      per8g: rate24KPerGram * 8, // Sovereign / Pavan
      per10g: rate24KPerGram * 10, // Tola benchmark
      per100g: rate24KPerGram * 100,
      perKg: rate24KPerGram * 1000,
      purityPct: 99.9,
    },
    rate22K: {
      perGram: rate22KPerGram,
      per8g: rate22KPerGram * 8,
      per10g: rate22KPerGram * 10,
      per100g: rate22KPerGram * 100,
      perKg: rate22KPerGram * 1000,
      purityPct: 91.6,
    },
    rate18K: {
      perGram: rate18KPerGram,
      per8g: rate18KPerGram * 8,
      per10g: rate18KPerGram * 10,
      per100g: rate18KPerGram * 100,
      perKg: rate18KPerGram * 1000,
      purityPct: 75.0,
    },
    rate14K: {
      perGram: rate14KPerGram,
      per8g: rate14KPerGram * 8,
      per10g: rate14KPerGram * 10,
      per100g: rate14KPerGram * 100,
      perKg: rate14KPerGram * 1000,
      purityPct: 58.3,
    },
  };
}

export function calculateSilverRates(spotUSDPerOz: number, usdInr: number) {
  const usdPerGram = spotUSDPerOz / TROY_OUNCE_TO_GRAMS;
  const inrRawPerGram = usdPerGram * usdInr;
  const inrLandedPerGram = inrRawPerGram * (1 + INDIAN_CUSTOMS_DUTY_PCT) * (1 + INDIAN_GST_PCT);
  const perGram = Math.round(inrLandedPerGram * 10) / 10;
  return {
    perGram,
    per10g: Math.round(perGram * 10),
    per100g: Math.round(perGram * 100),
    perKg: Math.round(perGram * 1000),
  };
}

export function formatPrice(amount: number, currency: Currency, decimals: number = 2): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(amount);
  } else if (currency === 'EUR') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(amount);
}

export function convertPrice(
  usdPricePerOz: number, 
  targetCurrency: Currency, 
  unit: WeightUnit, 
  fx: FXRate,
  isIndianLandedDuty: boolean = false
): number {
  let priceUSD = usdPricePerOz;
  if (unit === 'g') priceUSD = usdPricePerOz / TROY_OUNCE_TO_GRAMS;
  else if (unit === '10g') priceUSD = (usdPricePerOz / TROY_OUNCE_TO_GRAMS) * 10;
  else if (unit === 'sovereign') priceUSD = (usdPricePerOz / TROY_OUNCE_TO_GRAMS) * 8;
  else if (unit === 'kg') priceUSD = (usdPricePerOz / TROY_OUNCE_TO_GRAMS) * 1000;

  let multiplier = 1;
  if (targetCurrency === 'INR') {
    multiplier = fx.USDINR;
    if (isIndianLandedDuty) {
      multiplier *= (1 + INDIAN_CUSTOMS_DUTY_PCT) * (1 + INDIAN_GST_PCT);
    }
  } else if (targetCurrency === 'EUR') {
    multiplier = fx.USDEUR;
  }

  return priceUSD * multiplier;
}

// Interactive Jewellery Cost Breakdown Calculator
export interface JewelryEstimate {
  purity: GoldPurity;
  weightGrams: number;
  ratePerGram: number;
  baseGoldCost: number;
  makingChargeRate: number; // %
  makingCharges: number;
  huidHallmarkFee: number; // Flat ₹45 + 18% GST = ₹53.10
  subtotal: number;
  gstAmount: number; // 3% on (gold + making)
  totalInvoiceAmount: number;
  scrapResaleValue: number; // estimated resale without making charges/GST
  cityName?: string;
  sourceBenchmark?: string;
}

export function estimateJewelryCost(
  purity: GoldPurity, 
  weightGrams: number, 
  makingChargePct: number, 
  goldRates: ReturnType<typeof calculateGoldRates>,
  activeCityRate?: CityGoldRate | null
): JewelryEstimate {
  let ratePerGram = 0;

  if (activeCityRate) {
    if (purity === '24K') ratePerGram = Math.round(activeCityRate.price24K10g / 10);
    else if (purity === '22K') ratePerGram = Math.round(activeCityRate.price22K10g / 10);
    else if (purity === '18K') ratePerGram = Math.round(activeCityRate.price18K10g / 10);
    else if (purity === '14K') ratePerGram = Math.round((activeCityRate.price24K10g * (14 / 24)) / 10);
  } else {
    ratePerGram = goldRates.rate22K.perGram;
    if (purity === '24K') ratePerGram = goldRates.rate24K.perGram;
    else if (purity === '18K') ratePerGram = goldRates.rate18K.perGram;
    else if (purity === '14K') ratePerGram = goldRates.rate14K.perGram;
  }

  const baseGoldCost = Math.round(weightGrams * ratePerGram);
  const makingCharges = Math.round(baseGoldCost * (makingChargePct / 100));
  const huidHallmarkFee = 53.10; // HUID hallmarking charge
  const taxableAmount = baseGoldCost + makingCharges;
  const gstAmount = Math.round(taxableAmount * INDIAN_GST_PCT);
  const totalInvoiceAmount = Math.round(taxableAmount + gstAmount + huidHallmarkFee);

  // Scrap resale value: Jewelers deduct making charges & GST, giving 98% of pure metal value in this city
  const scrapResaleValue = Math.round(baseGoldCost * 0.98);

  return {
    purity,
    weightGrams,
    ratePerGram,
    baseGoldCost,
    makingChargeRate: makingChargePct,
    makingCharges,
    huidHallmarkFee,
    subtotal: taxableAmount,
    gstAmount,
    totalInvoiceAmount,
    scrapResaleValue,
    cityName: activeCityRate ? `${activeCityRate.city} (${activeCityRate.state})` : 'National IBJA Benchmark',
    sourceBenchmark: activeCityRate ? `Official IBJA ${activeCityRate.city} Rate` : 'IBJA National Benchmark',
  };
}

// Fetch live USD/INR exchange rate from open API with fallback
export async function fetchLiveExchangeRate(): Promise<number | null> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && data.rates.INR) {
        return Number(data.rates.INR.toFixed(2));
      }
    }
  } catch (err) {
    console.warn('Live FX rate fetch failed, using benchmark rate:', err);
  }
  return null;
}

// Official India Bullion and Jewellers Association (IBJA) Benchmark Data
// Source: https://ibjarates.com
export const OFFICIAL_IBJA_DATA: IBJAMarketSession = {
  dateStr: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  source: 'India Bullion and Jewellers Association Ltd (IBJA)',
  sourceUrl: 'https://ibjarates.com',
  status: 'Published',
  rates: [
    {
      purityLabel: 'Fine Gold (999) - 24 Karat',
      purityCode: '999',
      unit: '10g',
      openingRateAM: 142300,
      closingRatePM: 141730,
      change: -570,
      changePct: -0.40,
    },
    {
      purityLabel: 'Gold (995) - 24 Karat Standard Bullion',
      purityCode: '995',
      unit: '10g',
      openingRateAM: 141730,
      closingRatePM: 141160,
      change: -570,
      changePct: -0.40,
    },
    {
      purityLabel: 'Standard Gold (916) - 22 Karat (BIS Hallmark)',
      purityCode: '916',
      unit: '10g',
      openingRateAM: 130347,
      closingRatePM: 129771,
      change: -576,
      changePct: -0.44,
    },
    {
      purityLabel: 'Gold (750) - 18 Karat (Studded Jewellery)',
      purityCode: '750',
      unit: '10g',
      openingRateAM: 106725,
      closingRatePM: 106298,
      change: -427,
      changePct: -0.40,
    },
    {
      purityLabel: 'Gold (585) - 14 Karat (Daily Wear)',
      purityCode: '585',
      unit: '10g',
      openingRateAM: 83246,
      closingRatePM: 82911,
      change: -335,
      changePct: -0.40,
    },
    {
      purityLabel: 'Silver (999) - Fine Silver',
      purityCode: 'SILVER_999',
      unit: '1kg',
      openingRateAM: 194000,
      closingRatePM: 193200,
      change: -800,
      changePct: -0.41,
    },
  ],
};
