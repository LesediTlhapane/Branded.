import React, { useState } from 'react';
import { Save, Shield, Clock, FileText, Building } from 'lucide-react';
import { SettingsService } from '../../services/SettingsService';
import { useNotification } from '../../context/NotificationContext';

export const SettingsManager: React.FC = () => {
  const { showToast } = useNotification();
  const [settings, setSettings] = useState(SettingsService.getSettings());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = SettingsService.updateSettings(settings);
    setSettings(updated);
    showToast('Business & Quote settings updated successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-serif italic text-white tracking-tight">Business Configuration</h1>
          <p className="text-xs text-[#71717A] mt-1">
            Company information, staff discount limits, quote validity periods, and standard terms.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold text-xs rounded-full shadow-lg shadow-amber-500/10 flex items-center gap-1.5 transition-all"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Company Info */}
        <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Building className="w-4 h-4 text-[#F59E0B]" />
            South African Entity Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">Company Legal Name</label>
              <input
                type="text"
                required
                value={settings.companyName}
                onChange={e => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">Company Phone</label>
              <input
                type="text"
                required
                value={settings.companyPhone}
                onChange={e => setSettings({ ...settings, companyPhone: e.target.value })}
                className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">VAT Registration Number</label>
              <input
                type="text"
                required
                value={settings.companyVatNumber}
                onChange={e => setSettings({ ...settings, companyVatNumber: e.target.value })}
                className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">Business Address</label>
              <input
                type="text"
                required
                value={settings.companyAddress}
                onChange={e => setSettings({ ...settings, companyAddress: e.target.value })}
                className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
          </div>
        </div>

        {/* Business Rules & Staff Ceiling */}
        <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#F59E0B]" />
            Financial Governance & Governance Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">
                Staff Manual Discount Ceiling (ZAR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-[#71717A]">R</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={settings.staffDiscountCeiling}
                  onChange={e => setSettings({ ...settings, staffDiscountCeiling: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>
              <p className="text-[11px] text-[#71717A] mt-1">
                Staff users cannot apply flat manual discounts exceeding this threshold per quote.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">
                Quote Validity Period (Days)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-[#71717A] absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={settings.quoteValidityDays}
                  onChange={e => setSettings({ ...settings, quoteValidityDays: parseInt(e.target.value) || 14 })}
                  className="w-full pl-9 pr-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>
              <p className="text-[11px] text-[#71717A] mt-1">
                Number of days before issued quotations automatically expire.
              </p>
            </div>
          </div>
        </div>

        {/* Terms & Conditions Block */}
        <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#F59E0B]" />
            Standard Terms & Conditions
          </h2>

          <div>
            <textarea
              rows={5}
              required
              value={settings.termsAndConditions}
              onChange={e => setSettings({ ...settings, termsAndConditions: e.target.value })}
              className="w-full p-3 bg-[#050505] border border-white/10 rounded-xl text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-[#F59E0B]"
            />
            <p className="text-[11px] text-[#71717A] mt-1">
              Appended to all generated HTML email quotations and public portal quotes.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
};
