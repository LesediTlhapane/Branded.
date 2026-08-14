import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Search,
  ArrowRight,
  ArrowLeft,
  Mail,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Product, QuoteLineItem, SelectedVariant, Quote, QuoteVersion } from '../../types';
import { ProductService } from '../../services/ProductService';
import { PricingService } from '../../services/PricingService';
import { QuoteService } from '../../services/QuoteService';
import { SettingsService } from '../../services/SettingsService';
import { formatZAR } from '../../utils/currency';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeSelector } from '../common/ThemeSelector';

const CUSTOMER_LOCAL_QUOTE_KEY = 'sa_customer_draft_quote_v1';

interface PublicCustomerPortalProps {
  onNavigateToRetrieval: () => void;
  onExitToHome?: () => void;
}

export const PublicCustomerPortal: React.FC<PublicCustomerPortalProps> = ({
  onNavigateToRetrieval,
  onExitToHome,
}) => {
  const { showToast } = useNotification();
  const { setIsCustomerPortalActive } = useTheme();
  const settings = SettingsService.getSettings();

  useEffect(() => {
    setIsCustomerPortalActive(true);
    return () => setIsCustomerPortalActive(false);
  }, [setIsCustomerPortalActive]);

  // Step state: 'BUILD' | 'REVIEW' | 'SUCCESS'
  const [step, setStep] = useState<'BUILD' | 'REVIEW' | 'SUCCESS'>('BUILD');

  // Catalog
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(ProductService.getAllCategories());
  const [variants, setVariants] = useState(ProductService.getAllVariants());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('all');

  // Active product being configured modal
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedVariantValues, setSelectedVariantValues] = useState<Record<string, string>>({});
  const [productQuantity, setProductQuantity] = useState<number>(25);

  // Customer Cart / Draft Items (Persisted in localStorage)
  const [cartItems, setCartItems] = useState<QuoteLineItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CUSTOMER_LOCAL_QUOTE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Customer Contact Info - Prepopulated as requested with Ntokozo Mhlabane & Active Ops
  const [customerEmail, setCustomerEmail] = useState('ntokozo.mhlabane@activeops.co.za');
  const [customerName, setCustomerName] = useState('Ntokozo Mhlabane');
  const [customerCompany, setCustomerCompany] = useState('Active Ops');
  const [customerPhone, setCustomerPhone] = useState('+27 82 999 1234');

  // Submitted Quote Result
  const [submittedQuote, setSubmittedQuote] = useState<Quote | null>(null);
  const [submittedVersion, setSubmittedVersion] = useState<QuoteVersion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setProducts(ProductService.getAllProducts(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(CUSTOMER_LOCAL_QUOTE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const handleOpenProduct = (prod: Product) => {
    setActiveProduct(prod);
    setProductQuantity(25);

    const defaults: Record<string, string> = {};
    const attachedTypes = variants.filter(v => prod.variantTypeIds.includes(v.id));
    attachedTypes.forEach(vt => {
      if (vt.values.length > 0) defaults[vt.id] = vt.values[0].id;
    });

    if (prod.productSpecificVariantTypes) {
      prod.productSpecificVariantTypes.forEach(pvt => {
        if (pvt.values.length > 0) defaults[pvt.id] = pvt.values[0].id;
      });
    }

    setSelectedVariantValues(defaults);
    setActiveImageIndex(0);
  };

  const getModalCalculatedLine = (): QuoteLineItem | null => {
    if (!activeProduct) return null;

    const chosenVariants: SelectedVariant[] = [];

    const attachedTypes = variants.filter(v => activeProduct.variantTypeIds.includes(v.id));
    attachedTypes.forEach(vt => {
      const selId = selectedVariantValues[vt.id];
      const match = vt.values.find(v => v.id === selId);
      if (match) {
        chosenVariants.push({
          variantTypeId: vt.id,
          variantTypeName: vt.name,
          variantValueId: match.id,
          variantValueName: match.name,
          priceDelta: match.priceDelta,
        });
      }
    });

    if (activeProduct.productSpecificVariantTypes) {
      activeProduct.productSpecificVariantTypes.forEach(pvt => {
        const selId = selectedVariantValues[pvt.id];
        const match = pvt.values.find(v => v.id === selId);
        if (match) {
          chosenVariants.push({
            variantTypeId: pvt.id,
            variantTypeName: pvt.name,
            variantValueId: match.id,
            variantValueName: match.name,
            priceDelta: match.priceDelta,
          });
        }
      });
    }

    return PricingService.calculateLine(activeProduct, chosenVariants, productQuantity);
  };

  const handleAddToCart = () => {
    const line = getModalCalculatedLine();
    if (!line) return;

    setCartItems(prev => [...prev, line]);
    setActiveProduct(null);
    showToast(`Added ${line.productNameSnapshot} (${line.quantity} units) to quote build.`, 'success');
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  // Cart Totals
  const totals = PricingService.calculateTotals(cartItems, 0, 'CUSTOMER');

  // Proceed to explicit review step
  const handleProceedToReview = () => {
    if (cartItems.length === 0) {
      showToast('Please select at least one product before reviewing your quote.', 'error');
      return;
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      showToast('A valid email address is required so we can deliver your official quotation.', 'error');
      return;
    }

    setStep('REVIEW');
  };

  // Confirm submission
  const handleConfirmAndSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await QuoteService.createQuote({
        customerEmail,
        customerName: customerName || 'Valued Customer',
        customerPhone,
        customerCompany,
        lineItems: cartItems,
        manualDiscountAmount: 0, // Customers do not have manual discounts
        createdByRole: 'CUSTOMER',
        createdByName: customerName || 'Online Customer',
        createdByEmail: customerEmail,
        submitImmediately: true,
      });

      if (res.success && res.quote) {
        const activeVer = res.quote.versions[0];
        setSubmittedQuote(res.quote);
        setSubmittedVersion(activeVer);
        setStep('SUCCESS');
        localStorage.removeItem(CUSTOMER_LOCAL_QUOTE_KEY);
        setCartItems([]);
        showToast('Quotation submitted successfully! Your reference number has been generated.', 'success');
      } else {
        showToast(res.message || 'Error submitting quote.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An unexpected error occurred during quote submission.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    let matchCat = selectedCatId === 'all';
    if (!matchCat) {
      if (p.categoryId === selectedCatId) {
        matchCat = true;
      } else {
        const childCatIds = categories.filter(c => c.parentId === selectedCatId).map(c => c.id);
        if (childCatIds.includes(p.categoryId)) {
          matchCat = true;
        } else {
          const pCat = categories.find(c => c.id === p.categoryId);
          if (pCat && pCat.parentId === selectedCatId) {
            matchCat = true;
          }
        }
      }
    }
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      query === '' ||
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  const modalCalculatedLine = getModalCalculatedLine();

  return (
    <div className="min-h-screen bg-[#050505] text-[#D4D4D8] flex flex-col font-sans">
      
      {/* Public Navbar Header */}
      <header className="bg-[#0A0A0A] border-b border-white/5 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center text-black font-serif italic text-xl shadow-lg shadow-amber-500/10">
              BS
            </div>
            <div>
              <h1 className="font-serif italic text-white text-lg tracking-tight">{settings.companyName}</h1>
              <p className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest">
                Merchandise Quote Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSelector />
            <button
              onClick={onNavigateToRetrieval}
              className="px-3.5 py-2 bg-[#0F0F0F] hover:bg-white/5 text-[#F59E0B] text-xs font-semibold rounded-full border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Retrieve Quote</span>
            </button>
            {onExitToHome && (
              <button
                onClick={onExitToHome}
                className="px-3.5 py-2 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold rounded-full border border-[#F59E0B]/30 transition-all flex items-center gap-1.5"
                title="Exit Customer Portal and return to Main Home/Login page"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home / Exit Portal</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Public Builder Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* STEP 1: BUILD QUOTE */}
        {step === 'BUILD' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Catalog Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
                <div>
                  <h2 className="text-xl font-serif italic text-white">1. Select Branded Merchandise</h2>
                  <p className="text-xs text-[#71717A] mt-1">
                    Browse products, configure variants (sizes, colours, branding options) and view instant volume pricing discounts.
                  </p>
                </div>

                {/* Filters */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search merchandise..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    <button
                      onClick={() => setSelectedCatId('all')}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedCatId === 'all'
                          ? 'bg-[#F59E0B] text-black font-bold'
                          : 'bg-[#050505] text-[#71717A] hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    {categories.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCatId(c.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                          selectedCatId === c.id
                            ? 'bg-[#F59E0B] text-black font-bold'
                            : 'bg-[#050505] text-[#71717A] hover:text-white'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleOpenProduct(p)}
                      className="p-3.5 bg-[#050505] border border-white/5 rounded-xl hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-14 h-14 object-cover rounded-lg border border-white/5 shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-white truncate group-hover:text-[#F59E0B] transition-colors">
                            {p.name}
                          </h3>
                          <div className="text-[10px] text-[#71717A] font-mono mt-0.5">SKU: {p.sku}</div>
                          <div className="text-xs font-bold text-[#F59E0B] mt-1">
                            From {formatZAR(p.basePrice)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[10px] text-green-500 font-semibold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                          Volume Savings
                        </span>
                        <button className="px-3 py-1 bg-[#0F0F0F] hover:bg-white/10 text-white text-xs font-bold rounded-full border border-white/10 transition-colors flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5 text-[#F59E0B]" /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quote Cart / Summary Column */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Contact Info Card */}
              <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-3">
                <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#F59E0B]" />
                  Your Contact Details <span className="text-rose-400">*</span>
                </h2>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#71717A] mb-1">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="yourname@company.co.za"
                      className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#71717A] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Sipho Ndlovu"
                      className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#71717A] mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={customerCompany}
                      onChange={e => setCustomerCompany(e.target.value)}
                      placeholder="Vodacom SA"
                      className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                </div>
              </div>

              {/* Items Summary Card */}
              <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#F59E0B]" />
                    Selected Items ({cartItems.length})
                  </h2>
                  <span className="text-xs font-bold text-[#F59E0B]">{formatZAR(totals.finalTotal)}</span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="py-8 text-center text-[#71717A] text-xs border border-dashed border-white/10 rounded-xl bg-[#050505]">
                    No items selected yet. Choose a product from the catalog to configure options.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {cartItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#050505] border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">{item.productNameSnapshot}</div>
                          <div className="text-[10px] text-[#71717A]">
                            Qty: <strong className="text-white">{item.quantity}</strong> | Price: {formatZAR(item.effectiveUnitPrice)}
                          </div>
                          {item.appliedVolumeDiscountPercent > 0 && (
                            <span className="text-[10px] text-green-500 font-semibold">
                              ({item.appliedVolumeDiscountPercent}% Vol Savings Included)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="font-bold text-white">{formatZAR(item.lineTotal)}</div>
                          <button
                            onClick={() => handleRemoveFromCart(idx)}
                            className="p-1 text-[#71717A] hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={handleProceedToReview}
                    disabled={cartItems.length === 0}
                    className="w-full py-3 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold text-xs rounded-full transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>Proceed to Review Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* STEP 2: EXPLICIT CUSTOMER REVIEW STEP */}
        {step === 'REVIEW' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <button
                  onClick={() => setStep('BUILD')}
                  className="text-xs text-[#71717A] hover:text-white flex items-center gap-1 mb-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Product Selection
                </button>
                <h1 className="text-2xl font-serif italic text-white">2. Confirm Your Quotation</h1>
                <p className="text-xs text-[#71717A] mt-1">
                  Please review all line items, pricing calculations and terms before explicit confirmation.
                </p>
              </div>

              <div className="px-3 py-1 bg-amber-500/10 text-[#F59E0B] text-xs font-bold rounded-full border border-amber-500/20 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Explicit Review Step Required
              </div>
            </div>

            {/* Review Card */}
            <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 space-y-6 shadow-2xl">
              
              {/* Contact Confirmation */}
              <div className="p-4 bg-[#050505] rounded-xl border border-white/5 flex flex-wrap justify-between gap-4 text-xs">
                <div>
                  <span className="text-[#71717A]">Customer Email:</span>{' '}
                  <strong className="text-[#F59E0B] font-bold">{customerEmail}</strong>
                </div>
                <div>
                  <span className="text-[#71717A]">Contact Name:</span>{' '}
                  <strong className="text-white">{customerName || 'Valued Customer'}</strong>
                </div>
                <div>
                  <span className="text-[#71717A]">Company:</span>{' '}
                  <strong className="text-white">{customerCompany || 'Direct'}</strong>
                </div>
              </div>

              {/* Line Items Breakdown Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#71717A] uppercase tracking-widest">Line Items</h3>
                <div className="border border-white/5 rounded-xl overflow-hidden bg-[#050505]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[#71717A] font-semibold uppercase tracking-widest text-[10px]">
                        <th className="p-3">Product</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {cartItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3">
                            <div className="font-bold text-white">{item.productNameSnapshot}</div>
                            {item.selectedVariants.length > 0 && (
                              <div className="text-[11px] text-[#F59E0B] mt-0.5">
                                {item.selectedVariants.map(v => `${v.variantTypeName}: ${v.variantValueName}`).join(' | ')}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center font-bold text-white">{item.quantity}</td>
                          <td className="p-3 text-right text-[#D4D4D8]">{formatZAR(item.effectiveUnitPrice)}</td>
                          <td className="p-3 text-right font-bold text-white">{formatZAR(item.lineTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="p-4 bg-[#050505] rounded-xl border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-[#71717A]">
                  <span>Subtotal:</span>
                  <strong className="text-white">{formatZAR(totals.subtotal)}</strong>
                </div>
                {totals.totalVolumeDiscountAmount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Automated Volume Discount Savings:</span>
                    <strong>-{formatZAR(totals.totalVolumeDiscountAmount)}</strong>
                  </div>
                )}
                <div className="border-t border-white/5 pt-2 flex justify-between items-baseline text-sm font-bold text-white">
                  <span>Final Total:</span>
                  <span className="text-xl font-light text-[#F59E0B]">{formatZAR(totals.finalTotal)}</span>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="p-4 bg-[#050505] rounded-xl border border-white/5 text-xs text-[#71717A] space-y-1">
                <div className="font-bold text-white uppercase tracking-widest text-[10px]">Quote Terms & Validity</div>
                <p>Quote valid for {settings.quoteValidityDays} days from submission.</p>
                <p className="whitespace-pre-line font-mono text-[11px] text-[#71717A] mt-1">{settings.termsAndConditions}</p>
              </div>

              {/* Explicit Confirmation Action */}
              <div className="pt-2 flex justify-end gap-4">
                <button
                  onClick={() => setStep('BUILD')}
                  className="px-5 py-2.5 bg-[#050505] text-[#71717A] hover:text-white text-xs font-semibold rounded-full"
                >
                  Edit Items
                </button>

                <button
                  onClick={handleConfirmAndSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold text-xs rounded-full shadow-lg shadow-amber-500/10 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Submitting Quotation...' : 'Explicitly Confirm & Submit Quotation'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* STEP 3: SUBMISSION SUCCESS CONFIRMATION */}
        {step === 'SUCCESS' && submittedQuote && (
          <div className="max-w-2xl mx-auto space-y-6 text-center py-12">
            <div className="p-4 bg-amber-500/10 text-[#F59E0B] rounded-full w-20 h-20 mx-auto flex items-center justify-center border border-amber-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-[#F59E0B] bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">
                Official Quotation Submitted
              </span>
              <h1 className="text-3xl font-serif italic text-white mt-3">
                Ref: <span className="text-[#F59E0B]">{submittedQuote.referenceNumber}</span>
              </h1>
              <p className="text-xs text-[#71717A] mt-2 max-w-md mx-auto">
                An official HTML quotation has been generated and sent to <strong className="text-white">{submittedQuote.customerEmail}</strong>.
              </p>
            </div>

            <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 text-left space-y-3 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#71717A]">Reference:</span>
                <strong className="text-white font-mono">{submittedQuote.referenceNumber}</strong>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#71717A]">Total Quoted Value:</span>
                <strong className="text-[#F59E0B] text-sm">{formatZAR(submittedVersion?.finalTotal || 0)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Valid Until:</span>
                <strong className="text-white">
                  {new Date(submittedQuote.expiresAt).toLocaleDateString('en-ZA')}
                </strong>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setStep('BUILD');
                  setSubmittedQuote(null);
                }}
                className="px-6 py-2.5 bg-[#0F0F0F] hover:bg-white/5 text-[#D4D4D8] font-semibold text-xs rounded-full border border-white/5"
              >
                Create Another Quote
              </button>

              <button
                onClick={onNavigateToRetrieval}
                className="px-6 py-2.5 bg-[#F59E0B] hover:bg-amber-400 text-black font-bold text-xs rounded-full shadow-lg shadow-amber-500/10"
              >
                Go to Quote Retrieval Page
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Product Configuration Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{activeProduct.name}</h3>
                <div className="text-xs text-[#71717A] font-mono mt-0.5">
                  Base Price: <strong className="text-[#F59E0B]">{formatZAR(activeProduct.basePrice)}</strong> | SKU: {activeProduct.sku}
                </div>
              </div>
              <button onClick={() => setActiveProduct(null)} className="text-[#71717A] hover:text-white font-bold p-1">
                ✕
              </button>
            </div>

            {/* Product Images Gallery / Carousel */}
            {activeProduct.images && activeProduct.images.length > 0 && (
              <div className="space-y-2">
                <div className="relative h-48 w-full bg-[#050505] rounded-xl overflow-hidden border border-white/5 group">
                  <img
                    src={activeProduct.images[activeImageIndex] || activeProduct.images[0]}
                    alt={`${activeProduct.name} View ${activeImageIndex + 1}`}
                    className="w-full h-full object-cover transition-all"
                  />

                  {activeProduct.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveImageIndex(prev =>
                            prev === 0 ? activeProduct.images.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveImageIndex(prev =>
                            prev === activeProduct.images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-white border border-white/10">
                        {activeImageIndex + 1} / {activeProduct.images.length} Photos
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails Row */}
                {activeProduct.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {activeProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-12 h-12 rounded-lg border overflow-hidden shrink-0 transition-all ${
                          activeImageIndex === idx
                            ? 'border-[#F59E0B] ring-2 ring-[#F59E0B]/30 scale-105'
                            : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">
                Order Quantity
              </label>
              <input
                type="number"
                min="1"
                value={productQuantity}
                onChange={e => setProductQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            {/* Variant Choices */}
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {variants
                .filter(v => activeProduct.variantTypeIds.includes(v.id))
                .map(vt => (
                  <div key={vt.id} className="space-y-1">
                    <label className="block text-xs font-bold text-[#D4D4D8]">{vt.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {vt.values.map(val => (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => setSelectedVariantValues(prev => ({ ...prev, [vt.id]: val.id }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            selectedVariantValues[vt.id] === val.id
                              ? 'bg-[#F59E0B] text-black font-bold border-[#F59E0B]'
                              : 'bg-[#050505] text-[#71717A] border-white/5 hover:text-white'
                          }`}
                        >
                          {val.name} {val.priceDelta > 0 && `(+${formatZAR(val.priceDelta)})`}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {/* Live Pricing Formula */}
            {modalCalculatedLine && (
              <div className="bg-[#050505] p-3 rounded-xl border border-white/5 text-xs space-y-1">
                <div className="flex justify-between text-[#71717A]">
                  <span>Base Price ({productQuantity} units):</span>
                  <span>{formatZAR(modalCalculatedLine.totalBasePriceBeforeDiscount)}</span>
                </div>
                {modalCalculatedLine.appliedVolumeDiscountPercent > 0 && (
                  <div className="flex justify-between text-green-500 font-semibold">
                    <span>Volume Discount ({modalCalculatedLine.appliedVolumeDiscountPercent}% off base):</span>
                    <span>-{formatZAR(modalCalculatedLine.totalBaseDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white text-sm pt-1 border-t border-white/5">
                  <span>Line Total:</span>
                  <span className="text-[#F59E0B]">{formatZAR(modalCalculatedLine.lineTotal)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveProduct(null)}
                className="px-4 py-2 bg-[#050505] text-[#71717A] hover:text-white text-xs font-semibold rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                className="px-6 py-2 bg-[#F59E0B] hover:bg-amber-400 text-black text-xs font-bold rounded-full shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add to Quote
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
