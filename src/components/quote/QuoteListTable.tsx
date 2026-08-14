import React, { useState } from 'react';
import { QuoteService } from '../../services/QuoteService';
import { Quote, QuoteStatus } from '../../types';
import { formatZAR } from '../../utils/currency';
import { Search, Plus, Eye, Edit3, Trash2, FileText, Filter, ArrowUpDown } from 'lucide-react';

interface Props {
  onSelectQuote: (quote: Quote) => void;
  onCreateQuote: () => void;
  onEditQuote: (quote: Quote) => void;
}

export const QuoteListTable: React.FC<Props> = ({
  onSelectQuote,
  onCreateQuote,
  onEditQuote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const quotes = QuoteService.getAllQuotes();

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch =
      q.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this quote?')) {
      QuoteService.deleteQuote(id);
      window.location.reload();
    }
  };

  const getStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] uppercase font-bold rounded-full border border-green-500/20">
            Accepted
          </span>
        );
      case 'DRAFT':
        return (
          <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] uppercase font-bold rounded-full border border-amber-500/20">
            Draft
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] uppercase font-bold rounded-full border border-blue-500/20">
            Submitted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] uppercase font-bold rounded-full border border-rose-500/20">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-white/5 text-[#71717A] text-[10px] uppercase font-bold rounded-full border border-white/10">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-serif italic text-white tracking-tight">Quotations Directory</h1>
          <p className="text-xs text-[#71717A] mt-1">Manage and track customer quotes, versions, and approvals</p>
        </div>
        <button
          onClick={onCreateQuote}
          className="px-6 py-2.5 bg-[#F59E0B] text-black text-xs font-bold rounded-full hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0F0F0F] p-4 rounded-2xl border border-white/5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ref, customer, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#F59E0B] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#71717A]" />
          <span className="text-xs text-[#71717A] font-medium hidden md:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#050505] border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#71717A] font-semibold">
                  Ref Number
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#71717A] font-semibold">
                  Customer
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#71717A] font-semibold">
                  Latest Version
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#71717A] font-semibold">
                  Total (incl VAT)
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#71717A] font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#71717A] font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-[#71717A]">
                    No quotations matching criteria.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map(quote => {
                  const curVer = quote.versions.find(v => v.versionNumber === quote.currentVersionNumber) || quote.versions[0];
                  return (
                    <tr
                      key={quote.id}
                      onClick={() => onSelectQuote(quote)}
                      className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-[#F59E0B] text-xs font-semibold">
                        {quote.referenceNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-white">{quote.customerName}</div>
                        <div className="text-[10px] text-[#71717A]">{quote.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#A1A1AA]">
                        v{curVer?.versionNumber || quote.currentVersionNumber || 1}
                      </td>
                      <td className="px-6 py-4 font-medium text-white text-xs">
                        {formatZAR(curVer?.finalTotal || 0)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(quote.status)}
                      </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectQuote(quote)}
                          title="View Details"
                          className="p-1.5 text-[#71717A] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditQuote(quote)}
                          title="Edit Quote"
                          className="p-1.5 text-[#71717A] hover:text-[#F59E0B] hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => handleDelete(e, quote.id)}
                          title="Delete Quote"
                          className="p-1.5 text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
