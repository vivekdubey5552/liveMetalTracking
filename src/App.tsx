import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LiveTickerBar } from './components/LiveTickerBar';
import { MetalsOverview } from './components/metals/MetalsOverview';
import { PurityCalculator } from './components/metals/PurityCalculator';
import { InteractiveChart } from './components/charts/InteractiveChart';
import { GoldSilverRatio } from './components/charts/GoldSilverRatio';
import { IndianMarketHub } from './components/stocks/IndianMarketHub';
import { PortfolioDashboard } from './components/portfolio/PortfolioDashboard';
import { AlertsManager } from './components/alerts/AlertsManager';
import { AddHoldingModal } from './components/portfolio/AddHoldingModal';
import { AddAlertModal } from './components/alerts/AddAlertModal';
import { JewelleryCatalogue } from './components/jewellery/JewelleryCatalogue';
import { PrintableInvoiceModal } from './components/invoices/PrintableInvoiceModal';
import { SavedInvoicesTracker } from './components/invoices/SavedInvoicesTracker';
import { NotificationToast, ToastMessage } from './components/common/NotificationToast';

import { 
  Currency, 
  MetalSymbol, 
  MetalPrice, 
  IndianStockQuote, 
  FXRate, 
  PortfolioHolding, 
  PriceAlert,
  JewelleryProduct,
  SavedInvoice
} from './types';
import { 
  INITIAL_METALS, 
  INITIAL_INDIAN_STOCKS, 
  INITIAL_FX, 
  fetchLiveExchangeRate,
  calculateGoldRates
} from './services/marketData';
import { StorageService } from './services/storage';
import { alertService } from './services/alertManager';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('catalogue');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [chartFocusedSymbol, setChartFocusedSymbol] = useState<MetalSymbol>('XAU');

  // Market data states
  const [metals, setMetals] = useState<Record<MetalSymbol, MetalPrice>>(INITIAL_METALS);
  const [stocks, setStocks] = useState<IndianStockQuote[]>(INITIAL_INDIAN_STOCKS);
  const [fx, setFx] = useState<FXRate>(INITIAL_FX);

  // User persistent states
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(() => StorageService.getHoldings());
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => StorageService.getAlerts());
  const [invoices, setInvoices] = useState<SavedInvoice[]>(() => StorageService.getInvoices());
  const [products, setProducts] = useState<JewelleryProduct[]>(() => StorageService.getProducts());
  const [selectedCity, setSelectedCity] = useState<string>(() => StorageService.getSettings().selectedCity || 'Mumbai');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Invoice & Print modals
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState<SavedInvoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isSavedInvoicesTrackerOpen, setIsSavedInvoicesTrackerOpen] = useState<boolean>(false);

  // Modal states
  const [holdingModalOpen, setHoldingModalOpen] = useState<boolean>(false);
  const [holdingModalPreset, setHoldingModalPreset] = useState<{ symbol: string; name: string }>({
    symbol: 'XAU',
    name: '24K Minted Gold Bullion Bar',
  });

  const [alertModalOpen, setAlertModalOpen] = useState<boolean>(false);
  const [alertModalPreset, setAlertModalPreset] = useState<{ symbol: string; name: string }>({
    symbol: 'XAU',
    name: 'Gold',
  });

  // Save changes to localStorage
  useEffect(() => {
    StorageService.saveHoldings(holdings);
  }, [holdings]);

  useEffect(() => {
    StorageService.saveAlerts(alerts);
  }, [alerts]);

  useEffect(() => {
    StorageService.saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    StorageService.saveProducts(products);
  }, [products]);

  // Fetch live USD/INR exchange rate on mount
  useEffect(() => {
    async function loadLiveFx() {
      const liveRate = await fetchLiveExchangeRate();
      if (liveRate) {
        setFx((prev) => ({
          ...prev,
          USDINR: liveRate,
          lastUpdated: new Date().toLocaleTimeString(),
          isLive: true,
        }));
      }
    }
    loadLiveFx();
  }, []);

  // Live simulation tick engine (runs every 3 seconds to simulate active global market ticks)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Slightly jitter metals prices with realistic micro-variations
      setMetals((prev) => {
        const next = { ...prev };
        const symbols: MetalSymbol[] = ['XAU', 'XAG', 'XPT', 'XPD'];

        symbols.forEach((sym) => {
          const m = next[sym];
          // Small micro fluctuation: -0.05% to +0.05%
          const delta = (Math.random() - 0.495) * (sym === 'XAU' ? 0.95 : sym === 'XAG' ? 0.04 : 0.65);
          const newPrice = Number(Math.max(1, m.priceUSDPerOz + delta).toFixed(2));
          const newChangeUSD = Number((m.change24hUSD + delta).toFixed(2));
          const prevClose = m.priceUSDPerOz - m.change24hUSD;
          const newChangePct = prevClose > 0 ? Number(((newChangeUSD / prevClose) * 100).toFixed(2)) : m.change24hPercent;

          next[sym] = {
            ...m,
            priceUSDPerOz: newPrice,
            change24hUSD: newChangeUSD,
            change24hPercent: newChangePct,
            high24hUSD: Math.max(m.high24hUSD, newPrice),
            low24hUSD: Math.min(m.low24hUSD, newPrice),
            bidUSD: Number((newPrice - (sym === 'XAU' ? 0.4 : 0.03)).toFixed(2)),
            askUSD: Number((newPrice + (sym === 'XAU' ? 0.4 : 0.03)).toFixed(2)),
            lastUpdated: new Date().toLocaleTimeString(),
          };
        });

        return next;
      });

      // 2. Micro jitter stock/ETF prices
      setStocks((prev) => {
        return prev.map((stock) => {
          if (stock.category === 'INDEX') return stock;
          const delta = (Math.random() - 0.49) * (stock.currentPrice * 0.0008);
          const newPrice = Number((stock.currentPrice + delta).toFixed(2));
          const newChange = Number((stock.change + delta).toFixed(2));
          const prevClose = stock.currentPrice - stock.change;
          const newPct = prevClose > 0 ? Number(((newChange / prevClose) * 100).toFixed(2)) : stock.changePercent;
          return {
            ...stock,
            currentPrice: newPrice,
            change: newChange,
            changePercent: newPct,
            dayHigh: Math.max(stock.dayHigh, newPrice),
            dayLow: Math.min(stock.dayLow, newPrice),
          };
        });
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Alert evaluation listener: runs when metals or stocks change
  useEffect(() => {
    const { triggeredAlerts, updatedAlerts } = alertService.checkAlerts(alerts, metals, stocks, fx);

    if (triggeredAlerts.length > 0) {
      if (soundEnabled) {
        alertService.playChime('alert');
      }

      // Add floating toast notifications
      triggeredAlerts.forEach((alert) => {
        const newToast: ToastMessage = {
          id: `toast-${Date.now()}-${Math.random()}`,
          title: `Price Alert Triggered: ${alert.assetName}`,
          message: `Target of ${alert.currency === 'INR' ? '₹' : '$'}${alert.targetPrice.toLocaleString()} met (${alert.condition === 'ABOVE' ? '≥' : '≤'}).`,
          timestamp: Date.now(),
        };
        setToasts((prev) => [newToast, ...prev].slice(0, 4));
      });

      setAlerts(updatedAlerts);
    }
  }, [metals, stocks, alerts, fx, soundEnabled]);

  // Manual refresh handler
  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    const liveRate = await fetchLiveExchangeRate();
    if (liveRate) {
      setFx((prev) => ({
        ...prev,
        USDINR: liveRate,
        lastUpdated: new Date().toLocaleTimeString(),
        isLive: true,
      }));
    }
    setTimeout(() => {
      setIsRefreshing(false);
      setToasts((prev) => [
        {
          id: `refresh-${Date.now()}`,
          title: 'Market Quotes Refreshed',
          message: `Live rates and USD/INR exchange rate updated (₹${fx.USDINR.toFixed(2)}).`,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    }, 600);
  }, [fx.USDINR]);

  // Audio test trigger
  const handleTestAudio = useCallback(() => {
    alertService.playChime('alert');
    setToasts((prev) => [
      {
        id: `test-${Date.now()}`,
        title: 'Alert Audio Verified',
        message: 'High-frequency harmonic chime played successfully via Web Audio API.',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  // Holding actions
  const handleAddHolding = (holdingData: Omit<PortfolioHolding, 'id'>) => {
    const newHolding: PortfolioHolding = {
      ...holdingData,
      id: `hold-${Date.now()}`,
    };
    setHoldings((prev) => [newHolding, ...prev]);
    setToasts((prev) => [
      {
        id: `hold-add-${Date.now()}`,
        title: 'Investment Added',
        message: `${newHolding.name} (${newHolding.quantity} ${newHolding.unit}) successfully added to portfolio.`,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  const handleDeleteHolding = (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  };

  // Alert actions
  const handleAddAlert = (alertData: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>) => {
    const newAlert: PriceAlert = {
      ...alertData,
      id: `alert-${Date.now()}`,
      createdAt: Date.now(),
      isTriggered: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setToasts((prev) => [
      {
        id: `alert-add-${Date.now()}`,
        title: 'Price Alert Armed',
        message: `Alert set for ${newAlert.assetName} at ${newAlert.currency === 'INR' ? '₹' : '$'}${newAlert.targetPrice.toLocaleString()}.`,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  const handleToggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleRearmAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, isTriggered: false, isActive: true, triggeredAt: undefined } : a
      )
    );
  };

  // Backup handlers
  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BullionPulse_Portfolio_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonString: string) => {
    const ok = StorageService.importBackup(jsonString);
    if (ok) {
      setHoldings(StorageService.getHoldings());
      setAlerts(StorageService.getAlerts());
      setToasts((prev) => [
        {
          id: `imp-${Date.now()}`,
          title: 'Portfolio Restored',
          message: 'Holdings and alerts successfully imported from backup file.',
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    }
  };

  const handleResetDemo = () => {
    StorageService.resetAll();
    setHoldings(StorageService.getHoldings());
    setAlerts(StorageService.getAlerts());
    setInvoices(StorageService.getInvoices());
    setProducts(StorageService.getProducts());
    setToasts((prev) => [
      {
        id: `reset-${Date.now()}`,
        title: 'Demo Portfolio Restored',
        message: 'Loaded balanced sample holdings across physical bullion, SGBs, ETFs, and equities.',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  // Product Catalogue actions
  const handleAddProduct = (prodData: Omit<JewelleryProduct, 'id' | 'createdAt'>) => {
    const newProd: JewelleryProduct = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: Date.now(),
    };
    setProducts((prev) => [newProd, ...prev]);
    setToasts((prev) => [
      {
        id: `prod-add-${Date.now()}`,
        title: 'Product Added to Catalogue',
        message: `${newProd.name} (${newProd.netWeightGrams}g, ${newProd.purity}) added.`,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setToasts((prev) => [
      {
        id: `prod-del-${Date.now()}`,
        title: 'Product Removed',
        message: 'Item removed from catalogue.',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  // Invoice Actions
  const handleSaveInvoice = (inv: SavedInvoice) => {
    setInvoices((prev) => {
      const exists = prev.some((i) => i.id === inv.id);
      if (exists) {
        return prev.map((i) => (i.id === inv.id ? inv : i));
      }
      return [inv, ...prev];
    });
    setToasts((prev) => [
      {
        id: `inv-save-${Date.now()}`,
        title: 'Tax Invoice Saved',
        message: `Invoice #${inv.invoiceNumber} recorded for tracking (₹${inv.totalInvoiceAmount.toLocaleString('en-IN')}).`,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    setToasts((prev) => [
      {
        id: `inv-del-${Date.now()}`,
        title: 'Invoice Deleted',
        message: 'Invoice removed from tracking records.',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  const handleUpdateInvoiceStatus = (id: string, status: 'ESTIMATE' | 'PURCHASED' | 'PAID') => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  };

  const handleOpenInvoiceForPrint = (inv: SavedInvoice) => {
    setActiveInvoiceForPrint(inv);
    setIsInvoiceModalOpen(true);
  };

  // Quick action openers
  const openAlertModalFor = (symbol: string, name: string) => {
    setAlertModalPreset({ symbol, name });
    setAlertModalOpen(true);
  };

  const openPortfolioModalFor = (symbol: string, name: string) => {
    setHoldingModalPreset({ symbol, name });
    setHoldingModalOpen(true);
  };

  const viewChartsFor = (symbol: MetalSymbol) => {
    setChartFocusedSymbol(symbol);
    setActiveTab('charts');
  };

  const activeAlertsCount = alerts.filter((a) => a.isActive && !a.isTriggered).length;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-900">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currency={currency}
        onCurrencyChange={setCurrency}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        usdInrRate={fx.USDINR}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
        activeAlertsCount={activeAlertsCount}
      />

      {/* Live Financial Ticker Ribbon */}
      <LiveTickerBar
        metals={metals}
        stocks={stocks}
        fx={fx}
        currency={currency}
        onSelectAsset={(sym) => {
          if (['XAU', 'XAG', 'XPT', 'XPD'].includes(sym)) {
            viewChartsFor(sym as MetalSymbol);
          } else if (sym.startsWith('IBJA')) {
            setActiveTab('purity');
          } else {
            setActiveTab('indian-markets');
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Tab 1: Spot Bullion Overview */}
        {activeTab === 'metals' && (
          <MetalsOverview
            metals={metals}
            fx={fx}
            currency={currency}
            onOpenAlertModal={openAlertModalFor}
            onOpenPortfolioModal={openPortfolioModalFor}
            onViewCharts={viewChartsFor}
            onViewPurity={() => setActiveTab('purity')}
            onViewCatalogue={() => setActiveTab('catalogue')}
          />
        )}

        {/* Tab 2: 24K, 22K, 18K Purity & Invoice Calculator */}
        {activeTab === 'purity' && (
          <PurityCalculator
            goldPrice={metals.XAU}
            fx={fx}
            onOpenAlertModal={openAlertModalFor}
            onOpenPortfolioModal={openPortfolioModalFor}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            onGenerateInvoice={handleOpenInvoiceForPrint}
            onOpenSavedInvoices={() => setIsSavedInvoicesTrackerOpen(true)}
            savedInvoicesCount={invoices.length}
          />
        )}

        {/* Tab: Jewellery Menu & Invoices */}
        {activeTab === 'catalogue' && (
          <JewelleryCatalogue
            products={products}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            onGenerateInvoiceForProduct={(prod, inv) => {
              handleOpenInvoiceForPrint(inv);
            }}
            onOpenSavedInvoices={() => setIsSavedInvoicesTrackerOpen(true)}
            onOpenPortfolioModal={openPortfolioModalFor}
            goldPrice={metals.XAU}
            fx={fx}
            savedInvoicesCount={invoices.length}
          />
        )}

        {/* Tab 3: Interactive Historical Charts & Ratio */}
        {activeTab === 'charts' && (
          <div className="space-y-8">
            <InteractiveChart
              metals={metals}
              currency={currency}
              usdInrRate={fx.USDINR}
              initialSymbol={chartFocusedSymbol}
            />
            <GoldSilverRatio
              goldPrice={metals.XAU}
              silverPrice={metals.XAG}
              platinumPrice={metals.XPT}
            />
          </div>
        )}

        {/* Tab 4: Indian Stock Market & SGB */}
        {activeTab === 'indian-markets' && (
          <IndianMarketHub
            stocks={stocks}
            onOpenAlertModal={openAlertModalFor}
            onOpenPortfolioModal={openPortfolioModalFor}
          />
        )}

        {/* Tab 5: Portfolio Wealth Management */}
        {activeTab === 'portfolio' && (
          <PortfolioDashboard
            holdings={holdings}
            metals={metals}
            stocks={stocks}
            fx={fx}
            currency={currency}
            onOpenAddHolding={() => setHoldingModalOpen(true)}
            onDeleteHolding={handleDeleteHolding}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetDemo={handleResetDemo}
          />
        )}

        {/* Tab 6: Price Alerts */}
        {activeTab === 'alerts' && (
          <AlertsManager
            alerts={alerts}
            currency={currency}
            onOpenCreateAlert={() => setAlertModalOpen(true)}
            onToggleAlert={handleToggleAlert}
            onDeleteAlert={handleDeleteAlert}
            onRearmAlert={handleRearmAlert}
            onTestSoundAlert={handleTestAudio}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 px-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="text-slate-300 font-bold font-sans">BullionPulse</span> — Precious Metals, 24K/22K Purity & Indian Investment Suite.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>MCX / IBJA Benchmarked</span>
            <span>·</span>
            <span>RBI SGB Tax Compliant</span>
            <span>·</span>
            <span>BIS 916 / 999 Standard</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddHoldingModal
        isOpen={holdingModalOpen}
        onClose={() => setHoldingModalOpen(false)}
        onAddHolding={handleAddHolding}
        initialSymbol={holdingModalPreset.symbol}
        initialName={holdingModalPreset.name}
      />

      <AddAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        onAddAlert={handleAddAlert}
        initialSymbol={alertModalPreset.symbol}
        initialName={alertModalPreset.name}
        defaultCurrency={currency}
      />

      {/* Printable Tax Invoice Modal */}
      {activeInvoiceForPrint && (
        <PrintableInvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setActiveInvoiceForPrint(null);
          }}
          invoice={activeInvoiceForPrint}
          onSaveInvoice={handleSaveInvoice}
          isAlreadySaved={invoices.some((i) => i.id === activeInvoiceForPrint.id)}
        />
      )}

      {/* Saved Invoices Tracker Modal */}
      <SavedInvoicesTracker
        isOpen={isSavedInvoicesTrackerOpen}
        onClose={() => setIsSavedInvoicesTrackerOpen(false)}
        invoices={invoices}
        onSelectInvoiceToPrint={(inv) => {
          setActiveInvoiceForPrint(inv);
          setIsInvoiceModalOpen(true);
        }}
        onDeleteInvoice={handleDeleteInvoice}
        onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
      />

      {/* Floating Notification Toasts */}
      <NotificationToast
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
