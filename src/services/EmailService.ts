import { Quote, QuoteVersion, QuoteSettings, EmailLog } from '../types';
import { Repository } from '../db/storage';
import { formatZAR } from '../utils/currency';

export class EmailService {
  /**
   * Quote Email Delivery Service.
   * TODO: Replace mock EmailService with production email provider (e.g., SendGrid, Mailgun, AWS SES)
   * when production credentials and API specification are provided.
   */

  static generateQuoteHtml(quote: Quote, version: QuoteVersion, settings: QuoteSettings): string {
    const validUntilDate = new Date(quote.expiresAt).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const createdDate = new Date(version.createdAt).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const lineItemsHtml = version.lineItems
      .map(
        item => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-size: 14px; color: #1e293b;">
            <div style="font-weight: 600;">${item.productNameSnapshot}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">SKU: ${item.productSkuSnapshot}</div>
            ${
              item.selectedVariants.length > 0
                ? `<div style="font-size: 12px; color: #0284c7; margin-top: 4px;">
                     ${item.selectedVariants.map(v => `${v.variantTypeName}: <strong>${v.variantValueName}</strong>`).join(' | ')}
                   </div>`
                : ''
            }
          </td>
          <td style="padding: 12px; font-size: 14px; color: #334155; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; font-size: 14px; color: #334155; text-align: right;">${formatZAR(item.effectiveUnitPrice)}</td>
          <td style="padding: 12px; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">${formatZAR(item.lineTotal)}</td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quote ${quote.referenceNumber} - ${settings.companyName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a;">
        <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background-color: #0f172a; color: #ffffff; padding: 28px 32px; border-bottom: 4px solid #0284c7;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td>
                  <h1 style="margin: 0; font-size: 22px; font-weight: 700; tracking: -0.5px;">${settings.companyName}</h1>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">${settings.companyAddress} | VAT: ${settings.companyVatNumber}</p>
                </td>
                <td align="right" valign="top">
                  <div style="background-color: #0284c7; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-size: 14px; font-weight: 700;">
                    OFFICIAL QUOTE
                  </div>
                  <div style="font-size: 13px; color: #cbd5e1; margin-top: 6px;">Ref: <strong>${quote.referenceNumber}</strong></div>
                  <div style="font-size: 12px; color: #94a3b8;">v${version.versionNumber}</div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Customer & Details -->
          <div style="padding: 24px 32px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td width="55%" valign="top">
                  <div style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">PREPARED FOR</div>
                  <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px;">${quote.customerName}</div>
                  ${quote.customerCompany ? `<div style="font-size: 14px; color: #334155;">${quote.customerCompany}</div>` : ''}
                  <div style="font-size: 13px; color: #0284c7; margin-top: 2px;">${quote.customerEmail}</div>
                  ${quote.customerPhone ? `<div style="font-size: 13px; color: #64748b;">${quote.customerPhone}</div>` : ''}
                </td>
                <td width="45%" valign="top" align="right">
                  <table border="0" cellspacing="0" cellpadding="4">
                    <tr>
                      <td style="font-size: 13px; color: #64748b; text-align: right;">Quote Date:</td>
                      <td style="font-size: 13px; font-weight: 600; color: #0f172a;">${createdDate}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 13px; color: #64748b; text-align: right;">Valid Until:</td>
                      <td style="font-size: 13px; font-weight: 600; color: #dc2626;">${validUntilDate} (${quote.validityDays} days)</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>

          <!-- Line Items Table -->
          <div style="padding: 24px 32px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                  <th align="left" style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Product & Specification</th>
                  <th align="center" style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Qty</th>
                  <th align="right" style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Unit Price</th>
                  <th align="right" style="padding: 10px 12px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Line Total</th>
                </tr>
              </thead>
              <tbody>
                ${lineItemsHtml}
              </tbody>
            </table>

            <!-- Pricing Summary -->
            <div style="margin-top: 24px; border-top: 2px solid #e2e8f0; padding-top: 16px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" valign="top">
                    ${
                      version.notes
                        ? `<div style="background-color: #f8fafc; border-left: 3px solid #0284c7; padding: 10px 14px; font-size: 13px; color: #334155; margin-right: 20px;">
                             <strong>Notes:</strong> ${version.notes}
                           </div>`
                        : ''
                    }
                  </td>
                  <td width="50%" valign="top">
                    <table width="100%" border="0" cellspacing="0" cellpadding="6">
                      <tr>
                        <td align="right" style="font-size: 14px; color: #64748b;">Subtotal:</td>
                        <td align="right" style="font-size: 14px; font-weight: 600; color: #0f172a; width: 120px;">${formatZAR(version.subtotal)}</td>
                      </tr>
                      ${
                        version.totalVolumeDiscountAmount > 0
                          ? `<tr>
                               <td align="right" style="font-size: 13px; color: #16a34a;">Volume Savings (Included):</td>
                               <td align="right" style="font-size: 13px; font-weight: 600; color: #16a34a;">-${formatZAR(version.totalVolumeDiscountAmount)}</td>
                             </tr>`
                          : ''
                      }
                      ${
                        version.manualDiscountAmount > 0
                          ? `<tr>
                               <td align="right" style="font-size: 13px; color: #2563eb;">Special Discount:</td>
                               <td align="right" style="font-size: 13px; font-weight: 600; color: #2563eb;">-${formatZAR(version.manualDiscountAmount)}</td>
                             </tr>`
                          : ''
                      }
                      <tr style="border-top: 2px solid #0f172a;">
                        <td align="right" style="font-size: 16px; font-weight: 700; color: #0f172a; padding-top: 10px;">Final Total:</td>
                        <td align="right" style="font-size: 18px; font-weight: 800; color: #0284c7; padding-top: 10px;">${formatZAR(version.finalTotal)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Terms & Conditions -->
            <div style="margin-top: 32px; padding: 16px 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 6px;">Terms & Conditions</div>
              <div style="font-size: 12px; color: #64748b; white-space: pre-line; line-height: 1.5;">${quote.terms}</div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            Questions regarding this quote? Email <a href="mailto:${settings.senderEmail}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${settings.senderEmail}</a> or call ${settings.companyPhone}.
            <br>&copy; ${new Date().getFullYear()} ${settings.companyName}. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static async sendQuoteEmail(quote: Quote, version: QuoteVersion, settings: QuoteSettings): Promise<{ success: boolean; emailLog: EmailLog }> {
    const htmlContent = this.generateQuoteHtml(quote, version, settings);

    const emailLog: EmailLog = {
      id: `eml_${Math.random().toString(36).substring(2, 9)}`,
      quoteId: quote.id,
      referenceNumber: quote.referenceNumber,
      recipientEmail: quote.customerEmail,
      subject: `Official Quotation ${quote.referenceNumber} v${version.versionNumber} - ${settings.companyName}`,
      htmlContent,
      sentAt: new Date().toISOString(),
      status: 'SENT',
    };

    // Store in mock email logs repository
    const logs = Repository.getEmails();
    logs.unshift(emailLog);
    Repository.saveEmails(logs);

    console.log(`[Mock EmailService] Quote Email sent to ${quote.customerEmail} for Ref: ${quote.referenceNumber}`);

    return {
      success: true,
      emailLog,
    };
  }

  static getEmailLogs(): EmailLog[] {
    return Repository.getEmails();
  }
}
