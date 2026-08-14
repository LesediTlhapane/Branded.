import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  UserCheck,
  ShoppingBag,
  ArrowRight,
  Search,
  Building2,
  User,
  KeyRound,
  CheckCircle2,
  Lock,
  X,
  Info,
  ChevronRight,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Calculator,
  FileCheck,
} from 'lucide-react';
import { ThemeSelector } from '../common/ThemeSelector';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface PortalHomeProps {
  onLaunchCustomerPortal: () => void;
  onLaunchQuoteRetrieval: () => void;
}

// 10 High Quality Branded Product Imagery URLs
const GALLERY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&auto=format&fit=crop&q=80',
    title: 'Custom Cotton T-Shirt 160g',
    category: 'Apparel & Clothing',
    sku: 'TSH-160',
  },
  {
    url: 'https://images.unsplash.com/photo-1625910513413-41315e98585e?w=1000&auto=format&fit=crop&q=80',
    title: 'Executive Pique Polo Shirt',
    category: 'Corporate Apparel',
    sku: 'POLO-220',
  },
  {
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1000&auto=format&fit=crop&q=80',
    title: 'Heavyweight Fleece Hoodie 300g',
    category: 'Outerwear',
    sku: 'HOD-300',
  },
  {
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=1000&auto=format&fit=crop&q=80',
    title: 'Softshell All-Weather Jacket',
    category: 'Executive Outerwear',
    sku: 'JCK-SOFT',
  },
  {
    url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1000&auto=format&fit=crop&q=80',
    title: 'Vacuum Thermal Flask 750ml',
    category: 'Drinkware',
    sku: 'BOT-750',
  },
  {
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1000&auto=format&fit=crop&q=80',
    title: 'Ceramic Promotional Mug 330ml',
    category: 'Drinkware',
    sku: 'MUG-330',
  },
  {
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1000&auto=format&fit=crop&q=80',
    title: 'Executive Laptop Backpack 15.6"',
    category: 'Bags & Accessories',
    sku: 'BAG-LAP',
  },
  {
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000&auto=format&fit=crop&q=80',
    title: 'Hardcover A5 Branded Notebook',
    category: 'Stationery',
    sku: 'NOT-A5',
  },
  {
    url: 'https://images.unsplash.com/photo-1585336261026-8f5786372969?w=1000&auto=format&fit=crop&q=80',
    title: 'Metal Executive Pen Gift Set',
    category: 'Giftware',
    sku: 'PEN-EXEC',
  },
  {
    url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=1000&auto=format&fit=crop&q=80',
    title: '10,000mAh Ultra-Slim Power Bank',
    category: 'Tech Accessories',
    sku: 'TECH-PWR',
  },
];

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

  // Custom Cursor state
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Video Scrubbing Ref
  const videoRef = useRef<HTMLVideoElement>(null);

  // GSAP Scroll Container Ref
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Symbol randomizing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSymbolIndex((prev) => (prev + 1) % CURRENCY_SYMBOLS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Custom Cursor Following (Desktop only)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.15,
          ease: 'power2.out',
        });
      }

      // Video scrubbing interaction based on cursor X position
      if (videoRef.current && videoRef.current.duration) {
        const percent = e.clientX / window.innerWidth;
        const targetTime = percent * videoRef.current.duration;
        if (!isNaN(targetTime)) {
          videoRef.current.currentTime = targetTime;
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // GSAP ScrollTrigger Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Gallery Cards Stagger Reveal
      gsap.from('.gallery-card', {
        scrollTrigger: {
          trigger: '.gallery-section',
          start: 'top 75%',
          end: 'bottom 25%',
          scrub: 1,
        },
        y: 80,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
      });

      // White Overlay Outro Transition
      gsap.to('.outro-overlay', {
        scrollTrigger: {
          trigger: '.outro-section',
          start: 'top 60%',
          end: 'top 10%',
          scrub: true,
        },
        opacity: 1,
      });
    }, mainContainerRef);

    return () => ctx.revert();
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

  const handleQuickDemoLogin = (role: 'ADMIN' | 'STAFF') => {
    const email = role === 'ADMIN' ? 'admin@brandedsolutions.co.za' : 'staff@brandedsolutions.co.za';
    const pass = role === 'ADMIN' ? 'Admin123!' : 'Staff123!';
    const res = login(email, pass);
    if (!res.success) {
      setLoginError(res.message || 'Demo login failed.');
    } else {
      showToast(`Signed in as ${role === 'ADMIN' ? 'Administrator' : 'Sales Staff'}`, 'success');
      setIsLoginModalOpen(false);
    }
  };

  return (
    <div
      ref={mainContainerRef}
      className="bg-[#050505] text-[#D4D4D8] font-sans relative overflow-x-hidden min-h-screen selection:bg-amber-500 selection:text-black cursor-default"
    >
      {/* 1A. CUSTOM CURSOR (Desktop Only) */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 rounded-full border border-white/40 pointer-events-none z-50 transition-transform duration-100 hidden md:block mix-blend-difference ${
          isHovered ? 'scale-150 bg-white/20' : 'scale-100'
        }`}
      />

      {/* HEADER NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 sm:px-12 py-5 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-sm flex items-center justify-between">
        {/* 1B. LOGO — TOP LEFT */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white text-black font-serif font-black flex items-center justify-center text-lg tracking-tighter shadow-md">
            B.
          </div>
          <div>
            <div className="text-white font-bold text-base tracking-tight font-mono">
              BRANDED.
            </div>
            <div className="text-[9px] text-[#A1A1AA] font-mono tracking-widest uppercase">
              QUOTE MANAGEMENT
            </div>
          </div>
        </div>

        {/* 1D. HEADER NAVIGATION — TOP RIGHT */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => setIsAboutModalOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="text-xs font-mono font-semibold text-[#A1A1AA] hover:text-white transition-colors tracking-widest uppercase"
          >
            ABOUT
          </button>

          <button
            type="button"
            onClick={onLaunchCustomerPortal}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#F59E0B] hover:bg-amber-500/20 text-xs font-bold transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Public Quote Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="px-5 py-2 bg-white hover:bg-amber-400 text-black font-bold text-xs rounded-full shadow-lg transition-all transform hover:scale-105 uppercase tracking-wider flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>LOGIN</span>
          </button>

          <div className="hidden lg:block">
            <ThemeSelector />
          </div>
        </div>
      </header>

      {/* HERO PHASE SECTION */}
      <section className="relative min-h-screen flex flex-col justify-between px-6 sm:px-12 pt-32 pb-12 overflow-hidden">
        {/* Ambient Video Background Layer */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden bg-black/60">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-25 filter brightness-90 saturate-120"
            src="https://cdn.coverr.co/videos/coverr-printing-process-on-fabric-5828/1080p.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        </div>

        {/* TOP / MID HERO CONTENT */}
        <div className="max-w-4xl space-y-6 mt-8">
          {/* 1C. CAPTION — BELOW LOGO */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-amber-400 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Enterprise B2B Quotation System
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-extrabold text-white tracking-tight leading-[1.08]">
            Turn branded product requests into <span className="text-[#F59E0B]">professional quotations.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl font-sans leading-relaxed">
            Create, manage and deliver professional quotations for branded products — all from one place. Branded. Quote Management simplifies pricing, quantities, variants and quote delivery in one intelligent workflow.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="px-8 py-3.5 bg-white hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm rounded-full shadow-2xl transition-all uppercase tracking-widest flex items-center gap-2"
            >
              <span>ACCESS PLATFORM / LOGIN</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onLaunchCustomerPortal}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="px-6 py-3.5 bg-[#0F0F0F] hover:bg-white/10 text-[#D4D4D8] font-bold text-xs rounded-full border border-white/10 transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#F59E0B]" />
              <span>Launch Instant Quote Portal</span>
            </button>
          </div>
        </div>

        {/* 1E. PRODUCT / QUOTE INFORMATION — BOTTOM RIGHT */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6 pt-12 border-t border-white/10">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold text-[#A1A1AA] uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              SYSTEM STATUS: READY TO QUOTE
            </div>
            <div className="text-xs text-white font-medium">
              Products • Customisation • Quantity • Pricing • Quote • Customer
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/60 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-[#F59E0B] text-lg">
              {CURRENCY_SYMBOLS[currentSymbolIndex]}
            </div>
            <div className="text-left font-mono">
              <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">
                QUOTE MANAGEMENT
              </div>
              <div className="text-xs font-bold text-white tracking-widest">
                BRANDED.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — QUOTE GALLERY (PRODUCT CATALOGUE SHOWCASE) */}
      <section className="gallery-section py-24 px-6 sm:px-12 bg-[#0A0A0A] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* GALLERY INTRODUCTION */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div>
              <div className="text-xs font-mono font-bold text-[#F59E0B] uppercase tracking-widest mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" /> PRODUCT CATALOGUE & BRANDING ECOSYSTEM
              </div>
              <h2 className="text-2xl sm:text-4xl font-sans font-bold text-white tracking-tight">
                Select • Configure • Quote
              </h2>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs text-[#71717A]">
              <div>
                <span className="text-white font-bold">10+</span> PRODUCTS
              </div>
              <div>•</div>
              <div>
                <span className="text-white font-bold">MULTI-TIER</span> VOLUME PRICING
              </div>
              <div>•</div>
              <div>
                <span className="text-white font-bold">INSTANT</span> ZAR CALCULATIONS
              </div>
            </div>
          </div>

          {/* GALLERY IMAGE GRID (10 High Quality Items) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GALLERY_IMAGES.map((img, idx) => (
              <div
                key={idx}
                className="gallery-card bg-[#050505] border border-white/10 rounded-2xl overflow-hidden group hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-64 overflow-hidden bg-black">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-md text-[10px] font-mono text-white border border-white/10">
                    SKU: {img.sku}
                  </div>
                </div>

                <div className="p-5 space-y-3 bg-[#0A0A0A]">
                  <div className="text-[10px] font-mono text-[#F59E0B] uppercase tracking-wider">
                    {img.category}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#F59E0B] transition-colors">
                    {img.title}
                  </h3>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#71717A]">
                    <span>CONFIGURED VARIANTS</span>
                    <span className="text-white font-semibold">BULK DISCOUNT APPLIED</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CONCEPTUAL PRICING BREAKDOWN STRIP */}
          <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Calculator className="w-4 h-4" /> PRICING ARCHITECTURE ENGINE
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 bg-[#050505] rounded-xl border border-white/5">
                <div className="text-[10px] text-[#71717A] uppercase">BASE PRODUCT PRICE</div>
                <div className="text-lg font-bold text-white mt-1">R100.00</div>
                <div className="text-[10px] text-[#71717A] mt-1">Volume tier discount applies</div>
              </div>

              <div className="p-4 bg-[#050505] rounded-xl border border-white/5">
                <div className="text-[10px] text-[#71717A] uppercase">VARIANT OPTIONS</div>
                <div className="text-lg font-bold text-white mt-1">+R20.00</div>
                <div className="text-[10px] text-[#71717A] mt-1">Full price deltas</div>
              </div>

              <div className="p-4 bg-[#050505] rounded-xl border border-white/5">
                <div className="text-[10px] text-[#71717A] uppercase">VOLUME DISCOUNT (100+ UNITS)</div>
                <div className="text-lg font-bold text-green-400 mt-1">-20% SAVINGS</div>
                <div className="text-[10px] text-[#71717A] mt-1">Automated price matrix</div>
              </div>

              <div className="p-4 bg-[#050505] rounded-xl border border-white/5">
                <div className="text-[10px] text-[#71717A] uppercase">15% SOUTH AFRICAN VAT</div>
                <div className="text-lg font-bold text-[#F59E0B] mt-1">CALCULATED</div>
                <div className="text-[10px] text-[#71717A] mt-1">Tax compliant ZAR quotes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUTRO & FINAL WHITE TRANSITION SECTION */}
      <section className="outro-section relative py-32 px-6 sm:px-12 bg-black text-center flex flex-col items-center justify-center">
        <div className="max-w-2xl space-y-6 relative z-10">
          <div className="text-xs font-mono font-bold text-[#F59E0B] uppercase tracking-widest">
            QUOTE MANAGEMENT
          </div>

          <h2 className="text-4xl sm:text-6xl font-sans font-extrabold text-white tracking-tight">
            BRANDED.
          </h2>

          <p className="text-lg text-[#A1A1AA] font-mono">
            Ready when you are.
          </p>

          <div className="pt-6">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="px-10 py-4 bg-white hover:bg-amber-400 text-black font-extrabold text-sm rounded-full shadow-2xl transition-all transform hover:scale-105 uppercase tracking-widest flex items-center gap-2 mx-auto"
            >
              <Lock className="w-4 h-4" />
              <span>AUTHENTICATE & ACCESS PLATFORM</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#050505] py-8 px-6 sm:px-12 text-center text-xs text-[#71717A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono text-white font-bold">
            BRANDED. (R) 2026
          </div>
          <div>
            Branded Solutions South Africa (Pty) Ltd • Enterprise Promotional Quotations
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <button onClick={() => setIsAboutModalOpen(true)} className="hover:text-white transition-colors">
              ABOUT
            </button>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">PRIVACY</span>
          </div>
        </div>
      </footer>

      {/* --- LOGIN MODAL INTERFACE --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative text-left">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-[#71717A] hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] font-bold uppercase tracking-widest">
                <Lock className="w-4 h-4" /> SECURE AUTHENTICATION
              </div>
              <h3 className="text-xl font-bold text-white">Sign In to Branded.</h3>
              <p className="text-xs text-[#71717A]">
                Select your role or enter your credentials to access the quotation console.
              </p>
            </div>

            {/* Quick Role Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#050505] p-1.5 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => handleSelectRole('ADMIN')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  selectedRoleTab === 'ADMIN'
                    ? 'bg-[#0F0F0F] text-[#F59E0B] border border-[#F59E0B]/30 shadow'
                    : 'text-[#71717A] hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('STAFF')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  selectedRoleTab === 'STAFF'
                    ? 'bg-[#0F0F0F] text-blue-400 border border-blue-500/30 shadow'
                    : 'text-[#71717A] hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Sales Staff</span>
              </button>
            </div>

            {/* Demo Credentials Box */}
            <div className="p-3 bg-[#050505] rounded-xl border border-white/5 text-xs space-y-1 font-mono">
              <div className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center justify-between">
                <span>Demo Credentials ({selectedRoleTab})</span>
                <span className="text-[#F59E0B]">Auto-Filled</span>
              </div>
              <div className="text-[#D4D4D8]">{emailInput}</div>
              <div className="text-[#71717A] text-[11px]">Pass: {passwordInput}</div>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold text-xs rounded-full shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Log In to Dashboard</span>
              </button>
            </form>

            <div className="pt-3 border-t border-white/5 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  onLaunchCustomerPortal();
                }}
                className="text-xs text-[#F59E0B] hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
              >
                <span>Switch to Public Customer Instant Quote Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ABOUT MODAL --- */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative text-left">
            <button
              onClick={() => setIsAboutModalOpen(false)}
              className="absolute top-4 right-4 text-[#71717A] hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="text-xs font-mono text-[#F59E0B] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Info className="w-4 h-4" /> ABOUT BRANDED. QUOTE MANAGEMENT
              </div>
              <h3 className="text-2xl font-sans font-bold text-white">
                Enterprise Promotional Quotations Platform
              </h3>
            </div>

            <div className="space-y-4 text-xs text-[#A1A1AA] leading-relaxed">
              <p>
                <strong>Branded. Quote Management</strong> is a high-performance B2B system designed specifically for promotional product suppliers and brand merchandise distributors in South Africa.
              </p>

              <div className="space-y-2.5 pt-2 border-t border-white/5 text-white">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <span><strong>Multi-Tier Volume Pricing:</strong> Automated quantity discount matrices for base products with custom options.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <span><strong>Staff Override Limits:</strong> Configurable discount ceilings (e.g., R500 max manual staff discount).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <span><strong>Instant ZAR & VAT Calculations:</strong> Standard 15% South African VAT calculation and formatted PDF/HTML email quote delivery.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsAboutModalOpen(false)}
                className="px-5 py-2 bg-white text-black font-bold text-xs rounded-full hover:bg-amber-400 transition-colors"
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
