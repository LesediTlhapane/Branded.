import {
  Quote,
  QuoteVersion,
  QuoteLineItem,
  QuoteStatus,
  Role,
} from '../types';
import { Repository } from '../db/storage';
import { SettingsService } from './SettingsService';
import { EmailService } from './EmailService';
import { calculateQuoteTotals } from '../engine/pricingEngine';
import { generateReferenceNumber } from '../utils/reference';
import { hashEmail } from '../utils/hash';

export interface CreateQuoteInput {
  customerId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerCompany?: string;
  lineItems: QuoteLineItem[];
  manualDiscountAmount?: number;
  flaggedForAdminAttention?: boolean;
  flagReason?: string;
  createdByRole: Role | 'CUSTOMER';
  createdByName: string;
  createdByEmail: string;
  notes?: string;
  submitImmediately?: boolean;
}

export interface UpdateQuoteInput {
  quoteId: string;
  baseVersionNumber: number; // For concurrency check
  lineItems: QuoteLineItem[];
  manualDiscountAmount?: number;
  flaggedForAdminAttention?: boolean;
  flagReason?: string;
  createdByRole: Role | 'CUSTOMER';
  createdByName: string;
  createdByEmail: string;
  notes?: string;
  submitImmediately?: boolean;
}

export class QuoteService {
  /**
   * Quote Lifecycle & Versioning Service.
   * TODO: Connect real Quote API backend when API specification is provided.
   */

  static getAllQuotes(): Quote[] {
    return Repository.getQuotes();
  }

  static getQuoteById(id: string): Quote | undefined {
    return Repository.getQuotes().find(q => q.id === id);
  }

  static getQuoteByRef(ref: string): Quote | undefined {
    return Repository.getQuotes().find(
      q => q.referenceNumber.toLowerCase() === ref.trim().toLowerCase()
    );
  }

  static deleteQuote(id: string): { success: boolean; message: string } {
    let quotes = Repository.getQuotes();
    const initialLen = quotes.length;
    quotes = quotes.filter(q => q.id !== id);
    Repository.saveQuotes(quotes);
    if (quotes.length < initialLen) {
      return { success: true, message: 'Quote deleted successfully.' };
    }
    return { success: false, message: 'Quote not found.' };
  }

  /**
   * Creates a new Quote with Version 1.
   */
  static async createQuote(input: CreateQuoteInput): Promise<{
    success: boolean;
    message: string;
    quote?: Quote;
    wasDiscountCapped?: boolean;
  }> {
    if (!input.customerEmail || !input.customerEmail.includes('@')) {
      return { success: false, message: 'Valid customer email is required.' };
    }

    if (!input.lineItems || input.lineItems.length === 0) {
      return { success: false, message: 'Quote must contain at least one line item.' };
    }

    const settings = SettingsService.getSettings();

    // Calculate totals & check discount ceiling
    const totals = calculateQuoteTotals(
      input.lineItems,
      input.manualDiscountAmount || 0,
      input.createdByRole,
      settings.staffDiscountCeiling
    );

    const refNumber = generateReferenceNumber(settings.refPrefix, settings.refPattern);
    const emailHash = await hashEmail(input.customerEmail);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + settings.quoteValidityDays * 86400000).toISOString();

    const initialStatus: QuoteStatus = input.submitImmediately ? 'SUBMITTED' : 'DRAFT';

    const version1: QuoteVersion = {
      versionNumber: 1,
      createdAt: now.toISOString(),
      createdByRole: input.createdByRole,
      createdByName: input.createdByName,
      createdByEmail: input.createdByEmail,
      status: initialStatus,
      lineItems: totals.lineItems,
      subtotal: totals.subtotal,
      totalVolumeDiscountAmount: totals.totalVolumeDiscountAmount,
      manualDiscountAmount: totals.manualDiscountAmount,
      flaggedForAdminAttention: !!input.flaggedForAdminAttention,
      flagReason: input.flagReason,
      finalTotal: totals.finalTotal,
      notes: input.notes,
    };

    // Ensure customer exists in Customer Repository so they appear under "Customers"
    const customers = Repository.getCustomers();
    const cleanEmail = input.customerEmail.trim().toLowerCase();
    let existingCust = customers.find(c => c.email.trim().toLowerCase() === cleanEmail);
    let assignedCustomerId = input.customerId || existingCust?.id;

    if (!existingCust) {
      const newCustId = `cust_${Math.random().toString(36).substring(2, 9)}`;
      const newCustomer = {
        id: newCustId,
        companyName: input.customerCompany?.trim() || input.customerName.trim() || 'Direct Customer',
        contactName: input.customerName.trim() || 'Valued Customer',
        email: cleanEmail,
        phone: input.customerPhone?.trim() || '+27 00 000 0000',
        address: {
          street: 'Online Quote Portal Submission',
          city: 'Johannesburg',
          province: 'Gauteng',
          postalCode: '2000',
        },
        createdAt: now.toISOString(),
      };
      customers.unshift(newCustomer);
      Repository.saveCustomers(customers);
      assignedCustomerId = newCustId;
    } else {
      let updated = false;
      if (input.customerCompany && (!existingCust.companyName || existingCust.companyName === 'Direct Customer')) {
        existingCust.companyName = input.customerCompany.trim();
        updated = true;
      }
      if (input.customerPhone && (!existingCust.phone || existingCust.phone === '+27 00 000 0000')) {
        existingCust.phone = input.customerPhone.trim();
        updated = true;
      }
      if (updated) {
        Repository.saveCustomers(customers);
      }
    }

    const newQuote: Quote = {
      id: `q_${Math.random().toString(36).substring(2, 9)}`,
      referenceNumber: refNumber,
      customerId: assignedCustomerId,
      customerEmail: cleanEmail,
      customerEmailHash: emailHash,
      customerName: input.customerName.trim() || 'Valued Customer',
      customerPhone: input.customerPhone?.trim(),
      customerCompany: input.customerCompany?.trim(),
      validityDays: settings.quoteValidityDays,
      expiresAt,
      terms: settings.termsAndConditions,
      currentVersionNumber: 1,
      status: initialStatus,
      versions: [version1],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const quotes = Repository.getQuotes();
    quotes.unshift(newQuote);
    Repository.saveQuotes(quotes);

    // Trigger email if submitted
    if (initialStatus === 'SUBMITTED') {
      await EmailService.sendQuoteEmail(newQuote, version1, settings);
    }

    return {
      success: true,
      message: `Quote ${refNumber} created successfully (${initialStatus}).`,
      quote: newQuote,
      wasDiscountCapped: totals.wasCappedByCeiling,
    };
  }

  /**
   * Versioning & Concurrency Edit Handler.
   * Requirement 20 & 21:
   * - Edits create a NEW draft version (e.g., Version 2).
   * - The original version stays valid until the new version is submitted.
   * - Concurrency check: If baseVersionNumber is no longer the latest submitted version, reject with concurrency warning.
   */
  static async createNewQuoteVersion(input: UpdateQuoteInput): Promise<{
    success: boolean;
    message: string;
    quote?: Quote;
    isConcurrencyConflict?: boolean;
    wasDiscountCapped?: boolean;
  }> {
    const quotes = Repository.getQuotes();
    const targetIndex = quotes.findIndex(q => q.id === input.quoteId);

    if (targetIndex === -1) {
      return { success: false, message: 'Quote not found.' };
    }

    const existingQuote = quotes[targetIndex];

    // CONCURRENCY CHECK (Requirement 21)
    if (input.baseVersionNumber < existingQuote.currentVersionNumber) {
      return {
        success: false,
        isConcurrencyConflict: true,
        message: `Concurrency Warning: Quote ${existingQuote.referenceNumber} has already been updated to Version ${existingQuote.currentVersionNumber} by staff. Please reload to review the latest changes.`,
      };
    }

    const settings = SettingsService.getSettings();

    const totals = calculateQuoteTotals(
      input.lineItems,
      input.manualDiscountAmount || 0,
      input.createdByRole,
      settings.staffDiscountCeiling
    );

    const nextVersionNumber = existingQuote.versions.length + 1;
    const now = new Date();
    const isSubmitting = !!input.submitImmediately;

    const newVersionStatus: QuoteStatus = isSubmitting ? 'SUBMITTED' : 'DRAFT';

    const newVersion: QuoteVersion = {
      versionNumber: nextVersionNumber,
      createdAt: now.toISOString(),
      createdByRole: input.createdByRole,
      createdByName: input.createdByName,
      createdByEmail: input.createdByEmail,
      status: newVersionStatus,
      lineItems: totals.lineItems,
      subtotal: totals.subtotal,
      totalVolumeDiscountAmount: totals.totalVolumeDiscountAmount,
      manualDiscountAmount: totals.manualDiscountAmount,
      flaggedForAdminAttention: !!input.flaggedForAdminAttention,
      flagReason: input.flagReason,
      finalTotal: totals.finalTotal,
      notes: input.notes,
    };

    existingQuote.versions.push(newVersion);

    if (isSubmitting) {
      // Mark previous valid versions as SUPERSEDED
      existingQuote.versions.forEach(v => {
        if (v.versionNumber !== nextVersionNumber && (v.status === 'SUBMITTED' || v.status === 'ACCEPTED')) {
          v.status = 'SUPERSEDED';
        }
      });

      existingQuote.currentVersionNumber = nextVersionNumber;
      existingQuote.status = 'SUBMITTED';
    }

    existingQuote.updatedAt = now.toISOString();
    quotes[targetIndex] = existingQuote;
    Repository.saveQuotes(quotes);

    if (isSubmitting) {
      await EmailService.sendQuoteEmail(existingQuote, newVersion, settings);
    }

    return {
      success: true,
      message: isSubmitting
        ? `Quote ${existingQuote.referenceNumber} Version ${nextVersionNumber} submitted successfully! (Previous version superseded).`
        : `Draft Version ${nextVersionNumber} saved for Quote ${existingQuote.referenceNumber}. Original version remains active until submission.`,
      quote: existingQuote,
      wasDiscountCapped: totals.wasCappedByCeiling,
    };
  }

  /**
   * Status change helper (e.g. Accept / Reject).
   */
  static updateQuoteStatus(quoteId: string, newStatus: 'ACCEPTED' | 'REJECTED'): { success: boolean; message: string; quote?: Quote } {
    const quotes = Repository.getQuotes();
    const target = quotes.find(q => q.id === quoteId);

    if (!target) return { success: false, message: 'Quote not found.' };

    target.status = newStatus;
    const currentVer = target.versions.find(v => v.versionNumber === target.currentVersionNumber);
    if (currentVer) {
      currentVer.status = newStatus;
    }

    target.updatedAt = new Date().toISOString();
    Repository.saveQuotes(quotes);

    return {
      success: true,
      message: `Quote ${target.referenceNumber} status changed to ${newStatus}.`,
      quote: target,
    };
  }
}
