import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Package,
  FolderTree,
  Layers,
  Users,
  Settings,
  Shield,
  UserCheck,
  Store,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type ActiveTab =
  | 'DASHBOARD'
  | 'QUOTES'
  | 'CREATE_QUOTE'
  | 'QUOTE_DETAIL'
  | 'CATEGORIES'
  | 'PRODUCTS'
  | 'VARIANTS'
  | 'CUSTOMERS'
  | 'STAFF'
  | 'SETTINGS'
  | 'PUBLIC_PORTAL'
  | 'PUBLIC_RETRIEVAL';

interface Props {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  quoteCountByStatus?: { draft: number; submitted: number; accepted: number; rejected: number };
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  quoteCountByStatus,
}) => {
  const { user, role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<any>; adminOnly?: boolean }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'QUOTES', label: 'Quotes', icon: FileText },
    { id: 'PRODUCTS', label: 'Products', icon: Package },
    { id: 'CATEGORIES', label: 'Categories', icon: FolderTree },
    { id: 'VARIANTS', label: 'Variants', icon: Layers },
    { id: 'CUSTOMERS', label: 'Customers', icon: Users },
    { id: 'STAFF', label: 'Staff Users', icon: UserCheck, adminOnly: true },
    { id: 'SETTINGS', label: 'Settings', icon: Settings, adminOnly: true },
  ];

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col justify-between h-screen shrink-0 text-[#D4D4D8] select-none sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-8 pb-4">
          <div className="text-white font-serif italic text-2xl tracking-tighter">BRANDED.</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#A1A1AA] mt-1 opacity-70">
            Quote Management
          </div>
        </div>

        {/* Quick Action */}
        <div className="px-6 mb-4">
          <button
            onClick={() => onSelectTab('CREATE_QUOTE')}
            className="w-full py-2.5 px-4 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold text-xs rounded-full shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Quote</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {navItems.map(item => {
            if (item.adminOnly && !isAdmin) return null;
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/5 text-white border border-white/10'
                    : 'text-[#71717A] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : ''}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'QUOTES' && quoteCountByStatus && (
                  <span className="text-[10px] font-bold bg-white/10 text-[#D4D4D8] px-2 py-0.5 rounded-full">
                    {quoteCountByStatus.submitted + quoteCountByStatus.draft}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/5">
            <button
              onClick={() => onSelectTab('PUBLIC_PORTAL')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-[#A1A1AA] hover:text-white rounded-lg hover:bg-white/5 text-xs font-semibold transition-colors"
            >
              <Store className="w-4 h-4 text-[#F59E0B]" />
              <span>Customer Portal</span>
            </button>
          </div>
        </nav>
      </div>

      {/* User Info Bottom */}
      <div className="p-6 border-t border-white/5 bg-[#050505]/40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#F59E0B] flex items-center justify-center text-black font-bold text-xs shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{user?.name || 'System User'}</div>
            <div className="text-[10px] text-[#71717A] uppercase tracking-wider">{role || 'Admin Console'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
