import React from 'react';
import {
  Search,
  UserCheck,
  Shield,
  LogOut,
  Mail,
  Store,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ThemeSelector } from './ThemeSelector';
import { Repository } from '../../db/storage';

interface Props {
  onSearchChange?: (val: string) => void;
  onOpenEmailLogs?: () => void;
  onOpenPublicPortal?: () => void;
}

export const Header: React.FC<Props> = ({ onSearchChange, onOpenEmailLogs, onOpenPublicPortal }) => {
  const { user, role, switchUserRole, logout } = useAuth();
  const { showToast } = useNotification();

  const handleResetData = () => {
    if (confirm('Reset application data to initial South African seed dataset? All sample products and quotes will be refreshed.')) {
      Repository.resetToSeedData();
      showToast('System data reset to initial seed values.', 'info');
      window.location.reload();
    }
  };

  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-[#050505] sticky top-0 z-30">
      {/* Search Bar */}
      <div className="flex items-center gap-4 w-80 lg:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search quotes, products, customers..."
            onChange={e => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0F0F0F] border border-white/5 rounded-full text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#F59E0B] transition-colors"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Email Logs Button */}
        <button
          onClick={onOpenEmailLogs}
          title="Inspect simulated HTML email delivery log"
          className="px-4 py-2 bg-[#0F0F0F] hover:bg-white/5 border border-white/5 rounded-full text-xs font-medium text-[#D4D4D8] flex items-center gap-2 transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span className="hidden sm:inline">Email Logs</span>
        </button>

        {/* Public Customer View Switch */}
        <button
          onClick={onOpenPublicPortal}
          className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-[#F59E0B] rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Store className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Customer Portal</span>
        </button>

        {/* Quick Role Switcher */}
        <div className="flex items-center bg-[#0F0F0F] p-1 rounded-full border border-white/5 text-xs font-semibold">
          <button
            onClick={() => switchUserRole('ADMIN')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              role === 'ADMIN'
                ? 'bg-[#F59E0B] text-black shadow-md'
                : 'text-[#71717A] hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3" />
            Admin
          </button>
          <button
            onClick={() => switchUserRole('STAFF')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              role === 'STAFF'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-[#71717A] hover:text-white'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            Staff
          </button>
        </div>

        {/* Visual Theme Selector */}
        <ThemeSelector />

        {/* Reset Seed Data Button */}
        <button
          onClick={handleResetData}
          title="Reset to seed data"
          className="p-2 text-[#71717A] hover:text-white hover:bg-white/5 rounded-full border border-white/5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* User / Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/5">
          <div className="text-right hidden lg:block">
            <div className="text-xs font-semibold text-white">{user?.name}</div>
            <div className="text-[10px] text-[#71717A] font-mono">{user?.email}</div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
