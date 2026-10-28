import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  BadgeCheck,
  Scale,
  Sparkles
} from 'lucide-react';
import { SavedInvoice } from '../../types';

interface PrintableInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: SavedInvoice;
  onSaveInvoice?: (inv: SavedInvoice) => void;
  isAlreadySaved?: boolean;
}

// Convert numbers to Indian Rupees in words
function numberToWordsINR(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function numToWords(n: number): string {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit !== 0 ? ' ' + a[digit] : '');
  }

  const crore = Math.floor(rounded / 10000000);
  let rem = rounded % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  const hundred = Math.floor(rem / 100);
  const tens = rem % 100;

  let str = '';
  if (crore > 0) str += numToWords(crore) + ' Crore ';
  if (lakh > 0) str += numToWords(lakh) + ' Lakh ';
  if (thousand > 0) str += numToWords(thousand) + ' Thousand ';
  if (hundred > 0) str += numToWords(hundred) + ' Hundred ';
  if (tens > 0) str += (str !== '' ? 'and ' : '') + numToWords(tens) + ' ';

  return str.trim() + ' Rupees Only';
}

export const PrintableInvoiceModal: React.FC<PrintableInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSaveInvoice,
  isAlreadySaved = false,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Safe tax calculations
  const baseMetal = invoice.baseMetalCost;
  const makingCharges = invoice.makingChargesAmount;
  const isSilver = invoice.purity === 'SILVER_999';

  // Hallmarking fee breakdown (Govt gazette: ₹45 fee + 18% GST = ₹53.10)
  const hasHallmark = !isSilver && invoice.huidHallmarkFee > 0;
  const hallmarkBaseFee = hasHallmark ? 45.00 : 0;
  const hallmarkCgst = hasHallmark ? 4.05 : 0; // 9% CGST
  const hallmarkSgst = hasHallmark ? 4.05 : 0; // 9% SGST
  const hallmarkTotal = hasHallmark ? invoice.huidHallmarkFee : 0;

  // Metal GST @ 3% (1.5% CGST + 1.5% SGST)
  const metalCgst = Math.round(baseMetal * 0.015);
  const metalSgst = Math.round(baseMetal * 0.015);
  const metalTotalGst = metalCgst + metalSgst;

  // Making charges GST @ 3% (1.5% CGST + 1.5% SGST)
  const makingCgst = Math.round(makingCharges * 0.015);
  const makingSgst = Math.round(makingCharges * 0.015);
  const makingTotalGst = makingCgst + makingSgst;

  // Total jewellery GST (3%)
  const totalItemCgst = metalCgst + makingCgst;
  const totalItemSgst = metalSgst + makingSgst;
  const totalItemGst = totalItemCgst + totalItemSgst;

  // Subtotal taxable
  const taxableGoodsSubtotal = baseMetal + makingCharges;

  // Extract HUID if present
  const matchHuid = invoice.notes?.match(/HUID:\s*([A-Z0-9]+)/i) || invoice.itemDescription.match(/HUID:\s*([A-Z0-9]+)/i);
  const displayHuid = matchHuid ? matchHuid[1] : (isSilver ? 'N/A (Silver Bullion)' : 'MH9168');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      {/* Container */}
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full my-6 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50 rounded-t-2xl print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Official Jewellery Tax Invoice / Estimate
              </h3>
              <p className="text-[11px] text-slate-500">
                Invoice #{invoice.invoiceNumber} · Benchmark: IBJA {invoice.appliedCity}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSaveInvoice && !isAlreadySaved && (
              <button
                onClick={() => onSaveInvoice(invoice)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                Save Invoice
              </button>
            )}
            {isAlreadySaved && (
              <span className="text-xs text-emerald-700 flex items-center gap-1 font-semibold px-2">
                <CheckCircle2 className="w-4 h-4" /> Saved
              </span>
            )}

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Document Area */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-white text-slate-900 font-sans print:p-0 print:m-0 print:overflow-visible">
          <div ref={printRef} className="space-y-5 text-xs text-slate-800 leading-relaxed">
            {/* Header / Store Branding */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base shadow-xs">
                    BP
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-950 uppercase">
                      BullionPulse Assayers & Jewellers
                    </h1>
                    <span className="text-[10px] text-amber-800 font-bold tracking-wider uppercase">
                      Bureau of Indian Standards (BIS) Certified Hallmark Assaying Jeweller
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Corporate Office: Bullion Tower, Zaveri Bazaar, Mumbai 400002 · Email: compliance@bullionpulse.in
                </p>
                <p className="text-[11px] text-slate-600">
                  GSTIN: <span className="font-mono font-bold text-slate-900">27AAAAA0000A1Z5</span> · BIS License: <span className="font-mono font-bold text-slate-900">HM/C-991682</span> · Ph: +91 22 2840 5500
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold px-2.5 py-1 border border-slate-900 rounded uppercase bg-slate-100 inline-block mb-1 text-slate-950">
                  Tax Invoice / Jeweller Estimate
                </span>
                <div className="text-xs font-bold text-slate-950 font-mono">
                  Invoice #: {invoice.invoiceNumber}
                </div>
                <div className="text-[11px] text-slate-600">
                  Date of Invoice: <strong>{invoice.dateStr}</strong>
                </div>
                <div className="text-[11px] text-slate-600">
                  State Code: <strong>27 (Maharashtra)</strong>
                </div>
              </div>
            </div>

            {/* Bill To & Benchmark Meta */}
            <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded p-3 bg-slate-50/70">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Billed To / Customer Details
                </span>
                <div className="font-bold text-slate-950 text-sm">
                  {invoice.customerName || 'Valued Client'}
                </div>
                {invoice.customerPhone && (
                  <div className="text-[11px] text-slate-600 font-mono">
                    Contact: {invoice.customerPhone}
                  </div>
                )}
                <div className="text-[11px] text-slate-600">
                  Place of Supply: <strong>{invoice.appliedCity}, India</strong>
                </div>
                <div className="text-[11px] text-slate-600">
                  Reverse Charge Applicable: <strong>No</strong>
                </div>
              </div>

              <div className="border-l border-slate-300 pl-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Statutory Bullion Benchmark Applied
                </span>
                <div className="font-bold text-amber-800">
                  {invoice.sourceBenchmark} ({invoice.appliedCity})
                </div>
                <div className="text-[11px] text-slate-700 font-mono">
                  City Benchmark Rate: <strong>₹{invoice.ratePerGram.toLocaleString('en-IN')}/g</strong> ({invoice.purity})
                </div>
                <div className="text-[11px] text-slate-600">
                  Invoice Nature: <span className="font-bold uppercase text-slate-900">{invoice.status}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  BIS Unique ID: <span className="font-mono font-bold text-emerald-800">{displayHuid}</span>
                </div>
              </div>
            </div>

            {/* 1. Itemized Jewellery Goods Table */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-600" />
                  Itemized Jewellery Specification & Item-Level Costs
                </span>
                <span className="text-[10px] text-slate-500">
                  All monetary values in Indian Rupees (INR)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700 text-[11px]">
                      <th className="py-2 px-2.5 text-center w-8">#</th>
                      <th className="py-2 px-2.5">Item Description & HUID</th>
                      <th className="py-2 px-2 text-center">HSN</th>
                      <th className="py-2 px-2 text-center">Purity</th>
                      <th className="py-2 px-2 text-right">Net Wt</th>
                      <th className="py-2 px-2 text-right">IBJA Rate/g</th>
                      <th className="py-2 px-2.5 text-right">Metal Cost</th>
                      <th className="py-2 px-2.5 text-right">Making Charges</th>
                      <th className="py-2 px-2.5 text-right">Hallmark Fee</th>
                      <th className="py-2 px-2.5 text-right bg-amber-50/60">GST (3%)</th>
                      <th className="py-2 px-2.5 text-right bg-slate-200/80">Item Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-2.5 text-center font-sans">1</td>
                      <td className="py-2.5 px-2.5 font-sans font-medium text-slate-900">
                        <div className="font-bold text-xs">{invoice.itemDescription}</div>
                        <div className="text-[10px] text-slate-600 flex items-center gap-2 mt-0.5">
                          <span>BIS HUID: <strong className="font-mono text-emerald-800">{displayHuid}</strong></span>
                          <span>·</span>
                          <span>Making: <strong>{invoice.makingChargePct}%</strong></span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600">7113</td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-900">{invoice.purity}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-slate-900">{invoice.weightGrams}g</td>
                      <td className="py-2.5 px-2 text-right text-slate-700">₹{invoice.ratePerGram.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-2.5 text-right font-bold text-slate-900">
                        ₹{baseMetal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-2.5 text-right text-amber-900">
                        ₹{makingCharges.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-2.5 text-right text-slate-800">
                        {hasHallmark ? `₹${hallmarkTotal.toFixed(2)}` : '₹0.00'}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-semibold text-amber-900 bg-amber-50/60">
                        ₹{totalItemGst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-extrabold text-slate-950 bg-slate-100">
                        ₹{invoice.totalInvoiceAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. DEDICATED VISUAL STATUTORY TAX & HALLMARKING BREAKDOWN TABLE */}
            <div className="border border-slate-300 rounded overflow-hidden">
              <div className="bg-slate-100 px-3 py-2 border-b border-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-xs text-slate-950 uppercase tracking-wide">
                    Statutory Tax & Hallmarking Breakdown (GST 3% & BIS HUID Assaying)
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 uppercase">
                  CBIC GST & BIS Assaying Compliant
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-[10px] uppercase">
                      <th className="py-2 px-3">Taxable Component / Category</th>
                      <th className="py-2 px-2 text-center">HSN/SAC</th>
                      <th className="py-2 px-3 text-right">Taxable Value (₹)</th>
                      <th className="py-2 px-3 text-right">CGST (Central Tax)</th>
                      <th className="py-2 px-3 text-right">SGST (State Tax)</th>
                      <th className="py-2 px-3 text-right">Total Tax (₹)</th>
                      <th className="py-2 px-3 text-right">Total Gross (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-xs">
                    {/* Row 1: Precious Bullion (Metal) */}
                    <tr>
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">
                        1. Precious Bullion Metal Component ({invoice.purity} Gold/Silver)
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {invoice.weightGrams}g @ ₹{invoice.ratePerGram.toLocaleString('en-IN')}/g (IBJA {invoice.appliedCity} Benchmark)
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center text-slate-600">7113</td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900">
                        ₹{baseMetal.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        <span className="text-[10px] text-slate-500 mr-1">1.5%:</span>
                        ₹{metalCgst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        <span className="text-[10px] text-slate-500 mr-1">1.5%:</span>
                        ₹{metalSgst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-amber-800">
                        <span className="text-[10px] text-slate-500 mr-1">3.0%:</span>
                        ₹{metalTotalGst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-950">
                        ₹{(baseMetal + metalTotalGst).toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* Row 2: Making & Craftsmanship Charges */}
                    <tr>
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">
                        2. Artisan Making & Craftsmanship Charges
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {invoice.makingChargePct}% of metal value (Job-work goldsmithing & finishing)
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center text-slate-600">9988</td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900">
                        ₹{makingCharges.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        <span className="text-[10px] text-slate-500 mr-1">1.5%:</span>
                        ₹{makingCgst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        <span className="text-[10px] text-slate-500 mr-1">1.5%:</span>
                        ₹{makingSgst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-amber-800">
                        <span className="text-[10px] text-slate-500 mr-1">3.0%:</span>
                        ₹{makingTotalGst.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-950">
                        ₹{(makingCharges + makingTotalGst).toLocaleString('en-IN')}
                      </td>
                    </tr>

                    {/* Row 3: BIS Hallmarking & Laser HUID Assaying */}
                    <tr className="bg-amber-50/30">
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">
                        3. BIS Hallmarking & Laser HUID Assaying Charges
                        <span className="block text-[10px] text-emerald-800 font-normal">
                          Statutory Hallmarking Fee ₹45.00 + 18% GST (9% CGST ₹4.05 + 9% SGST ₹4.05) · HUID: {displayHuid}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center text-slate-600">9983</td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900">
                        ₹{hallmarkBaseFee.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        <span className="text-[10px] text-slate-500 mr-1">9.0%:</span>
                        ₹{hallmarkCgst.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        <span className="text-[10px] text-slate-500 mr-1">9.0%:</span>
                        ₹{hallmarkSgst.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-amber-800">
                        <span className="text-[10px] text-slate-500 mr-1">18.0%:</span>
                        ₹{(hallmarkCgst + hallmarkSgst).toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-950">
                        ₹{hallmarkTotal.toFixed(2)}
                      </td>
                    </tr>

                    {/* Total Consolidated Taxes & Statutory Charges */}
                    <tr className="bg-slate-100 font-bold text-slate-950 border-t-2 border-slate-300">
                      <td className="py-2.5 px-3 font-sans uppercase">
                        Total Statutory Taxes & Hallmarking Assaying
                      </td>
                      <td className="py-2.5 px-2 text-center">-</td>
                      <td className="py-2.5 px-3 text-right font-extrabold">
                        ₹{(taxableGoodsSubtotal + hallmarkBaseFee).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        ₹{(totalItemCgst + hallmarkCgst).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        ₹{(totalItemSgst + hallmarkSgst).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-900 font-extrabold">
                        ₹{(totalItemGst + (hallmarkCgst + hallmarkSgst)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-950 text-sm">
                        ₹{invoice.totalInvoiceAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Calculations Breakdown & Buyback Terms */}
            <div className="grid grid-cols-2 gap-5 pt-1">
              {/* Buyback & Hallmark Compliance */}
              <div className="space-y-3">
                <div className="border border-emerald-300 bg-emerald-50 rounded p-3 text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    Guaranteed Buyback & Scrap Realization Assurance
                  </span>
                  <div className="text-lg font-extrabold text-emerald-900 font-mono">
                    ₹{invoice.scrapResaleValue.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-emerald-800 mt-1 leading-normal">
                    100% net gold metal value guaranteed based on live IBJA {invoice.appliedCity} bullion benchmark rates upon buyback/resale. Making charges and statutory GST are non-refundable.
                  </p>
                </div>

                <div className="border border-slate-300 rounded p-2.5 bg-slate-50 text-[10px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    BIS Hallmark Mandate & Consumer Protection
                  </div>
                  <p>
                    Every gold jewelry item sold contains the triangular BIS stamp, 6-digit alphanumeric HUID ({displayHuid}), and purity grade. Verify authenticity on the <strong>BIS Care Mobile App</strong>.
                  </p>
                </div>
              </div>

              {/* Grand Total Summary Box */}
              <div className="bg-slate-50 rounded border border-slate-300 p-3.5 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Gross Metal Cost:</span>
                  <span className="font-semibold text-slate-950">₹{baseMetal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Making & Craftsmanship ({invoice.makingChargePct}%):</span>
                  <span className="font-semibold text-slate-950">₹{makingCharges.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>BIS Hallmarking & HUID Assaying:</span>
                  <span className="font-semibold text-slate-950">₹{hallmarkTotal.toFixed(2)}</span>
                </div>

                <div className="border-t border-slate-200 pt-1.5 space-y-1">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Central GST (CGST @ 1.5%):</span>
                    <span>+ ₹{totalItemCgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>State GST (SGST @ 1.5%):</span>
                    <span>+ ₹{totalItemSgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-1">
                    <span>Total GST on Jewellery (3.0%):</span>
                    <span className="text-amber-900">+ ₹{totalItemGst.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline border-t-2 border-slate-900 pt-2 text-sm">
                  <span className="font-bold text-slate-950 uppercase font-sans">
                    Total Invoice Amount:
                  </span>
                  <span className="text-xl font-black text-amber-950 font-mono">
                    ₹{invoice.totalInvoiceAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-[10px] text-slate-700 font-sans italic pt-1 border-t border-slate-200 leading-normal">
                  Amount in words: <strong className="text-slate-950">{numberToWordsINR(invoice.totalInvoiceAmount)}</strong>
                </div>
              </div>
            </div>

            {/* Signature & Declaration Block */}
            <div className="flex justify-between items-end pt-6 border-t border-slate-300 text-xs">
              <div className="text-slate-600 text-[10px] max-w-sm leading-relaxed">
                <span className="font-bold text-slate-800 block mb-0.5">Declaration:</span>
                We declare that this invoice shows actual price of the goods described and all particulars are true and correct. Subject to {invoice.appliedCity} jurisdiction.
                <div className="mt-4 text-slate-700">
                  Customer Signature: _______________________
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-950">For BullionPulse Assayers & Jewellers</div>
                <div className="h-10"></div>
                <div className="text-[11px] text-slate-600 border-t border-slate-400 pt-1 inline-block">
                  Authorized Signatory & Chief Assayer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
