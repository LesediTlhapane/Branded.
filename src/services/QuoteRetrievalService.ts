import { Quote, QuoteVersion } from '../types';
import { Repository } from '../db/storage';
import { verifyEmailHash } from '../utils/hash';

interface RateLimitTracker {
  attempts: number;
  blockedUntil: number | null;
}

const RATE_LIMIT_STORE = new Map<string, RateLimitTracker>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export class QuoteRetrievalService {
  /**
   * Secure Customer Quote Retrieval Service.
   * TODO: Connect real backend Quote Retrieval API when API specification is provided.
   */

  static async retrieveCustomerQuote(
    referenceNumber: string,
    emailInput: string,
    ipOrClientKey: string = 'client_local'
  ): Promise<{ success: boolean; message: string; quote?: Quote; validVersion?: QuoteVersion }> {
    const cleanRef = referenceNumber.trim().toUpperCase();
    const cleanEmail = emailInput.trim().toLowerCase();

    const rateKey = `${ipOrClientKey}_${cleanRef}`;
    const now = Date.now();

    // 1. Check Rate Limit
    const rateLimit = RATE_LIMIT_STORE.get(rateKey);
    if (rateLimit && rateLimit.blockedUntil && now < rateLimit.blockedUntil) {
      const remainingMins = Math.ceil((rateLimit.blockedUntil - now) / 60000);
      return {
        success: false,
        message: `Too many failed retrieval attempts. Please try again in ${remainingMins} minute(s).`,
      };
    }

    // Generic error message - NEVER reveal which field failed
    const GENERIC_ERROR = 'Reference number or email address not recognized.';

    if (!cleanRef || !cleanEmail) {
      return { success: false, message: GENERIC_ERROR };
    }

    // 2. Fetch quote by reference
    const quotes = Repository.getQuotes();
    const foundQuote = quotes.find(q => q.referenceNumber === cleanRef);

    if (!foundQuote) {
      this.recordFailedAttempt(rateKey);
      return { success: false, message: GENERIC_ERROR };
    }

    // 3. Verify salted email hash comparison
    const isEmailValid = await verifyEmailHash(cleanEmail, foundQuote.customerEmailHash);

    if (!isEmailValid) {
      this.recordFailedAttempt(rateKey);
      return { success: false, message: GENERIC_ERROR };
    }

    // Success! Reset rate limit
    RATE_LIMIT_STORE.delete(rateKey);

    // Get latest active/valid version
    const validVersion =
      foundQuote.versions.find(v => v.versionNumber === foundQuote.currentVersionNumber) ||
      foundQuote.versions[foundQuote.versions.length - 1];

    return {
      success: true,
      message: 'Quote verified and retrieved successfully.',
      quote: foundQuote,
      validVersion,
    };
  }

  private static recordFailedAttempt(rateKey: string): void {
    const now = Date.now();
    const current = RATE_LIMIT_STORE.get(rateKey) || { attempts: 0, blockedUntil: null };
    current.attempts += 1;

    if (current.attempts >= MAX_FAILED_ATTEMPTS) {
      current.blockedUntil = now + LOCKOUT_DURATION_MS;
    }

    RATE_LIMIT_STORE.set(rateKey, current);
  }
}
