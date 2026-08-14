/**
 * Core Domain Types for Branded Products Quote Platform
 */

export type Role = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  requiresPasswordChange: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  vatNumber?: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId: string | null; // Null means top-level category
  isActive: boolean;
  slug: string;
  children?: Category[];
}

export interface VolumeDiscountTier {
  id: string;
  minQuantity: number;
  maxQuantity: number | null; // null means unbounded (e.g. 100+)
  discountPercentage: number; // e.g. 10 for 10%
}

export interface VariantValue {
  id: string;
  name: string; // e.g., "XL", "Navy Blue", "Full Front Screen Print"
  skuSuffix: string;
  priceDelta: number; // Must be >= 0
  imageUrl?: string;
}

export interface VariantType {
  id: string;
  name: string; // e.g., "Size", "Colour", "Branding Method"
  isReusable: boolean; // Reusable vs Product-Specific
  productId?: string; // Set if product-specific
  values: VariantValue[];
}

export interface ProductVariantTypeRelation {
  variantTypeId: string;
}

export interface Product {
  id: string;
  sku: string; // Non-unique as per requirement
  name: string;
  description: string;
  basePrice: number; // Must be >= 0
  categoryId: string;
  isActive: boolean;
  images: string[]; // Up to 3 images
  volumeTiers: VolumeDiscountTier[];
  variantTypeIds: string[]; // Attached reusable variant types
  productSpecificVariantTypes?: VariantType[]; // One-off variants
  createdAt: string;
  updatedAt: string;
}

export interface SelectedVariant {
  variantTypeId: string;
  variantTypeName: string;
  variantValueId: string;
  variantValueName: string;
  priceDelta: number;
}

export interface QuoteLineItem {
  id: string;
  productId: string;
  productSkuSnapshot: string;
  productNameSnapshot: string;
  productImageSnapshot?: string;
  selectedVariants: SelectedVariant[];
  quantity: number;
  baseUnitPrice: number; // Snapshot of base price
  appliedVolumeDiscountPercent: number; // Snapshot of volume discount %
  discountedBaseUnitPrice: number; // baseUnitPrice * (1 - volumeDiscountPercent/100)
  totalVariantDeltaUnitPrice: number; // Sum of priceDeltas (FULL PRICE)
  effectiveUnitPrice: number; // discountedBaseUnitPrice + totalVariantDeltaUnitPrice
  totalBasePriceBeforeDiscount: number; // baseUnitPrice * quantity
  totalBaseDiscountAmount: number; // (baseUnitPrice - discountedBaseUnitPrice) * quantity
  totalVariantPrice: number; // totalVariantDeltaUnitPrice * quantity
  lineTotal: number; // (discountedBaseUnitPrice * quantity) + totalVariantPrice
}

export type QuoteStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'SUPERSEDED';

export interface QuoteVersion {
  versionNumber: number;
  createdAt: string;
  createdByRole: Role | 'CUSTOMER';
  createdByName: string;
  createdByEmail: string;
  status: QuoteStatus;
  lineItems: QuoteLineItem[];
  subtotal: number; // Sum of line totals
  totalVolumeDiscountAmount: number; // Sum of all volume discount savings
  manualDiscountAmount: number; // Flat ZAR discount applied to whole quote
  flaggedForAdminAttention: boolean;
  flagReason?: string;
  finalTotal: number; // max(0, subtotal - manualDiscountAmount)
  notes?: string;
}

export interface Quote {
  id: string;
  referenceNumber: string;
  customerId?: string;
  customerEmail: string;
  customerEmailHash: string; // Salted hash for secure retrieval comparison
  customerName: string;
  customerPhone?: string;
  customerCompany?: string;
  validityDays: number;
  expiresAt: string;
  terms: string;
  currentVersionNumber: number;
  status: QuoteStatus; // Reflects current valid version status
  versions: QuoteVersion[];
  createdAt: string;
  updatedAt: string;
}

export type RefPattern = 'ALPHANUMERIC' | 'DATE_SUFFIX' | 'AMBIGUITY_SAFE';

export interface QuoteSettings {
  staffDiscountCeiling: number; // e.g. 500 ZAR
  quoteValidityDays: number; // e.g. 30
  termsAndConditions: string;
  senderEmail: string;
  senderName: string;
  refPrefix: string; // e.g. "QS-"
  refPattern: RefPattern;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyVatNumber: string;
}

export interface EmailLog {
  id: string;
  quoteId: string;
  referenceNumber: string;
  recipientEmail: string;
  subject: string;
  htmlContent: string;
  sentAt: string;
  status: 'SENT' | 'FAILED';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
