import { 
  PortfolioHolding, 
  PortfolioTransaction, 
  PriceAlert, 
  SavedInvoice, 
  JewelleryProduct 
} from '../types';

const STORAGE_KEYS = {
  PORTFOLIO: 'bullionpulse_portfolio_v2',
  TRANSACTIONS: 'bullionpulse_transactions_v2',
  ALERTS: 'bullionpulse_alerts_v2',
  SETTINGS: 'bullionpulse_settings_v2',
  INVOICES: 'bullionpulse_invoices_v1',
  PRODUCTS: 'bullionpulse_products_v2',
};

export const INITIAL_HOLDINGS: PortfolioHolding[] = [
  {
    id: 'hold-1',
    name: '24K Minted Gold Bullion Bar (MMTC-PAMP)',
    symbol: 'XAU',
    category: 'PHYSICAL_GOLD',
    purity: '24K',
    unit: 'g',
    quantity: 50,
    averageBuyPrice: 128500, // per 10g (so 12850/g)
    purchaseDate: '2024-04-12',
    notes: 'Safe deposit locker at HDFC Bank. 999.9 purity certificate.',
  },
  {
    id: 'hold-2',
    name: '22K Traditional Hallmark Gold Jewellery',
    symbol: 'XAU',
    category: 'PHYSICAL_GOLD',
    purity: '22K',
    unit: 'g',
    quantity: 48, // 6 sovereign / pavans
    averageBuyPrice: 118200, // per 10g
    purchaseDate: '2023-11-10',
    notes: '916 BIS Hallmarked bridal heirloom sets.',
  },
  {
    id: 'hold-3',
    name: 'SGB 2028-29 Series IV (Tranche IX)',
    symbol: 'SGB2028-IV',
    category: 'SOVEREIGN_GOLD_BOND',
    unit: 'units',
    quantity: 25, // 25 grams
    averageBuyPrice: 5091, // original RBI issue price
    purchaseDate: '2021-03-01',
    notes: 'RBI 2.5% semi-annual interest, completely tax-free capital gain upon maturity in 2029.',
  },
  {
    id: 'hold-4',
    name: 'Nippon India ETF Gold BeES',
    symbol: 'GOLDBEES',
    category: 'GOLD_ETF',
    unit: 'units',
    quantity: 3500,
    averageBuyPrice: 88.50,
    purchaseDate: '2023-08-15',
    notes: 'Demat holding via Zerodha. High liquidity.',
  },
  {
    id: 'hold-5',
    name: 'Physical 999 Fine Silver Bars',
    symbol: 'XAG',
    category: 'PHYSICAL_SILVER',
    unit: 'kg',
    quantity: 2,
    averageBuyPrice: 152000, // per kg
    purchaseDate: '2024-01-20',
    notes: 'Two 1kg serialized cast bullion bars.',
  },
  {
    id: 'hold-6',
    name: 'Nippon India Silver ETF',
    symbol: 'SILVERBEES',
    category: 'SILVER_ETF',
    unit: 'units',
    quantity: 1200,
    averageBuyPrice: 135.20,
    purchaseDate: '2024-03-05',
    notes: 'Silver tactical allocation.',
  },
  {
    id: 'hold-7',
    name: 'Titan Company Ltd',
    symbol: 'TITAN',
    category: 'INDIAN_EQUITIES',
    unit: 'units',
    quantity: 75,
    averageBuyPrice: 3650.00,
    purchaseDate: '2023-09-18',
    notes: 'Consumer discretionary jewellery titan (Tanishq/Mia).',
  },
  {
    id: 'hold-8',
    name: 'Liquid Cash & Emergency Gold Fund (FD)',
    symbol: 'CASH',
    category: 'CASH_FD',
    unit: 'units',
    quantity: 1,
    averageBuyPrice: 250000,
    purchaseDate: '2024-06-01',
    notes: '7.5% p.a. bank fixed deposit ready for gold dips.',
  },
];

export const INITIAL_TRANSACTIONS: PortfolioTransaction[] = [
  {
    id: 'tx-1',
    holdingId: 'hold-1',
    assetName: '24K Minted Gold Bullion Bar (MMTC-PAMP)',
    symbol: 'XAU',
    category: 'PHYSICAL_GOLD',
    type: 'BUY',
    quantity: 50,
    pricePerUnit: 12850,
    totalAmount: 642500,
    date: '2024-04-12',
    notes: 'Purchased directly from authorized bullion refiner.',
  },
  {
    id: 'tx-2',
    holdingId: 'hold-3',
    assetName: 'SGB 2028-29 Series IV',
    symbol: 'SGB2028-IV',
    category: 'SOVEREIGN_GOLD_BOND',
    type: 'BUY',
    quantity: 25,
    pricePerUnit: 5091,
    totalAmount: 127275,
    date: '2021-03-01',
    notes: 'Allotted in RBI Sovereign Gold Bond tranche.',
  },
  {
    id: 'tx-3',
    holdingId: 'hold-4',
    assetName: 'Nippon India ETF Gold BeES',
    symbol: 'GOLDBEES',
    category: 'GOLD_ETF',
    type: 'BUY',
    quantity: 3500,
    pricePerUnit: 88.50,
    totalAmount: 309750,
    date: '2023-08-15',
    notes: 'DCA systematic accumulation.',
  },
];

export const INITIAL_ALERTS: PriceAlert[] = [
  {
    id: 'alert-1',
    assetSymbol: 'XAU',
    assetName: 'Gold 24K (India 10g)',
    assetType: 'METAL',
    targetPrice: 145000,
    currency: 'INR',
    condition: 'ABOVE',
    unit: '10g',
    purity: '24K',
    createdPrice: 143500,
    createdAt: Date.now() - 3600000,
    isActive: true,
    isTriggered: false,
    notes: 'Alert when 24K gold crosses ₹1,45,000/10g psychological milestone',
  },
  {
    id: 'alert-2',
    assetSymbol: 'XAU',
    assetName: 'Gold Spot (USD/oz)',
    assetType: 'METAL',
    targetPrice: 4100,
    currency: 'USD',
    condition: 'ABOVE',
    unit: 'oz',
    purity: '24K',
    createdPrice: 4040.70,
    createdAt: Date.now() - 86400000,
    isActive: true,
    isTriggered: false,
    notes: 'Resistance breakout target ($4,100/oz)',
  },
  {
    id: 'alert-3',
    assetSymbol: 'XAG',
    assetName: 'Silver 1kg (India)',
    assetType: 'METAL',
    targetPrice: 198000,
    currency: 'INR',
    condition: 'ABOVE',
    unit: 'kg',
    createdPrice: 194500,
    createdAt: Date.now() - 7200000,
    isActive: true,
    isTriggered: false,
    notes: 'Target level for partial profit booking',
  },
  {
    id: 'alert-4',
    assetSymbol: 'GOLDBEES',
    assetName: 'Nippon India Gold BeES ETF',
    assetType: 'ETF',
    targetPrice: 120.00,
    currency: 'INR',
    condition: 'ABOVE',
    createdPrice: 117.13,
    createdAt: Date.now() - 4800000,
    isActive: true,
    isTriggered: false,
    notes: 'ETF ₹120 round level breakout',
  },
  {
    id: 'alert-5',
    assetSymbol: 'NIFTY 50',
    assetName: 'NIFTY 50 Benchmark Index',
    assetType: 'STOCK',
    targetPrice: 23000,
    currency: 'INR',
    condition: 'ABOVE',
    createdPrice: 22698.85,
    createdAt: Date.now() - 2400000,
    isActive: true,
    isTriggered: false,
    notes: 'NIFTY 23,000 recovery milestone',
  },
];

export const INITIAL_PRODUCTS: JewelleryProduct[] = [
  {
    id: 'prod-mangalsutra-caratlane',
    name: 'Hiranya 22KT Gold Mangalsutra',
    sku: 'KS00517-2Y0000',
    category: 'MANGALSUTRA',
    purity: '22K',
    netWeightGrams: 14.85,
    grossWeightGrams: 15.20,
    makingChargesPct: 11.5,
    huidCode: 'MH9168',
    dimensions: 'Height: 22.4 mm | Width: 20.8 mm | Chain: 18 inch',
    metalColor: '22 KT Yellow Gold',
    rating: 4.9,
    reviewCount: 38,
    inStock: true,
    imageUrl: '/src/assets/images/caratlane_mangalsutra_gold_1793216620429.jpg',
    images: [
      '/src/assets/images/caratlane_mangalsutra_gold_1793216620429.jpg',
      '/src/assets/images/caratlane_mangalsutra_angle_1793216620550.jpg',
      '/src/assets/images/caratlane_mangalsutra_model_1793216621231.jpg',
    ],
    description: 'An auspicious union of heritage and contemporary grace. The Hiranya 22KT gold mangalsutra features handcrafted floral filigree with auspicious black onyx beads designed for everyday grace and celebratory occasions.',
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'prod-1',
    name: '22K Royal Temple Bridal Choker',
    sku: 'NK04821-2Y0000',
    category: 'NECKLACES',
    purity: '22K',
    netWeightGrams: 42.5,
    grossWeightGrams: 43.0,
    makingChargesPct: 14,
    huidCode: 'MH9168',
    dimensions: 'Height: 48.0 mm | Width: 185.0 mm',
    metalColor: '22 KT Antique Yellow Gold',
    rating: 4.9,
    reviewCount: 52,
    inStock: true,
    imageUrl: '/src/assets/images/caratlane_gold_bridal_choker_1793216621783.jpg',
    images: [
      '/src/assets/images/caratlane_gold_bridal_choker_1793216621783.jpg',
    ],
    description: 'Traditional antique Nakshi handcrafted bridal choker with auspicious Lakshmi motifs and heritage South Indian craftsmanship.',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'prod-3',
    name: '18K Solitaire Illusion Diamond Ring',
    sku: 'RG01834-1R0000',
    category: 'RINGS',
    purity: '18K',
    netWeightGrams: 5.2,
    grossWeightGrams: 5.4,
    makingChargesPct: 16,
    stoneChargesINR: 35000,
    huidCode: 'DL7504',
    dimensions: 'Ring Size: 14 (Standard) | Diamond: 0.50 ct VVS-EF',
    metalColor: '18 KT Two-Tone Gold',
    rating: 4.8,
    reviewCount: 29,
    inStock: true,
    imageUrl: '/src/assets/images/caratlane_diamond_ring_1793216621437.jpg',
    images: [
      '/src/assets/images/caratlane_diamond_ring_1793216621437.jpg',
    ],
    description: 'Contemporary 18K white-rose two-tone gold ring set with certified VVS-EF diamonds in a brilliant solitaire illusion setting.',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'prod-2',
    name: '22K Handcrafted Kolkata Filigree Bangles (Pair)',
    sku: 'BG00921-2Y0000',
    category: 'BANGLES_BRACELETS',
    purity: '22K',
    netWeightGrams: 28.0,
    grossWeightGrams: 28.2,
    makingChargesPct: 11,
    huidCode: 'WB9162',
    dimensions: 'Size: 2-6 (2.375 inch diameter)',
    metalColor: '22 KT Yellow Gold',
    rating: 4.7,
    reviewCount: 19,
    inStock: true,
    description: 'Intricate open-work laser filigree floral bangles with secure screw clasp and high-polish finish.',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'prod-4',
    name: '22K Traditional Heavy Rope Chain',
    sku: 'CH00412-2Y0000',
    category: 'CHAINS',
    purity: '22K',
    netWeightGrams: 18.5,
    grossWeightGrams: 18.5,
    makingChargesPct: 8.5,
    huidCode: 'TN9161',
    dimensions: 'Length: 22 inch | Width: 3.2 mm',
    metalColor: '22 KT Yellow Gold',
    rating: 4.9,
    reviewCount: 44,
    inStock: true,
    description: 'High tensile diamond-cut Italian rope weave chain for daily elegance and durability.',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'prod-5',
    name: '24K Minted Gold Bullion Bar (999.9)',
    sku: 'BR00010-9Y0000',
    category: 'COINS_BARS',
    purity: '24K',
    netWeightGrams: 10.0,
    grossWeightGrams: 10.0,
    makingChargesPct: 3.0,
    huidCode: 'AU9999',
    dimensions: '31 mm x 18 mm x 1 mm',
    metalColor: '24 KT Fine Gold 999.9',
    rating: 5.0,
    reviewCount: 88,
    inStock: true,
    description: 'LBMA & NABL accredited tamper-proof certicard blister minted bullion bar with individual serial number.',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'prod-6',
    name: '999 Fine Silver Traditional Pooja Thali Set',
    sku: 'SL00250-9S0000',
    category: 'SILVERWARE',
    purity: 'SILVER_999',
    netWeightGrams: 250.0,
    grossWeightGrams: 250.0,
    makingChargesPct: 12.0,
    dimensions: 'Thali Diameter: 9 inch',
    metalColor: '999 Fine Silver',
    rating: 4.8,
    reviewCount: 22,
    inStock: true,
    description: 'Hand-embossed sterling silver thali with matching diya, bell, and agarbatti stand for auspicious ceremonies.',
    createdAt: Date.now() - 86400000 * 6,
  },
];

export const INITIAL_SAVED_INVOICES: SavedInvoice[] = [
  {
    id: 'inv-1001',
    invoiceNumber: 'BP-INV-2026-001',
    dateStr: '2026-10-25',
    timestamp: Date.now() - 86400000 * 3,
    customerName: 'Aarav Sharma',
    customerPhone: '+91 98201 44552',
    itemDescription: '22K Traditional Hallmark Gold Jewellery (Bridal Set)',
    purity: '22K',
    weightGrams: 24.0,
    ratePerGram: 13154,
    baseMetalCost: 315696,
    makingChargePct: 12,
    makingChargesAmount: 37884,
    huidHallmarkFee: 53.10,
    taxableAmount: 353580,
    cgstAmount: 5304,
    sgstAmount: 5304,
    totalGstAmount: 10608,
    totalInvoiceAmount: 364241,
    scrapResaleValue: 309382,
    appliedCity: 'Mumbai',
    sourceBenchmark: 'Official IBJA Mumbai Rate',
    status: 'PAID',
    notes: 'Paid via RTGS. HUID certified.',
  },
  {
    id: 'inv-1002',
    invoiceNumber: 'BP-INV-2026-002',
    dateStr: '2026-10-27',
    timestamp: Date.now() - 86400000,
    customerName: 'Priya Venkatesh',
    customerPhone: '+91 94440 12345',
    itemDescription: '24K Minted Gold Bullion Biscuit (MMTC-PAMP)',
    purity: '24K',
    weightGrams: 10.0,
    ratePerGram: 14410,
    baseMetalCost: 144100,
    makingChargePct: 3.5,
    makingChargesAmount: 5044,
    huidHallmarkFee: 53.10,
    taxableAmount: 149144,
    cgstAmount: 2237,
    sgstAmount: 2237,
    totalGstAmount: 4474,
    totalInvoiceAmount: 153671,
    scrapResaleValue: 141218,
    appliedCity: 'Chennai',
    sourceBenchmark: 'Official IBJA Chennai Rate',
    status: 'PURCHASED',
    notes: 'Diwali investment purchase.',
  },
];

export interface AppSettings {
  preferredCurrency: 'INR' | 'USD' | 'EUR';
  preferredWeightUnit: '10g' | 'g' | 'sovereign' | 'oz' | 'kg';
  soundEnabled: boolean;
  liveTickSimulation: boolean;
  selectedCity: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  preferredCurrency: 'INR',
  preferredWeightUnit: '10g',
  soundEnabled: true,
  liveTickSimulation: true,
  selectedCity: 'Mumbai',
};

export const StorageService = {
  getHoldings(): PortfolioHolding[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading holdings from localStorage:', e);
    }
    return INITIAL_HOLDINGS;
  },

  saveHoldings(holdings: PortfolioHolding[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(holdings));
    } catch (e) {
      console.error('Error saving holdings:', e);
    }
  },

  getTransactions(): PortfolioTransaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading transactions:', e);
    }
    return INITIAL_TRANSACTIONS;
  },

  saveTransactions(transactions: PortfolioTransaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions:', e);
    }
  },

  getAlerts(): PriceAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading alerts:', e);
    }
    return INITIAL_ALERTS;
  },

  saveAlerts(alerts: PriceAlert[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.error('Error saving alerts:', e);
    }
  },

  getInvoices(): SavedInvoice[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading invoices:', e);
    }
    return INITIAL_SAVED_INVOICES;
  },

  saveInvoices(invoices: SavedInvoice[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    } catch (e) {
      console.error('Error saving invoices:', e);
    }
  },

  getProducts(): JewelleryProduct[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error loading products:', e);
    }
    return INITIAL_PRODUCTS;
  },

  saveProducts(products: JewelleryProduct[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products:', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  },

  resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.PORTFOLIO);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  },

  exportBackup(): string {
    const backup = {
      version: 2,
      timestamp: new Date().toISOString(),
      holdings: this.getHoldings(),
      transactions: this.getTransactions(),
      alerts: this.getAlerts(),
      invoices: this.getInvoices(),
      products: this.getProducts(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed) {
        if (Array.isArray(parsed.holdings)) this.saveHoldings(parsed.holdings);
        if (Array.isArray(parsed.transactions)) this.saveTransactions(parsed.transactions);
        if (Array.isArray(parsed.alerts)) this.saveAlerts(parsed.alerts);
        if (Array.isArray(parsed.invoices)) this.saveInvoices(parsed.invoices);
        if (Array.isArray(parsed.products)) this.saveProducts(parsed.products);
        if (parsed.settings) this.saveSettings(parsed.settings);
        return true;
      }
    } catch (e) {
      console.error('Import error:', e);
    }
    return false;
  },
};
