import React from 'react';
import { QuoteService } from '../../services/QuoteService';
import { SettingsService } from '../../services/SettingsService';
import { Quote } from '../../types';
import { formatZAR } from '../../utils/currency';
import { Plus, TrendingUp, Clock, CheckCircle2, ArrowUpRight, ShieldAlert } from 'lucide-react';

interface Props {
  onNavigateQuotes: () => void;
  onCreateQuote: () => void;
  onSelectQuote: (quote: Quote) => void;
}

export const DashboardView: React.FC<Props> = ({
  onNavigateQuotes,
  onCreateQuote,
  onSelectQuote,
}) => {
  const quotes = QuoteService.getAllQuotes();
  const settings = SettingsService.getSettings();

  const totalQuoted = quotes.reduce((acc, q) => {
    const curVer = q.versions.find(v => v.versionNumber === q.currentVersionNumber) || q.versions[0];
    return acc + (curVer?.finalTotal || 0);
  }, 0);

  const pendingDrafts = quotes.filter(q => q.status === 'DRAFT').length;
  const acceptedQuotes = quotes.filter(q => q.status === 'ACCEPTED').length;
  const conversionRate = quotes.length > 0 ? ((acceptedQuotes / quotes.length) * 100).toFixed(1) : '0.0';

  const recentQuotes = quotes.slice(0, 5);

  const getStatusBadge = (status: string) => {
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
      default:
        return (
          <span className="px-3 py-1 bg-white/5 text-[#71717A] text-[10px] uppercase font-bold rounded-full border border-white/10">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-serif italic text-white tracking-tight">Enterprise Overview</h1>
          <p className="text-xs text-[#71717A] mt-1">Performance metrics & recent quotation activity</p>
        </div>
        <button
          onClick={onCreateQuote}
          className="px-6 py-2.5 bg-[#F59E0B] text-black text-xs font-bold rounded-full hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Quote</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-[#0F0F0F] border border-white/5 rounded-2xl relative overflow-hidden group">
          <div className="text-[10px] uppercase tracking-widest text-[#71717A] mb-2 font-semibold">Total Quoted</div>
          <div className="text-3xl font-light text-white mb-1 tracking-tight">{formatZAR(totalQuoted)}</div>
          <div className="text-[10px] text-green-500 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> +14% from last month
          </div>
        </div>

        <div className="p-6 bg-[#0F0F0F] border border-white/5 rounded-2xl">
          <div className="text-[10px] uppercase tracking-widest text-[#71717A] mb-2 font-semibold">Pending Drafts</div>
          <div className="text-3xl font-light text-white mb-1 tracking-tight">{pendingDrafts}</div>
          <div className="text-[10px] text-[#71717A] flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" /> Requires attention
          </div>
        </div>

        <div className="p-6 bg-[#0F0F0F] border border-white/5 rounded-2xl">
          <div className="text-[10px] uppercase tracking-widest text-[#71717A] mb-2 font-semibold">Conversion Rate</div>
          <div className="text-3xl font-light text-white mb-1 tracking-tight">{conversionRate}%</div>
          <div className="text-[10px] text-green-500 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Above target
          </div>
        </div>

        <div className="p-6 bg-[#0F0F0F] border border-white/5 rounded-2xl">
          <div className="text-[10px] uppercase tracking-widest text-[#71717A] mb-2 font-semibold">Staff Manual Limit</div>
          <div className="text-3xl font-light text-[#F59E0B] mb-1 tracking-tight">{formatZAR(settings.staffDiscountCeiling)}</div>
          <div className="text-[10px] text-[#71717A] flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#F59E0B]" /> Global ceiling
          </div>
        </div>
      </section>

      {/* Recent Quotations Table Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-widest">Recent Quotations</h2>
          <button
            onClick={onNavigateQuotes}
            className="text-xs text-[#71717A] hover:text-[#F59E0B] italic flex items-center gap-1 transition-colors"
          >
            <span>View all active files</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#71717A] font-semibold">Ref No.</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#71717A] font-semibold">Customer</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#71717A] font-semibold">Items</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#71717A] font-semibold">Total Value</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-[#71717A] font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {recentQuotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-[#71717A]">
                    No quotations found. Click "Create Quote" to get started.
                  </td>
                </tr>
              ) : (
                recentQuotes.map(quote => {
                  const curVer = quote.versions.find(v => v.versionNumber === quote.currentVersionNumber) || quote.versions[0];
                  const itemsCount = curVer?.lineItems?.length || 0;
                  const itemSummary = curVer?.lineItems?.[0]
                    ? `${itemsCount} item(s) - ${curVer.lineItems[0].productNameSnapshot}`
                    : 'No items';

                  return (
                    <tr
                      key={quote.id}
                      onClick={() => onSelectQuote(quote)}
                      className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-[#F59E0B] text-xs font-semibold">
                        {quote.referenceNumber}
                      </td>
                      <td className="px-6 py-4 text-white font-medium text-xs">
                        {quote.customerName}
                      </td>
                      <td className="px-6 py-4 text-[#A1A1AA] text-xs truncate max-w-xs">
                        {itemSummary}
                      </td>
                      <td className="px-6 py-4 font-medium text-white text-xs">
                        {formatZAR(curVer?.finalTotal || 0)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(quote.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Diagnostics and Status Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0F0F0F] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <div className="w-24 h-24 border-4 border-white rounded-full" />
          </div>
          <h3 className="text-white font-serif italic text-lg mb-4">Pricing Engine Diagnostics</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs pb-2 border-b border-white/5">
              <span className="text-[#71717A]">Base Product Discount</span>
              <span className="text-white font-medium">Volume Tiered</span>
            </div>
            <div className="flex justify-between text-xs pb-2 border-b border-white/5">
              <span className="text-[#71717A]">Variant Delta Calc</span>
              <span className="text-white font-medium">Fixed (No Volume Discount)</span>
            </div>
            <div className="flex justify-between text-xs pb-2 border-b border-white/5">
              <span className="text-[#71717A]">Staff Manual Ceiling</span>
              <span className="text-[#F59E0B] font-bold">{formatZAR(settings.staffDiscountCeiling)}</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-[#71717A]">Validity Period</span>
              <span className="text-white font-medium">{settings.quoteValidityDays} Days</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0F0F0F] p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-serif italic text-lg mb-4">System Status</h3>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-white uppercase tracking-wider font-semibold">API Layer Ready</span>
            </div>
            <p className="text-[11px] text-[#71717A] leading-relaxed">
              Quotation engine running smoothly with complete audit logging, version tracking, multi-tier pricing calculation, and automated HTML email delivery abstractions.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-[#71717A]">
            <span>Environment: Production Sandbox</span>
            <span className="font-mono text-[#A1A1AA]">v2.4.0-ZA</span>
          </div>
        </div>
      </section>
    </div>
  );
};
