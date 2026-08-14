import React from 'react';
import { Mail, X, CheckCircle, Copy } from 'lucide-react';
import { EmailLog } from '../../types';
import { useNotification } from '../../context/NotificationContext';

interface Props {
  emailLog: EmailLog | null;
  onClose: () => void;
}

export const EmailPreviewModal: React.FC<Props> = ({ emailLog, onClose }) => {
  const { showToast } = useNotification();

  if (!emailLog) return null;

  const copyHtml = () => {
    navigator.clipboard.writeText(emailLog.htmlContent);
    showToast('HTML Email code copied to clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A0A0A]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Simulated Email Delivery
                </span>
                <span className="text-xs text-[#71717A]">Ref: {emailLog.referenceNumber}</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">{emailLog.subject}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyHtml}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[#D4D4D8] text-xs font-medium rounded-full flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy HTML
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#71717A] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Email Details Bar */}
        <div className="px-6 py-2.5 bg-[#050505] border-b border-white/5 flex items-center justify-between text-xs text-[#71717A]">
          <div>
            <span className="text-[#71717A]">To:</span> <strong className="text-white">{emailLog.recipientEmail}</strong>
          </div>
          <div>
            <span className="text-[#71717A]">Sent At:</span> {new Date(emailLog.sentAt).toLocaleString('en-ZA')}
          </div>
        </div>

        {/* HTML Email Preview Frame */}
        <div className="flex-1 bg-[#050505] p-4 overflow-auto">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden min-h-full">
            <iframe
              srcDoc={emailLog.htmlContent}
              title="Quote HTML Email Preview"
              className="w-full h-full min-h-[600px] border-0"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
