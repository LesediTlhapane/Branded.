import { QuoteSettings } from '../types';
import { Repository } from '../db/storage';

export class SettingsService {
  /**
   * Quote Settings Service.
   * TODO: Connect real System Settings API backend when API specification is provided.
   */

  static getSettings(): QuoteSettings {
    return Repository.getSettings();
  }

  static updateSettings(newSettings: Partial<QuoteSettings>): { success: boolean; message: string; settings: QuoteSettings } {
    const current = Repository.getSettings();

    if (newSettings.staffDiscountCeiling !== undefined && newSettings.staffDiscountCeiling < 0) {
      return { success: false, message: 'Staff discount ceiling cannot be negative.', settings: current };
    }

    if (newSettings.quoteValidityDays !== undefined && newSettings.quoteValidityDays <= 0) {
      return { success: false, message: 'Quote validity period must be at least 1 day.', settings: current };
    }

    const updated: QuoteSettings = {
      ...current,
      ...newSettings,
    };

    Repository.saveSettings(updated);

    return {
      success: true,
      message: 'Quote Settings updated successfully. New settings will apply to future quotes.',
      settings: updated,
    };
  }
}
