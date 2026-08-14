import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  History,
  Mail,
  Edit,
  ArrowLeft,
} from 'lucide-react';
import { Quote, QuoteVersion } from '../../types';
import { SettingsService } from '../../services/SettingsService';
import { QuoteService } from '../../services/QuoteService';
import { EmailService } from '../../services/EmailService';
import { formatZAR } from '../../utils/currency';
import { useNotification } from '../../context/NotificationContext';
import { EmailPreviewModal } from '../common/EmailPreviewModal';

interface Props {
  quote: Quote;
  onBack: () => void;
  onEditNewVersion: (quote: Quote) => void;
}

export const QuoteDetailView: React.FC<Props> = ({ quote, onBack, onEditNewVersion }) => {
  const { showToast } = useNotification();
  const settings = SettingsService.getSettings();

  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(quote.currentVersionNumber);
  const [activeEmailLog, setActiveEmailLog] = useState<any | null>(null);

  const activeVersion =
    quote.versions.find(v => v.versionNumber === selectedVersionNum) ||
    quote.versions[quote.versions.length - 1];

  const handleUpdateStatus = (status: 'ACCEPTED' | 'REJECTED') => {
    const res = QuoteService.updateQuoteStatus(quote.id, status);
    if (res.success) {
      showToast(`Quote ${quote.referenceNumber} marked as ${status}.`, 'success');
    }
  };

  const handleViewSimulatedEmail = () => {
    const htmlContent = EmailService.generateQuoteHtml(quote, activeVersion, settings);
    setActiveEmailLog({
      id: `sim_${Math.random().toString(36).substring(2, 9)}`,
      quoteId: quote.id,
      referenceNumber: quote.referenceNumber,
      recipientEmail: quote.customerEmail,
      subject: `Official Quotation ${quote.referenceNumber} v${activeVersion.versionNumber} - ${settings.companyName}`,
      htmlContent,
      sentAt: activeVersion.createdAt,
      status: 'SENT',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-[#0F0F0F] hover:bg-white/5 text-[#71717A] hover:text-white rounded-full transition-colors border border-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-[#F59E0B]">
                Ref: {quote.referenceNumber}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  quote.status === 'ACCEPTED'
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : quote.status === 'SUBMITTED'
                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                    : quote.status === 'REJECTED'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}
              >
                {quote.status}
              </span>
            </div>
            <h1 className="text-2xl font-serif italic text-white mt-1">
              {quote.customerName} ({quote.customerCompany || 'Direct Client'})
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleViewSimulatedEmail}
            className="px-4 py-2 bg-[#0F0F0F] hover:bg-white/5 text-[#D4D4D8] text-xs font-semibold rounded-full transition-colors border border-white/10 flex items-center gap-1.5"
          >
            <Mail className="w-4 h-4 text-[#F59E0B]" />
            Inspect HTML Email
          </button>

          {quote.status !== 'ACCEPTED' && (
            <button
              onClick={() => handleUpdateStatus('ACCEPTED')}
              className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Mark Accepted
            </button>
          )}

          {quote.status !== 'REJECTED' && (
            <button
              onClick={() => handleUpdateStatus('REJECTED')}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              Mark Rejected
            </button>
          )}

          <button
            onClick={() => onEditNewVersion(quote)}
            className="px-6 py-2 bg-[#F59E0B] hover:bg-amber-400 text-black text-xs font-bold rounded-full transition-all shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            Edit New Version
          </button>
        </div>
      </div>

      {/* VERSION TIMELINE INSPECTOR BAR */}
      <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#D4D4D8]">
          <History className="w-4 h-4 text-[#F59E0B]" />
          <span className="font-bold">Quote Version History:</span>
        </div>

        <div className="flex items-center gap-2">
          {quote.versions.map(v => (
            <button
              key={v.versionNumber}
              onClick={() => setSelectedVersionNum(v.versionNumber)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                selectedVersionNum === v.versionNumber
                  ? 'bg-[#F59E0B] text-black border-[#F59E0B]'
                  : 'bg-[#050505] text-[#71717A] border-white/5 hover:text-white'
              }`}
            >
              v{v.versionNumber} {v.versionNumber === quote.currentVersionNumber ? '(Valid)' : `(${v.status})`}
            </button>
          ))}
        </div>
      </div>

      {/* DOCUMENT VIEW */}
      <div className="bg-[#0F0F0F] text-[#D4D4D8] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        
        {/* Header Block */}
        <div className="bg-[#0A0A0A] p-8 border-b border-white/5 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h2 className="text-2xl font-serif italic text-white tracking-tight">{settings.companyName}</h2>
            <p className="text-xs text-[#71717A] mt-1 max-w-md">{settings.companyAddress}</p>
            <p className="text-xs text-[#71717A] mt-0.5">Phone: {settings.companyPhone} | VAT: {settings.companyVatNumber}</p>
          </div>

          <div className="text-left md:text-right">
            <span className="inline-block px-3 py-1 bg-[#F59E0B] text-black text-xs font-bold rounded-full">
              OFFICIAL QUOTATION
            </span>
            <div className="text-lg font-mono text-[#F59E0B] mt-2">Ref: {quote.referenceNumber}</div>
            <div className="text-xs text-[#71717A]">Version {activeVersion.versionNumber} ({activeVersion.status})</div>
          </div>
        </div>

        {/* Customer & Quote Details Subheader */}
        <div className="bg-[#050505] p-6 border-b border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <div className="font-bold uppercase tracking-widest text-[#71717A] mb-1 text-[10px]">PREPARED FOR</div>
            <div className="text-base font-bold text-white">{quote.customerName}</div>
            {quote.customerCompany && <div className="font-medium text-[#A1A1AA]">{quote.customerCompany}</div>}
            <div className="text-[#F59E0B] font-semibold mt-0.5">{quote.customerEmail}</div>
            {quote.customerPhone && <div className="text-[#71717A]">{quote.customerPhone}</div>}
          </div>

          <div className="md:text-right space-y-1">
            <div>
              <span className="text-[#71717A]">Quote Date:</span>{' '}
              <strong className="text-white">
                {new Date(activeVersion.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </strong>
            </div>
            <div>
              <span className="text-[#71717A]">Validity Period:</span>{' '}
              <strong className="text-amber-500">
                {new Date(quote.expiresAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })} ({quote.validityDays} days)
              </strong>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="p-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#71717A] font-semibold uppercase tracking-widest text-[10px]">
                <th className="py-3 px-2">Product & Specification</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Unit Price</th>
                <th className="py-3 px-2 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activeVersion.lineItems.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-4 px-2">
                    <div className="font-bold text-white text-sm">{item.productNameSnapshot}</div>
                    <div className="text-[#71717A] text-[11px] font-mono">SKU: {item.productSkuSnapshot}</div>
                    {item.selectedVariants.length > 0 && (
                      <div className="text-[#A1A1AA] mt-1 text-[11px]">
                        {item.selectedVariants.map(v => `${v.variantTypeName}: ${v.variantValueName}`).join(' | ')}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-2 text-center font-bold text-white">{item.quantity}</td>
                  <td className="py-4 px-2 text-right text-[#A1A1AA]">{formatZAR(item.effectiveUnitPrice)}</td>
                  <td className="py-4 px-2 text-right font-medium text-white text-sm">
                    {formatZAR(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Totals Summary Block */}
          <div className="mt-6 border-t border-white/5 pt-4 flex flex-col md:flex-row justify-between gap-6">
            <div className="max-w-md text-xs text-[#71717A]">
              {activeVersion.notes && (
                <div className="bg-[#050505] p-3 rounded-xl border border-white/5 mb-2">
                  <strong className="text-white">Notes:</strong> {activeVersion.notes}
                </div>
              )}
            </div>

            <div className="w-full md:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-[#71717A]">
                <span>Subtotal:</span>
                <strong className="text-white">{formatZAR(activeVersion.subtotal)}</strong>
              </div>

              {activeVersion.totalVolumeDiscountAmount > 0 && (
                <div className="flex justify-between text-green-500 font-semibold">
                  <span>Volume Savings:</span>
                  <span>-{formatZAR(activeVersion.totalVolumeDiscountAmount)}</span>
                </div>
              )}

              {activeVersion.manualDiscountAmount > 0 && (
                <div className="flex justify-between text-[#F59E0B] font-semibold">
                  <span>Special Discount:</span>
                  <span>-{formatZAR(activeVersion.manualDiscountAmount)}</span>
                </div>
              )}

              <div className="border-t border-white/5 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Final Total:</span>
                <span className="text-xl font-light text-[#F59E0B]">
                  {formatZAR(activeVersion.finalTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mt-8 p-4 bg-[#050505] rounded-xl border border-white/5 text-xs">
            <div className="font-bold text-white uppercase tracking-widest text-[10px] mb-1">Terms & Conditions</div>
            <div className="text-[#71717A] whitespace-pre-line leading-relaxed">{quote.terms}</div>
          </div>
        </div>

      </div>

      {/* Email Inspector Modal */}
      <EmailPreviewModal emailLog={activeEmailLog} onClose={() => setActiveEmailLog(null)} />
    </div>
  );
};
