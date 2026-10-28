export type MetalSymbol = 'XAU' | 'XAG' | 'XPT' | 'XPD';

export type Currency = 'INR' | 'USD' | 'EUR';

export type WeightUnit = 'g' | '10g' | 'sovereign' | 'oz' | 'kg';

export type GoldPurity = '24K' | '22K' | '18K' | '14K';

export interface MetalPrice {
  symbol: MetalSymbol;
  name: string;
  priceUSDPerOz: number;
  change24hUSD: number;
  change24hPercent: number;
  high24hUSD: number;
  low24hUSD: number;
  bidUSD: number;
  askUSD: number;
  lastUpdated: string;
  historical1D: CandlePoint[];
  historical1W: CandlePoint[];
  historical1M: CandlePoint[];
  historical1Y: CandlePoint[];
  historical5Y: CandlePoint[];
}

export interface CandlePoint {
  timestamp: number;
  timeStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CityGoldRate {
  city: string;
  state: string;
  price24K10g: number;
  price22K10g: number;
  price18K10g: number;
  silver1kg: number;
  trend: 'up' | 'down' | 'neutral';
  publishedDate?: string;
}

export interface IBJARateItem {
  purityLabel: string;
  purityCode: '999' | '995' | '916' | '750' | '585' | 'SILVER_999';
  unit: '10g' | '1kg';
  openingRateAM: number;
  closingRatePM: number;
  change: number;
  changePct: number;
}

export interface IBJAMarketSession {
  dateStr: string;
  source: string;
  sourceUrl: string;
  status: 'Published' | 'Live' | 'Closed';
  rates: IBJARateItem[];
}

export interface IndianStockQuote {
  symbol: string;
  name: string;
  category: 'INDEX' | 'GOLD_ETF' | 'SILVER_ETF' | 'SGB' | 'STOCK';
  currentPrice: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  peRatio?: number;
  volume: string;
  underlyingAsset?: string; // For ETFs / SGB
  sgbDetails?: {
    tranche: string;
    couponRate: number; // e.g. 2.5%
    maturityDate: string;
    issuePrice: number;
  };
}

export interface PriceAlert {
  id: string;
  assetSymbol: string;
  assetName: string;
  assetType: 'METAL' | 'STOCK' | 'ETF' | 'SGB';
  targetPrice: number;
  currency: Currency;
  condition: 'ABOVE' | 'BELOW';
  unit?: WeightUnit;
  purity?: GoldPurity;
  createdPrice: number;
  createdAt: number;
  triggeredAt?: number;
  isActive: boolean;
  notes?: string;
  isTriggered: boolean;
}

export type AssetCategory = 
  | 'PHYSICAL_GOLD' 
  | 'SOVEREIGN_GOLD_BOND' 
  | 'GOLD_ETF' 
  | 'DIGITAL_GOLD'
  | 'PHYSICAL_SILVER' 
  | 'SILVER_ETF' 
  | 'PLATINUM_PALLADIUM' 
  | 'INDIAN_EQUITIES' 
  | 'CASH_FD';

export interface PortfolioHolding {
  id: string;
  name: string;
  symbol: string;
  category: AssetCategory;
  purity?: GoldPurity; // for physical gold
  unit: 'g' | 'kg' | 'units' | 'tola';
  quantity: number;
  averageBuyPrice: number; // in INR
  purchaseDate: string;
  notes?: string;
  currentPriceINR?: number;
}

export interface PortfolioTransaction {
  id: string;
  holdingId?: string;
  assetName: string;
  symbol: string;
  category: AssetCategory;
  type: 'BUY' | 'SELL';
  quantity: number;
  pricePerUnit: number; // in INR
  totalAmount: number;
  date: string;
  notes?: string;
}

export interface FXRate {
  USDINR: number;
  USDEUR: number;
  lastUpdated: string;
  isLive: boolean;
}

export type JewelleryCategory = 
  | 'RINGS' 
  | 'NECKLACES' 
  | 'BANGLES_BRACELETS' 
  | 'EARRINGS' 
  | 'CHAINS' 
  | 'COINS_BARS' 
  | 'MANGALSUTRA' 
  | 'SILVERWARE';

export interface JewelleryProduct {
  id: string;
  name: string;
  sku?: string;
  category: JewelleryCategory;
  purity: GoldPurity | 'SILVER_999';
  netWeightGrams: number;
  grossWeightGrams?: number;
  makingChargesPct: number;
  stoneChargesINR?: number;
  imageUrl?: string;
  images?: string[]; // Multiple photos support for product details page
  huidCode?: string;
  description?: string;
  dimensions?: string;
  metalColor?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  createdAt: number;
}

export interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  dateStr: string;
  timestamp: number;
  customerName: string;
  customerPhone?: string;
  itemDescription: string;
  purity: GoldPurity | 'SILVER_999';
  weightGrams: number;
  ratePerGram: number;
  baseMetalCost: number;
  makingChargePct: number;
  makingChargesAmount: number;
  huidHallmarkFee: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalGstAmount: number;
  totalInvoiceAmount: number;
  scrapResaleValue: number;
  appliedCity: string;
  sourceBenchmark: string;
  status: 'ESTIMATE' | 'PURCHASED' | 'PAID';
  notes?: string;
}
