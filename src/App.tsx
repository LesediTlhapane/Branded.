import React, { useState } from 'react';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeSelector } from './components/common/ThemeSelector';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ForcePasswordModal } from './components/common/ForcePasswordModal';
import { EmailPreviewModal } from './components/common/EmailPreviewModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { QuoteListTable } from './components/quote/QuoteListTable';
import { QuoteBuilder } from './components/quote/QuoteBuilder';
import { QuoteDetailView } from './components/quote/QuoteDetailView';
import { CategoryTreeManager } from './components/catalog/CategoryTreeManager';
import { ProductManager } from './components/catalog/ProductManager';
import { VariantManager } from './components/catalog/VariantManager';
import { StaffManager } from './components/users/StaffManager';
import { CustomerManager } from './components/users/CustomerManager';
import { SettingsManager } from './components/settings/SettingsManager';

// Customer & Home Public Views
import { PortalHome } from './components/home/PortalHome';
import { PublicCustomerPortal } from './components/customer/PublicCustomerPortal';
import { PublicQuoteRetrieval } from './components/customer/PublicQuoteRetrieval';

// Services & Icons
import { EmailService } from './services/EmailService';
import { Quote } from './types';
import { Mail } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, role, login } = useAuth();
  const { showToast } = useNotification();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('DASHBOARD');
  const [activeQuoteToView, setActiveQuoteToView] = useState<Quote | null>(null);
  const [activeQuoteToEdit, setActiveQuoteToEdit] = useState<Quote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Email Logs Drawer State
  const [isEmailLogsOpen, setIsEmailLogsOpen] = useState(false);
  const [selectedEmailLog, setSelectedEmailLog] = useState<any | null>(null);

  // If user navigated to public portal or public retrieval
  if (activeTab === 'PUBLIC_PORTAL') {
    return (
      <PublicCustomerPortal
        onNavigateToRetrieval={() => setActiveTab('PUBLIC_RETRIEVAL')}
        onExitToHome={() => setActiveTab('DASHBOARD')}
      />
    );
  }

  if (activeTab === 'PUBLIC_RETRIEVAL') {
    return (
      <PublicQuoteRetrieval
        onBackToPortal={() => setActiveTab('PUBLIC_PORTAL')}
        onExitToHome={() => setActiveTab('DASHBOARD')}
      />
    );
  }

  // If not authenticated, show PortalHome startup / sign-in page
  if (!isAuthenticated) {
    return (
      <PortalHome
        onLaunchCustomerPortal={() => setActiveTab('PUBLIC_PORTAL')}
        onLaunchQuoteRetrieval={() => setActiveTab('PUBLIC_RETRIEVAL')}
      />
    );
  }

  // If user logged in but password reset required
  if (user?.requiresPasswordChange) {
    return <ForcePasswordModal />;
  }

  // Render main application shell
  return (
    <div className="min-h-screen bg-[#050505] text-[#D4D4D8] flex font-sans">
      
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={tab => setActiveTab(tab)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <Header
          onSearchChange={val => setSearchQuery(val)}
          onOpenEmailLogs={() => setIsEmailLogsOpen(true)}
          onOpenPublicPortal={() => setActiveTab('PUBLIC_PORTAL')}
        />

        {/* Views Container */}
        <main className="flex-1 p-8 overflow-y-auto">
          
          {activeTab === 'DASHBOARD' && (
            <DashboardView
              onNavigateQuotes={() => setActiveTab('QUOTES')}
              onCreateQuote={() => {
                setActiveQuoteToEdit(null);
                setActiveTab('CREATE_QUOTE');
              }}
              onSelectQuote={q => {
                setActiveQuoteToView(q);
                setActiveTab('QUOTE_DETAIL');
              }}
            />
          )}

          {activeTab === 'QUOTES' && (
            <QuoteListTable
              onSelectQuote={q => {
                setActiveQuoteToView(q);
                setActiveTab('QUOTE_DETAIL');
              }}
              onCreateQuote={() => {
                setActiveQuoteToEdit(null);
                setActiveTab('CREATE_QUOTE');
              }}
              onEditQuote={q => {
                setActiveQuoteToEdit(q);
                setActiveTab('CREATE_QUOTE');
              }}
            />
          )}

          {activeTab === 'CREATE_QUOTE' && (
            <QuoteBuilder
              initialQuoteToEdit={activeQuoteToEdit}
              onSuccess={(savedQuote) => {
                setActiveQuoteToView(savedQuote);
                setActiveTab('QUOTE_DETAIL');
              }}
              onCancel={() => setActiveTab('QUOTES')}
            />
          )}

          {activeTab === 'QUOTE_DETAIL' && activeQuoteToView && (
            <QuoteDetailView
              quote={activeQuoteToView}
              onBack={() => setActiveTab('QUOTES')}
              onEditNewVersion={q => {
                setActiveQuoteToEdit(q);
                setActiveTab('CREATE_QUOTE');
              }}
            />
          )}

          {activeTab === 'CATEGORIES' && <CategoryTreeManager />}

          {activeTab === 'PRODUCTS' && <ProductManager />}

          {activeTab === 'VARIANTS' && <VariantManager />}

          {activeTab === 'CUSTOMERS' && <CustomerManager />}

          {activeTab === 'STAFF' && <StaffManager />}

          {activeTab === 'SETTINGS' && <SettingsManager />}

        </main>
      </div>

      {/* Email Logs Inspector Modal */}
      {isEmailLogsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-sm font-bold text-white">Simulated HTML Email Delivery Log</h3>
              </div>
              <button
                onClick={() => setIsEmailLogsOpen(false)}
                className="text-[#71717A] hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {EmailService.getEmailLogs().length === 0 ? (
                <div className="text-center py-8 text-[#71717A] text-xs">No emails sent yet. Submit a quotation to trigger delivery log.</div>
              ) : (
                EmailService.getEmailLogs().map(log => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedEmailLog(log)}
                    className="p-3 bg-[#050505] border border-white/5 rounded-xl hover:border-[#F59E0B]/50 transition-colors cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{log.subject}</div>
                      <div className="text-[11px] text-[#A1A1AA] font-mono mt-0.5">To: {log.recipientEmail}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                        {log.status}
                      </span>
                      <div className="text-[10px] text-[#71717A] mt-1">
                        {new Date(log.sentAt).toLocaleTimeString('en-ZA')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Drawer */}
      <EmailPreviewModal emailLog={selectedEmailLog} onClose={() => setSelectedEmailLog(null)} />

    </div>
  );
};

export function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ThemeProvider>
          <MainAppContent />
        </ThemeProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
