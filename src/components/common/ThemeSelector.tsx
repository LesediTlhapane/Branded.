import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, Sun, Moon, Shield, UserCheck, Store } from 'lucide-react';
import { useTheme, ThemeMode, Theme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const ThemeSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, themeMode, setThemeMode, getThemeName } = useTheme();
  const { role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeBadgeIcon = (t: Theme) => {
    switch (t) {
      case 'blue-white':
        return <Sun className="w-3.5 h-3.5 text-blue-500" />;
      case 'slate-dark':
        return <Moon className="w-3.5 h-3.5 text-blue-400" />;
      case 'dark-gold':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Visual Theme"
        className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
          theme === 'blue-white'
            ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
            : 'bg-[#0F0F0F] text-[#D4D4D8] border-white/10 hover:border-white/20 hover:text-white'
        }`}
      >
        <Palette className="w-3.5 h-3.5 text-[#F59E0B]" />
        {!compact && (
          <span className="hidden md:inline font-mono text-[11px]">
            {themeMode === 'auto' ? 'Theme: Auto' : theme === 'blue-white' ? 'Blue & White' : theme === 'slate-dark' ? 'Slate Navy' : 'Dark Gold'}
          </span>
        )}
        {getThemeBadgeIcon(theme)}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0F0F0F] border border-white/10 shadow-2xl p-2 z-50 text-xs text-[#D4D4D8] space-y-1 backdrop-blur-xl">
          <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#F59E0B]" /> Visual Design Theme
            </span>
            <span className="text-[10px] font-mono text-[#F59E0B] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Active: {theme}
            </span>
          </div>

          {/* Auto Mode Option */}
          <button
            type="button"
            onClick={() => {
              setThemeMode('auto');
              setIsOpen(false);
            }}
            className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-colors ${
              themeMode === 'auto'
                ? 'bg-amber-500/10 border border-amber-500/30 text-white font-bold'
                : 'hover:bg-white/5 text-[#A1A1AA]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">✨ Dynamic Auto Mode</span>
                {themeMode === 'auto' && <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
              </div>
              <p className="text-[10px] text-[#71717A] mt-0.5 leading-snug">
                Automatically adapts theme on user switch:
                <br />
                • Admin → Sophisticated Dark Gold
                <br />
                • Staff → Midnight Slate Navy
                <br />
                • Customer Portal → Corporate Blue & White
              </p>
            </div>
          </button>

          <div className="my-1 border-t border-white/5" />

          {/* Option 1: Sophisticated Dark Gold */}
          <button
            type="button"
            onClick={() => {
              setThemeMode('dark-gold');
              setIsOpen(false);
            }}
            className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
              themeMode === 'dark-gold'
                ? 'bg-amber-500/10 border border-amber-500/30 text-white font-bold'
                : 'hover:bg-white/5 text-[#A1A1AA]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-[#050505] border border-[#F59E0B] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              </div>
              <div>
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  Sophisticated Dark Gold
                  <Shield className="w-3 h-3 text-[#F59E0B]" />
                </div>
                <div className="text-[10px] text-[#71717A]">Executive dark mode with amber accents</div>
              </div>
            </div>
            {themeMode === 'dark-gold' && <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
          </button>

          {/* Option 2: Corporate Blue & White */}
          <button
            type="button"
            onClick={() => {
              setThemeMode('blue-white');
              setIsOpen(false);
            }}
            className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
              themeMode === 'blue-white'
                ? 'bg-blue-500/10 border border-blue-500/30 text-white font-bold'
                : 'hover:bg-white/5 text-[#A1A1AA]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-white border border-blue-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              </div>
              <div>
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  Corporate Blue & White
                  <Store className="w-3 h-3 text-blue-400" />
                </div>
                <div className="text-[10px] text-[#71717A]">Crisp light canvas with royal blue highlights</div>
              </div>
            </div>
            {themeMode === 'blue-white' && <Check className="w-3.5 h-3.5 text-blue-400" />}
          </button>

          {/* Option 3: Midnight Slate Navy */}
          <button
            type="button"
            onClick={() => {
              setThemeMode('slate-dark');
              setIsOpen(false);
            }}
            className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
              themeMode === 'slate-dark'
                ? 'bg-blue-500/10 border border-blue-500/30 text-white font-bold'
                : 'hover:bg-white/5 text-[#A1A1AA]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-[#0F172A] border border-blue-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              </div>
              <div>
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  Midnight Slate Navy
                  <UserCheck className="w-3 h-3 text-blue-400" />
                </div>
                <div className="text-[10px] text-[#71717A]">Deep slate navy with sapphire blue highlights</div>
              </div>
            </div>
            {themeMode === 'slate-dark' && <Check className="w-3.5 h-3.5 text-blue-400" />}
          </button>

        </div>
      )}
    </div>
  );
};
