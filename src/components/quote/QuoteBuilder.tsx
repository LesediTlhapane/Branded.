import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Save,
  Send,
  Flag,
  ShieldAlert,
  Package,
  Layers,
  Sparkles,
  User,
  Building,
  Mail,
  Phone,
} from 'lucide-react';
import {
  Product,
  QuoteLineItem,
  SelectedVariant,
  Customer,
  Quote,
  QuoteVersion,
} from '../../types';
import { ProductService } from '../../services/ProductService';
import { CustomerService } from '../../services/CustomerService';
import { SettingsService } from '../../services/SettingsService';
import { PricingService } from '../../services/PricingService';
import { QuoteService } from '../../services/QuoteService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { formatZAR } from '../../utils/currency';

interface Props {
  initialQuoteToEdit?: Quote | null;
  onSuccess: (savedQuote: Quote, version: QuoteVersion) => void;
  onCancel: () => void;
}

export const QuoteBuilder: React.FC<Props> = ({
  initialQuoteToEdit,
  onSuccess,
  onCancel,
}) => {
  const { user, role } = useAuth();
  const { showToast } = useNotification();

  const settings = SettingsService.getSettings();

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(ProductService.getAllCategories());
  const [variants, setVariants] = useState(ProductService.getAllVariants());
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Selection & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  // Customer Info State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');

  // Quote Line Items State
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);

  // Manual Discount & Flagging
  const [manualDiscountInput, setManualDiscountInput] = useState<number>(0);
  const [flaggedForAdmin, setFlaggedForAdmin] = useState<boolean>(false);
  const [flagReason, setFlagReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Active Product Selection Modal/Drawer State
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedVariantValues, setSelectedVariantValues] = useState<Record<string, string>>({});
  const [productQuantity, setProductQuantity] = useState<number>(10);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setProducts(ProductService.getAllProducts(false));
    setCustomers(CustomerService.getAllCustomers());

    if (initialQuoteToEdit) {
      const activeVer = initialQuoteToEdit.versions.find(
        v => v.versionNumber === initialQuoteToEdit.currentVersionNumber
      ) || initialQuoteToEdit.versions[initialQuoteToEdit.versions.length - 1];

      setCustomerEmail(initialQuoteToEdit.customerEmail);
      setCustomerName(initialQuoteToEdit.customerName);
      setCustomerPhone(initialQuoteToEdit.customerPhone || '');
      setCustomerCompany(initialQuoteToEdit.customerCompany || '');
      setLineItems(activeVer.lineItems);
      setManualDiscountInput(activeVer.manualDiscountAmount);
      setFlaggedForAdmin(activeVer.flaggedForAdminAttention);
      setFlagReason(activeVer.flagReason || '');
      setNotes(activeVer.notes || '');
    }
  }, [initialQuoteToEdit]);

  // Handle Customer Select
  const handleSelectCustomer = (custId: string) => {
    const found = customers.find(c => c.id === custId);
    if (found) {
      setSelectedCustomer(found);
      setCustomerEmail(found.email);
      setCustomerName(found.contactName);
      setCustomerCompany(found.companyName);
      setCustomerPhone(found.phone);
    }
  };

  // Open product configuration modal
  const handleOpenProductModal = (product: Product) => {
    setActiveProduct(product);
    setProductQuantity(25);

    const defaults: Record<string, string> = {};
    const attachedVariantTypes = variants.filter(v => product.variantTypeIds.includes(v.id));
    attachedVariantTypes.forEach(vt => {
      if (vt.values.length > 0) {
        defaults[vt.id] = vt.values[0].id;
      }
    });

    if (product.productSpecificVariantTypes) {
      product.productSpecificVariantTypes.forEach(pvt => {
        if (pvt.values.length > 0) {
          defaults[pvt.id] = pvt.values[0].id;
        }
      });
    }

    setSelectedVariantValues(defaults);
  };

  // Calculate live preview for product being configured
  const getModalConfiguredLineItem = (): QuoteLineItem | null => {
    if (!activeProduct) return null;

    const chosenVariants: SelectedVariant[] = [];

    const attachedTypes = variants.filter(v => activeProduct.variantTypeIds.includes(v.id));
    attachedTypes.forEach(vt => {
      const selectedValueId = selectedVariantValues[vt.id];
      const matchedVal = vt.values.find(val => val.id === selectedValueId);
      if (matchedVal) {
        chosenVariants.push({
          variantTypeId: vt.id,
          variantTypeName: vt.name,
          variantValueId: matchedVal.id,
          variantValueName: matchedVal.name,
          priceDelta: matchedVal.priceDelta,
        });
      }
    });

    if (activeProduct.productSpecificVariantTypes) {
      activeProduct.productSpecificVariantTypes.forEach(pvt => {
        const selectedValueId = selectedVariantValues[pvt.id];
        const matchedVal = pvt.values.find(val => val.id === selectedValueId);
        if (matchedVal) {
          chosenVariants.push({
            variantTypeId: pvt.id,
            variantTypeName: pvt.name,
            variantValueId: matchedVal.id,
            variantValueName: matchedVal.name,
            priceDelta: matchedVal.priceDelta,
          });
        }
      });
    }

    return PricingService.calculateLine(activeProduct, chosenVariants, productQuantity);
  };

  const handleAddLineItemToQuote = () => {
    const calculated = getModalConfiguredLineItem();
    if (!calculated) return;

    setLineItems(prev => [...prev, calculated]);
    setActiveProduct(null);
    showToast(`Added ${calculated.productNameSnapshot} (${calculated.quantity} units) to quote.`, 'success');
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLineQuantity = (index: number, newQty: number) => {
    const validQty = Math.max(1, newQty);
    setLineItems(prev => {
      const updated = [...prev];
      const current = updated[index];
      const product = products.find(p => p.id === current.productId) || {
        id: current.productId,
        sku: current.productSkuSnapshot,
        name: current.productNameSnapshot,
        basePrice: current.baseUnitPrice,
        volumeTiers: [
          { id: 'def_1', minQuantity: 1, maxQuantity: null, discountPercentage: current.appliedVolumeDiscountPercent },
        ],
        images: [current.productImageSnapshot || ''],
        variantTypeIds: [],
        categoryId: 'cat_tshirts',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      };

      updated[index] = PricingService.calculateLine(product as Product, current.selectedVariants, validQty);
      return updated;
    });
  };

  const quoteTotals = PricingService.calculateTotals(
    lineItems,
    manualDiscountInput,
    role || 'STAFF'
  );

  const isDiscountCappedForStaff =
    role === 'STAFF' && manualDiscountInput > settings.staffDiscountCeiling;

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCatId === 'all' || p.categoryId === selectedCatId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSaveOrSubmitQuote = async (submitImmediately: boolean) => {
    if (!customerEmail || !customerEmail.includes('@')) {
      showToast('A valid Customer Email is required before saving/submitting a quote.', 'error');
      return;
    }

    if (lineItems.length === 0) {
      showToast('Please add at least one line item to the quote.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (initialQuoteToEdit) {
        const res = await QuoteService.createNewQuoteVersion({
          quoteId: initialQuoteToEdit.id,
          baseVersionNumber: initialQuoteToEdit.currentVersionNumber,
          lineItems,
          manualDiscountAmount: manualDiscountInput,
          flaggedForAdminAttention: flaggedForAdmin,
          flagReason,
          createdByRole: role || 'STAFF',
          createdByName: user?.name || 'Staff User',
          createdByEmail: user?.email || 'staff@brandedsolutions.co.za',
          notes,
          submitImmediately,
        });

        if (res.isConcurrencyConflict) {
          showToast(res.message, 'error');
          setIsSubmitting(false);
          return;
        }

        if (res.success && res.quote) {
          const activeVer = res.quote.versions.find(
            v => v.versionNumber === res.quote?.currentVersionNumber
          ) || res.quote.versions[res.quote.versions.length - 1];

          showToast(res.message, 'success');
          onSuccess(res.quote, activeVer);
        } else {
          showToast(res.message || 'Error updating quote.', 'error');
        }
      } else {
        const res = await QuoteService.createQuote({
          customerEmail,
          customerName: customerName || 'Valued Customer',
          customerPhone,
          customerCompany,
          lineItems,
          manualDiscountAmount: manualDiscountInput,
          flaggedForAdminAttention: flaggedForAdmin,
          flagReason,
          createdByRole: role || 'STAFF',
          createdByName: user?.name || 'Staff User',
          createdByEmail: user?.email || 'staff@brandedsolutions.co.za',
          notes,
          submitImmediately,
        });

        if (res.success && res.quote) {
          const activeVer = res.quote.versions[0];
          showToast(res.message, 'success');
          onSuccess(res.quote, activeVer);
        } else {
          showToast(res.message || 'Error creating quote.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Unexpected error saving quote.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalCalculatedLine = getModalConfiguredLineItem();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#F59E0B] bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest">
              {initialQuoteToEdit ? `Editing Quote ${initialQuoteToEdit.referenceNumber}` : 'New Quote Workspace'}
            </span>
          </div>
          <h1 className="text-2xl font-serif italic text-white mt-1">
            {initialQuoteToEdit ? `Quote ${initialQuoteToEdit.referenceNumber}` : 'Build Merchandise Quotation'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-[#0F0F0F] hover:bg-white/5 text-[#71717A] hover:text-white text-xs font-semibold rounded-full transition-colors border border-white/5"
          >
            Cancel
          </button>

          <button
            onClick={() => handleSaveOrSubmitQuote(false)}
            disabled={isSubmitting || lineItems.length === 0}
            className="px-4 py-2 bg-[#0F0F0F] hover:bg-white/5 text-white text-xs font-semibold rounded-full transition-colors border border-white/10 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>

          <button
            onClick={() => handleSaveOrSubmitQuote(true)}
            disabled={isSubmitting || lineItems.length === 0}
            className="px-6 py-2 bg-[#F59E0B] hover:bg-amber-400 text-black text-xs font-bold rounded-full transition-all shadow-lg shadow-amber-500/10 flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Processing...' : 'Submit & Email Customer'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Customer Info & Selected Line Items */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customer Selection Card */}
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4 text-[#F59E0B]" />
                Customer Details
              </h2>

              {customers.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#71717A]">Existing:</span>
                  <select
                    onChange={e => handleSelectCustomer(e.target.value)}
                    className="bg-[#050505] text-xs text-white border border-white/10 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.contactName})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#71717A] mb-1">
                  Customer Email *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="client@company.co.za"
                    className="w-full pl-8 pr-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#71717A] mb-1">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Thabo Mokoena"
                  className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#71717A] mb-1">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerCompany}
                    onChange={e => setCustomerCompany(e.target.value)}
                    placeholder="Nedbank Events"
                    className="w-full pl-8 pr-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#71717A] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+27 82 000 0000"
                    className="w-full pl-8 pr-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selected Quote Line Items */}
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#F59E0B]" />
                Quote Line Items ({lineItems.length})
              </h2>
            </div>

            {lineItems.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/10 rounded-xl bg-[#050505]">
                <Package className="w-10 h-10 text-[#71717A] mx-auto mb-2" />
                <p className="text-xs font-semibold text-white">No items added to quote</p>
                <p className="text-[11px] text-[#71717A] mt-1">
                  Select products from catalog on the right to configure variants and volume discounts.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lineItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 bg-[#050505] border border-white/5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {item.productImageSnapshot ? (
                        <img
                          src={item.productImageSnapshot}
                          alt={item.productNameSnapshot}
                          className="w-12 h-12 object-cover rounded-lg border border-white/5 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-[#71717A] shrink-0 font-bold text-xs">
                          {item.productSkuSnapshot}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{item.productNameSnapshot}</h4>
                          <span className="text-[10px] font-mono text-[#F59E0B] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {item.productSkuSnapshot}
                          </span>
                        </div>

                        {item.selectedVariants.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {item.selectedVariants.map((v, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-white/5 text-[#D4D4D8] px-2 py-0.5 rounded border border-white/10"
                              >
                                {v.variantTypeName}: <strong>{v.variantValueName}</strong>
                                {v.priceDelta > 0 && ` (+${formatZAR(v.priceDelta)})`}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-[#71717A]">
                          <span>Base: <strong className="text-white">{formatZAR(item.baseUnitPrice)}</strong></span>
                          {item.appliedVolumeDiscountPercent > 0 && (
                            <span className="text-green-500 font-semibold bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                              -{item.appliedVolumeDiscountPercent}% Vol Discount
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Line Total */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div>
                        <label className="block text-[10px] text-[#71717A] mb-0.5">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleUpdateLineQuantity(idx, parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 bg-[#0F0F0F] border border-white/10 rounded-lg text-xs font-bold text-white text-center focus:outline-none focus:border-[#F59E0B]"
                        />
                      </div>

                      <div className="text-right">
                        <label className="block text-[10px] text-[#71717A] mb-0.5">Total</label>
                        <div className="text-sm font-bold text-white">{formatZAR(item.lineTotal)}</div>
                      </div>

                      <button
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-2 text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals Breakdown */}
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              Financial Breakdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#71717A] mb-1">
                    Manual Flat Discount (ZAR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={manualDiscountInput}
                    onChange={e => setManualDiscountInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#050505] border border-white/10 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-[#F59E0B]"
                  />
                  {isDiscountCappedForStaff && (
                    <p className="text-[11px] text-amber-500 mt-1 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Discount exceeds staff limit ({formatZAR(settings.staffDiscountCeiling)}).
                    </p>
                  )}
                </div>

                <div className="p-3 bg-[#050505] rounded-xl border border-white/5 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flaggedForAdmin}
                      onChange={e => setFlaggedForAdmin(e.target.checked)}
                      className="w-4 h-4 rounded text-[#F59E0B] focus:ring-[#F59E0B] bg-[#0F0F0F] border-white/10"
                    />
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5 text-[#F59E0B]" /> Flag for Admin Attention
                    </span>
                  </label>
                  {flaggedForAdmin && (
                    <input
                      type="text"
                      value={flagReason}
                      onChange={e => setFlagReason(e.target.value)}
                      placeholder="Reason for flagging..."
                      className="w-full px-3 py-1.5 bg-[#0F0F0F] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                    />
                  )}
                </div>
              </div>

              <div className="bg-[#050505] p-5 rounded-xl border border-white/5 flex flex-col justify-between space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#71717A]">
                    <span>Subtotal:</span>
                    <strong className="text-white">{formatZAR(quoteTotals.subtotal)}</strong>
                  </div>
                  {quoteTotals.totalVolumeDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Volume Savings:</span>
                      <strong>-{formatZAR(quoteTotals.totalVolumeDiscountAmount)}</strong>
                    </div>
                  )}
                  {quoteTotals.manualDiscountAmount > 0 && (
                    <div className="flex justify-between text-[#F59E0B]">
                      <span>Manual Discount:</span>
                      <strong>-{formatZAR(quoteTotals.manualDiscountAmount)}</strong>
                    </div>
                  )}
                  <div className="border-t border-white/5 pt-2 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">Final Quote Total:</span>
                    <span className="text-xl font-light text-[#F59E0B]">
                      {formatZAR(quoteTotals.finalTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Product Catalog Browser */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4 text-[#F59E0B]" />
                Catalog Browser
              </h2>
              <span className="text-xs text-[#71717A]">{filteredProducts.length} items</span>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter catalog..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#050505] border border-white/10 rounded-xl text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedCatId('all')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
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
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
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

            {/* Product Cards */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleOpenProductModal(product)}
                  className="p-3 bg-[#050505] border border-white/5 rounded-xl hover:border-white/20 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg border border-white/5 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate group-hover:text-[#F59E0B] transition-colors">
                        {product.name}
                      </div>
                      <div className="text-[10px] text-[#71717A] font-mono mt-0.5">
                        SKU: {product.sku}
                      </div>
                      <div className="text-xs font-bold text-[#F59E0B] mt-1">
                        Base: {formatZAR(product.basePrice)}
                      </div>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 bg-[#0F0F0F] text-white text-xs font-bold rounded-full border border-white/10 transition-colors flex items-center gap-1 shrink-0">
                    <Plus className="w-3.5 h-3.5 text-[#F59E0B]" /> Configure
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* CONFIGURE PRODUCT VARIANTS MODAL */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={activeProduct.images[0]}
                  alt={activeProduct.name}
                  className="w-12 h-12 object-cover rounded-xl border border-white/5"
                />
                <div>
                  <h3 className="text-base font-bold text-white">{activeProduct.name}</h3>
                  <div className="text-xs text-[#71717A] font-mono">
                    SKU: {activeProduct.sku} | Base Price: <strong className="text-[#F59E0B]">{formatZAR(activeProduct.basePrice)}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveProduct(null)}
                className="text-[#71717A] hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#D4D4D8] mb-1">
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

            {/* Variant Type Choices */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
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
                          onClick={() =>
                            setSelectedVariantValues(prev => ({ ...prev, [vt.id]: val.id }))
                          }
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

            {/* Live Pricing Formula Preview */}
            {modalCalculatedLine && (
              <div className="bg-[#050505] p-3 rounded-xl border border-white/5 text-xs space-y-1">
                <div className="flex justify-between text-[#71717A]">
                  <span>Base x {productQuantity}:</span>
                  <span>{formatZAR(modalCalculatedLine.totalBasePriceBeforeDiscount)}</span>
                </div>
                {modalCalculatedLine.appliedVolumeDiscountPercent > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Volume Discount ({modalCalculatedLine.appliedVolumeDiscountPercent}%):</span>
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
                className="px-4 py-2 bg-[#050505] hover:bg-white/5 text-[#71717A] hover:text-white text-xs font-semibold rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLineItemToQuote}
                className="px-6 py-2 bg-[#F59E0B] hover:bg-amber-400 text-black text-xs font-bold rounded-full shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Line to Quote
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
