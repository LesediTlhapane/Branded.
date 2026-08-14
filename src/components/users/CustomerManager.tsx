import React, { useState } from 'react';
import { Repository } from '../../db/storage';
import { QuoteService } from '../../services/QuoteService';
import { Customer } from '../../types';
import { formatZAR } from '../../utils/currency';
import { Users, Search, Building2, Mail, Phone, MapPin, FileText, Calendar, Plus, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const CustomerManager: React.FC = () => {
  const { showToast } = useNotification();
  const [customers, setCustomers] = useState<Customer[]>(() => Repository.getCustomers());
  const [searchQuery, setSearchQuery] = useState('');

  // Modal for adding new customer manually
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newVat, setNewVat] = useState('');

  const quotes = QuoteService.getAllQuotes();

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      showToast('Please provide a valid customer email address.', 'error');
      return;
    }

    const cleanEmail = newEmail.trim().toLowerCase();
    if (customers.some(c => c.email.toLowerCase() === cleanEmail)) {
      showToast('A customer with this email address already exists.', 'error');
      return;
    }

    const newCust: Customer = {
      id: `cust_${Math.random().toString(36).substring(2, 9)}`,
      companyName: newCompany.trim() || 'Direct Account',
      contactName: newContact.trim() || 'Valued Customer',
      email: cleanEmail,
      phone: newPhone.trim() || '+27 00 000 0000',
      vatNumber: newVat.trim() || undefined,
      address: {
        street: '15 Enterprise Rd',
        city: 'Johannesburg',
        province: 'Gauteng',
        postalCode: '2000',
      },
      createdAt: new Date().toISOString(),
    };

    const updatedList = [newCust, ...customers];
    setCustomers(updatedList);
    Repository.saveCustomers(updatedList);

    setNewCompany('');
    setNewContact('');
    setNewEmail('');
    setNewPhone('');
    setNewVat('');
    setIsModalOpen(false);
    showToast(`Customer "${newCust.companyName}" added successfully.`, 'success');
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.companyName.toLowerCase().includes(q) ||
      c.contactName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-mono font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" /> CRM Directory
          </div>
          <h1 className="text-2xl font-serif italic text-white tracking-tight mt-1">Customer Accounts</h1>
          <p className="text-xs text-[#71717A]">
            Registered enterprise clients and automatically captured quote submitters
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold text-xs rounded-full shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by company, contact person, or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0F0F0F] border border-white/10 rounded-xl text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#F59E0B]"
        />
      </div>

      {/* Customer List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#0F0F0F] border border-white/5 rounded-2xl space-y-2 text-[#71717A] text-xs">
            <Users className="w-8 h-8 mx-auto text-[#71717A]/50" />
            <p>No customers found matching your filter.</p>
          </div>
        ) : (
          filteredCustomers.map(c => {
            const customerQuotes = quotes.filter(
              q => q.customerEmail.toLowerCase() === c.email.toLowerCase() || q.customerId === c.id
            );
            const totalQuotedAmount = customerQuotes.reduce((acc, q) => {
              const curVer = q.versions.find(v => v.versionNumber === q.currentVersionNumber) || q.versions[0];
              return acc + (curVer?.finalTotal || 0);
            }, 0);

            return (
              <div
                key={c.id}
                className="bg-[#0F0F0F] border border-white/5 hover:border-white/20 transition-all rounded-2xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-base font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#F59E0B] shrink-0" />
                        <span>{c.companyName}</span>
                      </div>
                      <div className="text-xs text-[#A1A1AA] font-medium">{c.contactName}</div>
                    </div>

                    <span className="text-[10px] font-mono bg-white/5 border border-white/10 text-[#71717A] px-2 py-0.5 rounded-full shrink-0">
                      {customerQuotes.length} Quotes
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-[#71717A] font-mono pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span className="text-[#D4D4D8] truncate">{c.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{c.phone}</span>
                    </div>

                    {c.vatNumber && (
                      <div className="text-[11px] text-[#71717A]">
                        VAT No: <span className="text-white font-bold">{c.vatNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-[#71717A] uppercase">Total Value Quoted</div>
                    <div className="text-sm font-bold text-white mt-0.5">{formatZAR(totalQuotedAmount)}</div>
                  </div>

                  <div className="text-right text-[10px] text-[#71717A]">
                    Created: {new Date(c.createdAt).toLocaleDateString('en-ZA')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Add New Customer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#71717A] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Vodacom Corporate"
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050505] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">Contact Person Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sipho Ndlovu"
                  value={newContact}
                  onChange={e => setNewContact(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050505] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1AA] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sipho@company.co.za"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#050505] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A1A1AA] mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+27 82 123 4567"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#050505] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="block text-[#A1A1AA] mb-1">VAT Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="4820192831"
                    value={newVat}
                    onChange={e => setNewVat(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#050505] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold rounded-full shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Customer Account</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
