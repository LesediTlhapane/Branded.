/**
 * External Integration Abstraction Service
 * 
 * Satisfies Architectural Requirement 2 & 29:
 * - This service provides a clean interface abstraction for future external ERP / CRM / Payment / Logistics APIs.
 * - The external API/service has not yet been identified.
 * - Currently uses mock implementations so the application works 100% locally out of the box without external credentials.
 * - Connect the real API implementation when external API specification/credentials are provided.
 */

export interface ExternalSyncResult {
  success: boolean;
  externalRefId?: string;
  syncedAt: string;
  message: string;
}

export class ExternalIntegrationService {
  /**
   * TODO: Connect external ERP / CRM integration (e.g. Sage, Xero, SAP B1) when API specification is provided.
   */
  static async syncQuoteToExternalERP(quoteId: string): Promise<ExternalSyncResult> {
    console.log(`[Mock ExternalIntegrationService] Syncing quote ${quoteId} to external ERP system...`);
    
    // Simulate API network latency
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      success: true,
      externalRefId: `ERP_SYNC_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      syncedAt: new Date().toISOString(),
      message: 'Mock ERP Synchronization completed successfully. No external API credentials required for v1.',
    };
  }

  /**
   * TODO: Connect external Payment Gateway (e.g. PayFast, Ozow, Yoco) when API credentials are provided.
   */
  static async initiateQuoteDepositPayment(quoteId: string, depositAmount: number): Promise<{ success: boolean; redirectUrl?: string; message: string }> {
    console.log(`[Mock ExternalIntegrationService] Initiating deposit payment of R${depositAmount} for quote ${quoteId}...`);

    return {
      success: true,
      redirectUrl: '#mock-payment-success',
      message: 'Mock deposit payment link generated. Payment integration ready for production credentials.',
    };
  }
}
