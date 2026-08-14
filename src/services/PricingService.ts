import { QuoteLineItem, SelectedVariant, Product, Role } from '../types';
import { calculateLineItem, calculateQuoteTotals, LineItemCalculationInput, QuoteCalculationResult } from '../engine/pricingEngine';
import { SettingsService } from './SettingsService';

export class PricingService {
  /**
   * Pricing Calculation Service Wrapper.
   * Ensures critical business rule: volume discount ONLY applies to base price; variant deltas full price.
   */

  static calculateLine(product: Product, selectedVariants: SelectedVariant[], quantity: number): QuoteLineItem {
    const input: LineItemCalculationInput = {
      product,
      selectedVariants,
      quantity,
    };
    return calculateLineItem(input);
  }

  static calculateTotals(lineItems: QuoteLineItem[], manualDiscount: number, userRole: Role | 'CUSTOMER'): QuoteCalculationResult {
    const settings = SettingsService.getSettings();
    return calculateQuoteTotals(lineItems, manualDiscount, userRole, settings.staffDiscountCeiling);
  }
}
