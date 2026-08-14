import React, { useState, useEffect } from 'react';
import { Search, Lock, ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Quote, QuoteVersion } from '../../types';
import { QuoteRetrievalService } from '../../services/QuoteRetrievalService';
import { formatZAR } from '../../utils/currency';
import { SettingsService } from '../../services/SettingsService';
import { useTheme } from '../../context/ThemeContext';
import { ThemeSelector } from '../common/ThemeSelector';

interface Props {
  onBackToPortal: () => void;
  onExitToHome?: () => void;
}

export const PublicQuoteRetrieval: React.FC<Props> = ({ onBackToPortal, onExitToHome }) => {
  const settings = SettingsService.getSettings();
  const { setIsCustomerPortalActive } = useTheme();

  useEffect(() => {
    setIsCustomerPortalActive(true);
    return () => setIsCustomerPortalActive(false);
  }, [setIsCustomerPortalActive]);

  const [refInput, setRefInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [retrievedQuote, setRetrievedQuote] = useState<Quote | null>(null);
  const [retrievedVersion, setRetrievedVersion] = useState<QuoteVersion | null>(null);

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    setRetrievedQuote(null);
    setRetrievedVersion(null);

    try {
      const res = await QuoteRetrievalService.retrieveCustomerQuote(refInput, emailInput);
      if (res.success && res.quote && res.validVersion) {
        setRetrievedQuote(res.quote);
        setRetrievedVersion(res.validVersion);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Reference number or email address not recognized.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#D4D4D8] flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-white/5 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPortal}
              className="p-2 bg-[#0F0F0F] hover:bg-white/5 text-[#71717A] hover:text-white rounded-full transition-colors border border-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-serif italic text-white text-lg tracking-tight">{settings.companyName}</h1>
              <p className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest">
                Customer Quote Lookup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSelector />
            {onExitToHome && (
              <button
                onClick={onExitToHome}
                className="px-3.5 py-2 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold rounded-full border border-[#F59E0B]/30 transition-all flex items-center gap-1.5"
                title="Exit and return to Main Home page"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home / Exit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 space-y-6">
        
        {/* Lookup Card */}
        <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="p-3 bg-amber-500/10 text-[#F59E0B] rounded-full w-12 h-12 mx-auto flex items-center justify-center border border-amber-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif italic text-white">Retrieve Your Quotation</h2>
            <p className="text-xs text-[#71717A] max-w-md mx-auto">
              Enter your unique Quote Reference Number and the email address used when submitting your quote.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRetrieve} className="space-y-4 max-w-md mx-auto">
            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1.5 uppercase tracking-widest">
                Quote Reference Number *
              </label>
              <input
                type="text"
                required
                value={refInput}
                onChange={e => setRefInput(e.target.value)}
                placeholder="e.g. QS-8N3P7W"
                className="w-full px-3.5 py-2.5 bg-[#050505] border border-white/10 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1.5 uppercase tracking-widest">
                Customer Email Address *
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="thabo.mokoena@nedbank.co.za"
                className="w-full px-3.5 py-2.5 bg-[#050505] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold text-xs rounded-full shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'Verifying Credentials...' : 'Search & Retrieve Quote'}
            </button>
          </form>
        </div>

        {/* Retrieved Quote Result Display */}
        {retrievedQuote && retrievedVersion && (
          <div className="bg-[#0F0F0F] text-[#D4D4D8] rounded-2xl border border-white/5 shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-bold bg-amber-500/10 text-[#F59E0B] px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest">
                  Status: {retrievedQuote.status}
                </span>
                <h3 className="text-xl font-serif italic text-white mt-2">
                  Ref: {retrievedQuote.referenceNumber}
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Version {retrievedVersion.versionNumber} | Created {new Date(retrievedVersion.createdAt).toLocaleDateString('en-ZA')}
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-[#71717A]">Final Total</div>
                <div className="text-2xl font-light text-[#F59E0B]">{formatZAR(retrievedVersion.finalTotal)}</div>
              </div>
            </div>

            {/* Line items summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-widest text-[10px]">Items Included</h4>
              <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-[#050505]">
                {retrievedVersion.lineItems.map((item, i) => (
                  <div key={i} className="p-3.5 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-white">{item.productNameSnapshot}</div>
                      <div className="text-[#71717A] text-[11px]">Qty: {item.quantity} units</div>
                    </div>
                    <div className="font-bold text-white">{formatZAR(item.lineTotal)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#050505] rounded-xl border border-white/5 text-xs text-[#71717A] space-y-1">
              <div className="font-bold text-white uppercase tracking-widest text-[10px]">Quote Terms & Validity</div>
              <div>Valid until {new Date(retrievedQuote.expiresAt).toLocaleDateString('en-ZA')}</div>
              <p className="text-[11px] text-[#71717A] mt-1">{retrievedQuote.terms}</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
