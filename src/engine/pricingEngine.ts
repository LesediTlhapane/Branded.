import {
  Product,
  QuoteLineItem,
  SelectedVariant,
  VolumeDiscountTier,
  Role,
} from '../types';

export interface LineItemCalculationInput {
  product: Product;
  selectedVariants: SelectedVariant[];
  quantity: number;
}

export interface QuoteCalculationResult {
  lineItems: QuoteLineItem[];
  subtotal: number;
  totalVolumeDiscountAmount: number;
  manualDiscountAmount: number;
  requestedManualDiscount: number;
  cappedManualDiscount: number;
  wasCappedByCeiling: boolean;
  finalTotal: number;
}

/**
 * Determines the volume discount percentage for a single line item based on item quantity.
 */
export function getVolumeDiscountPercent(quantity: number, tiers: VolumeDiscountTier[]): number {
  if (!tiers || tiers.length === 0 || quantity <= 0) return 0;

  // Sort tiers ascending by minQuantity
  const sorted = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);
  let matchedPercent = 0;

  for (const tier of sorted) {
    if (quantity >= tier.minQuantity) {
      if (tier.maxQuantity === null || quantity <= tier.maxQuantity) {
        matchedPercent = tier.discountPercentage;
      }
    }
  }

  return matchedPercent;
}

/**
 * CRITICAL PRICING ENGINE FUNCTION
 * Calculates a single quote line item ensuring:
 * 1. Volume discount applies ONLY to base price.
 * 2. Variant price deltas are NEVER discounted.
 */
export function calculateLineItem(input: LineItemCalculationInput): QuoteLineItem {
  const { product, selectedVariants, quantity } = input;
  const validQty = Math.max(1, quantity);

  // 1. Base unit price snapshot
  const baseUnitPrice = product.basePrice >= 0 ? product.basePrice : 0;

  // 2. Determine applicable volume discount % based ONLY on this single line item's quantity
  const appliedVolumeDiscountPercent = getVolumeDiscountPercent(validQty, product.volumeTiers);

  // 3. Discounted base unit price = baseUnitPrice * (1 - discount%)
  const discountedBaseUnitPrice = baseUnitPrice * (1 - appliedVolumeDiscountPercent / 100);

  // 4. Sum of variant price deltas (FULL PRICE, NEVER DISCOUNTED)
  const totalVariantDeltaUnitPrice = selectedVariants.reduce((sum, v) => sum + Math.max(0, v.priceDelta), 0);

  // 5. Effective unit price for display
  const effectiveUnitPrice = discountedBaseUnitPrice + totalVariantDeltaUnitPrice;

  // 6. Totals
  const totalBasePriceBeforeDiscount = baseUnitPrice * validQty;
  const totalBaseDiscountAmount = (baseUnitPrice - discountedBaseUnitPrice) * validQty;
  const totalVariantPrice = totalVariantDeltaUnitPrice * validQty;
  
  // CRITICAL FORMULA: (Discounted Base × Qty) + (Variant Deltas × Qty)
  const lineTotal = (discountedBaseUnitPrice * validQty) + totalVariantPrice;

  return {
    id: `li_${Math.random().toString(36).substring(2, 9)}`,
    productId: product.id,
    productSkuSnapshot: product.sku,
    productNameSnapshot: product.name,
    productImageSnapshot: product.images[0] || '',
    selectedVariants,
    quantity: validQty,
    baseUnitPrice,
    appliedVolumeDiscountPercent,
    discountedBaseUnitPrice,
    totalVariantDeltaUnitPrice,
    effectiveUnitPrice,
    totalBasePriceBeforeDiscount,
    totalBaseDiscountAmount,
    totalVariantPrice,
    lineTotal,
  };
}

/**
 * Calculates overall quote totals, applying flat manual discount after volume pricing and enforcing staff ceiling.
 */
export function calculateQuoteTotals(
  lineItems: QuoteLineItem[],
  manualDiscountInput: number,
  userRole: Role | 'CUSTOMER',
  staffDiscountCeiling: number
): QuoteCalculationResult {
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalVolumeDiscountAmount = lineItems.reduce((sum, item) => sum + item.totalBaseDiscountAmount, 0);

  // Customers cannot apply manual discounts
  if (userRole === 'CUSTOMER') {
    return {
      lineItems,
      subtotal,
      totalVolumeDiscountAmount,
      manualDiscountAmount: 0,
      requestedManualDiscount: 0,
      cappedManualDiscount: 0,
      wasCappedByCeiling: false,
      finalTotal: subtotal,
    };
  }

  const requestedDiscount = Math.max(0, manualDiscountInput);
  let effectiveDiscount = requestedDiscount;
  let wasCapped = false;

  // Staff members are capped by global discount ceiling
  if (userRole === 'STAFF' && requestedDiscount > staffDiscountCeiling) {
    effectiveDiscount = staffDiscountCeiling;
    wasCapped = true;
  }

  // Final total cannot be negative (floor at 0)
  const finalTotal = Math.max(0, subtotal - effectiveDiscount);

  return {
    lineItems,
    subtotal,
    totalVolumeDiscountAmount,
    manualDiscountAmount: effectiveDiscount,
    requestedManualDiscount: requestedDiscount,
    cappedManualDiscount: effectiveDiscount,
    wasCappedByCeiling: wasCapped,
    finalTotal,
  };
}
