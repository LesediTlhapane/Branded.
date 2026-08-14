import React, { useState, useEffect } from 'react';
import {
  Shield,
  UserCheck,
  ShoppingBag,
  ArrowRight,
  Search,
  CheckCircle2,
  Lock,
  X,
  Info,
  Sparkles,
} from 'lucide-react';
import { ThemeSelector } from '../common/ThemeSelector';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface PortalHomeProps {
  onLaunchCustomerPortal: () => void;
  onLaunchQuoteRetrieval: () => void;
}

const CURRENCY_SYMBOLS = ['R', '$', '%', '+', '='];

export const PortalHome: React.FC<PortalHomeProps> = ({
  onLaunchCustomerPortal,
  onLaunchQuoteRetrieval,
}) => {
  const { login } = useAuth();
  const { showToast } = useNotification();

  // Modal Visibility States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [selectedRoleTab, setSelectedRoleTab] = useState<'ADMIN' | 'STAFF' | 'CUSTOMER'>('ADMIN');

  // Login Form
  const [emailInput, setEmailInput] = useState('admin@brandedsolutions.co.za');
  const [passwordInput, setPasswordInput] = useState('Admin123!');
  const [loginError, setLoginError] = useState('');

  // Random Symbol Cycling
  const [currentSymbolIndex, setCurrentSymbolIndex] = useState(0);

  // Symbol randomizing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSymbolIndex((prev) => (prev + 1) % CURRENCY_SYMBOLS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleSelectRole = (role: 'ADMIN' | 'STAFF' | 'CUSTOMER') => {
    setSelectedRoleTab(role);
    setLoginError('');
    if (role === 'ADMIN') {
      setEmailInput('admin@brandedsolutions.co.za');
      setPasswordInput('Admin123!');
    } else if (role === 'STAFF') {
      setEmailInput('staff@brandedsolutions.co.za');
      setPasswordInput('Staff123!');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = login(emailInput, passwordInput);
    if (!res.success) {
      setLoginError(res.message || 'Invalid email or password. Please try again.');
    } else {
      showToast('Authentication successful. Welcome back!', 'success');
      setIsLoginModalOpen(false);
    }
  };

  return (
    <div className="bg-[#050505] text-[#D4D4D8] font-sans relative overflow-x-hidden min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      
      {/* 1. LOW-OPACITY AESTHETIC SHOWROOM BACKGROUND IMAGE */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1600&auto=format&fit=crop&q=80"
          alt="Aesthetic Showroom Background"
          className="w-full h-full object-cover opacity-20 filter saturate-110 brightness-90 contrast-105"
        />
        {/* Soft Dark Gradient Overlays for High Contrast Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-[#050505]" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/90" />
      </div>

      {/* HEADER NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 sm:px-12 py-5 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-md flex items-center justify-between border-b border-white/10">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-black font-serif font-black flex items-center justify-center text-xl tracking-tighter shadow-lg shadow-amber-500/20">
            B.
          </div>
          <div>
            <div className="text-white text-force-white font-extrabold text-base tracking-tight font-mono">
              BRANDED.
            </div>
            <div className="text-[9px] text-white text-force-white font-mono tracking-widest uppercase font-black">
              QUOTE MANAGEMENT
            </div>
          </div>
        </div>

        {/* HEADER NAVIGATION LINKS */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={() => setIsAboutModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#1F1F23] hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs transition-all tracking-wider uppercase shadow-md hover:shadow-white/10"
          >
            ABOUT
          </button>

          <button
            type="button"
            onClick={onLaunchCustomerPortal}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#F59E0B] hover:bg-amber-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-amber-500/25 transform hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Public Quote Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="px-5 py-2 bg-white hover:bg-amber-300 text-black font-black text-xs rounded-full shadow-lg shadow-white/20 transition-all transform hover:scale-105 uppercase tracking-wider flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>LOGIN</span>
          </button>

          <div className="hidden lg:block">
            <ThemeSelector />
          </div>
        </div>
      </header>

      {/* SINGLE COVER PAGE MAIN CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-12 pt-32 pb-12 max-w-6xl mx-auto w-full">
        <div className="space-y-8 my-auto py-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-[#F59E0B] text-xs font-mono text-[#F59E0B] font-bold backdrop-blur-md shadow-md shadow-amber-500/10">
            <Sparkles className="w-4 h-4" /> Enterprise B2B Quotation System
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-black text-white text-force-white tracking-tight leading-[1.08]">
            Turn branded product requests into <span className="text-[#F59E0B] drop-shadow-[0_0_25px_rgba(245,158,11,0.3)]">professional quotations.</span>
          </h1>

          <p className="text-base sm:text-lg text-white text-force-white hero-quote-text font-sans font-medium leading-relaxed max-w-3xl drop-shadow-md">
            Create, manage and deliver professional quotations for branded products — all from one place. Branded. Quote Management simplifies pricing, quantities, variants and quote delivery in one intelligent workflow.
          </p>

          {/* HIGH CONTRAST CTAs WITH GLOW */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="px-8 py-4 bg-[#F59E0B] hover:bg-amber-400 text-black font-black text-xs sm:text-sm rounded-full shadow-2xl shadow-amber-500/35 transition-all uppercase tracking-widest flex items-center gap-3 transform hover:scale-105"
            >
              <span>ACCESS PLATFORM / LOGIN</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            <button
              type="button"
              onClick={onLaunchCustomerPortal}
              className="px-7 py-4 bg-white hover:bg-amber-300 text-black font-extrabold text-xs sm:text-sm rounded-full shadow-2xl shadow-white/20 transition-all flex items-center gap-2.5 transform hover:scale-105"
            >
              <Search className="w-4 h-4 text-black stroke-[3]" />
              <span>Launch Instant Quote Portal</span>
            </button>
          </div>

        </div>

        {/* SYSTEM STATUS BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 mt-8 border-t border-white/15">
          <div className="space-y-1">
            <div className="text-[11px] font-mono font-bold text-[#F59E0B] uppercase tracking-widest flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_#F59E0B]" />
              SYSTEM STATUS: ONLINE & READY
            </div>
            <div className="text-xs text-white text-force-white font-extrabold drop-shadow">
              Products • Customisation • Quantity • Pricing • Quote • Customer
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#0A0A0C] border border-white/20 px-5 py-3 rounded-2xl backdrop-blur-md shadow-2xl">
            <div className="w-9 h-9 rounded-full bg-[#F59E0B] text-black font-mono font-black flex items-center justify-center text-xl shadow-md shadow-amber-500/30">
              {CURRENCY_SYMBOLS[currentSymbolIndex]}
            </div>
            <div className="text-left font-mono">
              <div className="text-[10px] text-white text-force-white font-extrabold uppercase tracking-wider">
                QUOTE MANAGEMENT
              </div>
              <div className="text-xs font-black text-white text-force-white tracking-widest">
                BRANDED.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/15 bg-black/90 backdrop-blur-md py-6 px-6 sm:px-12 text-center text-xs text-white text-force-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono text-white text-force-white font-extrabold">
            BRANDED. (R) 2026
          </div>
          <div className="text-white text-force-white font-extrabold">
            Branded Solutions South Africa (Pty) Ltd • Enterprise Promotional Quotations
          </div>
          <div className="flex items-center gap-4 text-xs font-mono font-extrabold text-white text-force-white">
            <button onClick={() => setIsAboutModalOpen(true)} className="text-white text-force-white hover:text-[#F59E0B] transition-colors">
              ABOUT
            </button>
            <span className="text-white text-force-white">•</span>
            <span className="text-white text-force-white hover:text-[#F59E0B] transition-colors cursor-pointer">PRIVACY</span>
          </div>
        </div>
      </footer>

      {/* --- LOGIN MODAL INTERFACE --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#121214] border border-white/20 rounded-3xl max-w-md w-full p-7 shadow-2xl shadow-amber-500/10 space-y-6 relative text-left">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-5 right-5 text-white hover:text-[#F59E0B] p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-white text-force-white font-extrabold uppercase tracking-widest">
                <Lock className="w-4 h-4 text-white text-force-white" /> SECURE AUTHENTICATION
              </div>
              <h3 className="text-2xl font-extrabold text-white text-force-white">Sign In to Branded.</h3>
              <p className="text-xs text-white text-force-white font-medium">
                Select your role or enter your credentials to access the quotation console.
              </p>
            </div>

            {/* Quick Role Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#050507] p-1.5 rounded-2xl border border-white/20">
              <button
                type="button"
                onClick={() => handleSelectRole('ADMIN')}
                className={`py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  selectedRoleTab === 'ADMIN'
                    ? 'bg-[#F59E0B] text-black shadow-lg shadow-amber-500/30'
                    : 'bg-[#1C1C20] text-white text-force-white hover:bg-white/20 border border-white/10'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('STAFF')}
                className={`py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  selectedRoleTab === 'STAFF'
                    ? 'bg-blue-500 text-white text-force-white shadow-lg shadow-blue-500/30'
                    : 'bg-[#1C1C20] text-white text-force-white hover:bg-white/20 border border-white/10'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Sales Staff</span>
              </button>
            </div>

            {/* Demo Credentials Box */}
            <div className="p-3.5 bg-[#08080A] rounded-2xl border border-white/20 text-xs space-y-1 font-mono">
              <div className="text-[10px] font-bold text-white text-force-white uppercase tracking-wider flex items-center justify-between">
                <span>Demo Account ({selectedRoleTab})</span>
                <span className="text-white text-force-white font-bold">Auto-Filled</span>
              </div>
              <div className="text-white text-force-white font-bold">{emailInput}</div>
              <div className="text-white text-force-white text-[11px] font-bold">Pass: {passwordInput}</div>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-white text-force-white text-xs font-bold rounded-xl text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white text-force-white mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-3 bg-[#08080A] border border-white/30 rounded-xl text-xs text-white text-force-white focus:outline-none focus:border-[#F59E0B] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white text-force-white mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 bg-[#08080A] border border-white/30 rounded-xl text-xs text-white text-force-white focus:outline-none focus:border-[#F59E0B] font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#F59E0B] hover:bg-amber-400 text-black font-black text-xs rounded-full shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>Log In to Dashboard</span>
              </button>
            </form>

            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  onLaunchCustomerPortal();
                }}
                className="w-full py-3 bg-white text-black hover:bg-amber-300 font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Switch to Customer Instant Quote Portal</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ABOUT MODAL --- */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#121214] border border-white/20 rounded-3xl max-w-lg w-full p-7 shadow-2xl space-y-6 relative text-left">
            <button
              onClick={() => setIsAboutModalOpen(false)}
              className="absolute top-5 right-5 text-white hover:text-[#F59E0B] p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="text-xs font-mono text-white text-force-white font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Info className="w-4 h-4 text-white text-force-white" /> ABOUT BRANDED. QUOTE MANAGEMENT
              </div>
              <h3 className="text-2xl font-sans font-extrabold text-white text-force-white">
                Enterprise Promotional Quotations Platform
              </h3>
            </div>

            <div className="space-y-4 text-xs text-white text-force-white leading-relaxed">
              <p className="text-white text-force-white">
                <strong>Branded. Quote Management</strong> is a high-performance B2B system designed specifically for promotional product suppliers and brand merchandise distributors in South Africa.
              </p>

              <div className="space-y-3 pt-3 border-t border-white/10 text-white text-force-white">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5 stroke-[3]" />
                  <span><strong>Multi-Tier Volume Pricing:</strong> Automated quantity discount matrices for base products with custom options.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5 stroke-[3]" />
                  <span><strong>Staff Override Limits:</strong> Configurable discount ceilings (e.g., R500 max manual staff discount).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5 stroke-[3]" />
                  <span><strong>Instant ZAR & VAT Calculations:</strong> Standard 15% South African VAT calculation and formatted PDF/HTML email quote delivery.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsAboutModalOpen(false)}
                className="px-6 py-2.5 bg-white text-black font-extrabold text-xs rounded-full hover:bg-amber-300 transition-colors shadow-lg"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
