import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Printer, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Download, 
  ExternalLink,
  MapPin,
  X
} from 'lucide-react';
import { SavedInvoice } from '../../types';

interface SavedInvoicesTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: SavedInvoice[];
  onSelectInvoiceToPrint: (inv: SavedInvoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateInvoiceStatus: (id: string, status: 'ESTIMATE' | 'PURCHASED' | 'PAID') => void;
}

export const SavedInvoicesTracker: React.FC<SavedInvoicesTrackerProps> = ({
  isOpen,
  onClose,
  invoices,
  onSelectInvoiceToPrint,
  onDeleteInvoice,
  onUpdateInvoiceStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filteredInvoices = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.customerName.toLowerCase().includes(term) ||
      inv.itemDescription.toLowerCase().includes(term) ||
      inv.appliedCity.toLowerCase().includes(term)
    );
  });

  const totalBilledINR = invoices.reduce((acc, curr) => acc + curr.totalInvoiceAmount, 0);
  const totalWeightGrams = invoices.reduce((acc, curr) => acc + curr.weightGrams, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Saved Jeweller Invoices & Quotations
              </h2>
              <p className="text-xs text-slate-500">
                Track historical purchases, customer bills, and IBJA city rates applied.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 font-medium block">Total Saved Invoices</span>
            <span className="text-xl font-bold text-slate-900 font-mono">{invoices.length}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 font-medium block">Total Invoiced Amount</span>
            <span className="text-xl font-bold text-amber-800 font-mono">
              ₹{totalBilledINR.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 font-medium block">Total Bullion Weight</span>
            <span className="text-xl font-bold text-slate-800 font-mono">
              {totalWeightGrams.toFixed(1)}g
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice number, customer name, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 shadow-xs"
          />
        </div>

        {/* Invoice List Table */}
        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
          {filteredInvoices.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-slate-600">No saved invoices found</p>
              <p>Generate and save invoices from the Jewellery Catalogue or Purity Estimator.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-sans">
                  <th className="py-2.5 px-3">Invoice # / Date</th>
                  <th className="py-2.5 px-3">Customer & Item</th>
                  <th className="py-2.5 px-3">Purity & Wt</th>
                  <th className="py-2.5 px-3">City Benchmark</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    {/* Invoice # */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-amber-800">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-500">{inv.dateStr}</div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3">
                      <div className="font-sans font-bold text-slate-900 text-xs">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{inv.itemDescription}</div>
                    </td>

                    {/* Purity & Weight */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900">{inv.purity}</span>
                      <span className="text-slate-500 block text-[11px]">{inv.weightGrams}g</span>
                    </td>

                    {/* City */}
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1 text-slate-700 font-sans">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        {inv.appliedCity}
                      </span>
                      <span className="text-[10px] text-slate-400 block">₹{inv.ratePerGram}/g</span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right font-bold text-slate-900 text-sm tabular-nums">
                      ₹{inv.totalInvoiceAmount.toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <select
                        value={inv.status}
                        onChange={(e) =>
                          onUpdateInvoiceStatus(
                            inv.id,
                            e.target.value as 'ESTIMATE' | 'PURCHASED' | 'PAID'
                          )
                        }
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-sans border focus:outline-none cursor-pointer ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : inv.status === 'PURCHASED'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="ESTIMATE">ESTIMATE</option>
                        <option value="PURCHASED">PURCHASED</option>
                        <option value="PAID">PAID</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-sans">
                        <button
                          onClick={() => onSelectInvoiceToPrint(inv)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer border border-amber-200 shadow-2xs"
                          title="Print or view invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete invoice record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
