import {
  User,
  Customer,
  Category,
  VariantType,
  Product,
  Quote,
  QuoteSettings,
  EmailLog,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SETTINGS,
  INITIAL_CUSTOMERS,
  INITIAL_CATEGORIES,
  INITIAL_VARIANTS,
  INITIAL_PRODUCTS,
  INITIAL_QUOTES,
} from './initialData';

const KEYS = {
  USERS: 'sa_quote_users_v2',
  SETTINGS: 'sa_quote_settings_v2',
  CUSTOMERS: 'sa_quote_customers_v2',
  CATEGORIES: 'sa_quote_categories_v2',
  VARIANTS: 'sa_quote_variants_v2',
  PRODUCTS: 'sa_quote_products_v2',
  QUOTES: 'sa_quote_quotes_v3',
  EMAILS: 'sa_quote_emails_v3',
};

function getItem<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return defaultData;
  }
}

function setItem<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

export class Repository {
  // Users
  static getUsers(): User[] {
    return getItem<User[]>(KEYS.USERS, INITIAL_USERS);
  }

  static saveUsers(users: User[]): void {
    setItem(KEYS.USERS, users);
  }

  // Settings
  static getSettings(): QuoteSettings {
    return getItem<QuoteSettings>(KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  static saveSettings(settings: QuoteSettings): void {
    setItem(KEYS.SETTINGS, settings);
  }

  // Customers
  static getCustomers(): Customer[] {
    return getItem<Customer[]>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }

  static saveCustomers(customers: Customer[]): void {
    setItem(KEYS.CUSTOMERS, customers);
  }

  // Categories
  static getCategories(): Category[] {
    return getItem<Category[]>(KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  static saveCategories(categories: Category[]): void {
    setItem(KEYS.CATEGORIES, categories);
  }

  // Variants
  static getVariants(): VariantType[] {
    return getItem<VariantType[]>(KEYS.VARIANTS, INITIAL_VARIANTS);
  }

  static saveVariants(variants: VariantType[]): void {
    setItem(KEYS.VARIANTS, variants);
  }

  // Products
  static getProducts(): Product[] {
    return getItem<Product[]>(KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  static saveProducts(products: Product[]): void {
    setItem(KEYS.PRODUCTS, products);
  }

  // Quotes
  static getQuotes(): Quote[] {
    return getItem<Quote[]>(KEYS.QUOTES, INITIAL_QUOTES);
  }

  static saveQuotes(quotes: Quote[]): void {
    setItem(KEYS.QUOTES, quotes);
  }

  // Emails
  static getEmails(): EmailLog[] {
    return getItem<EmailLog[]>(KEYS.EMAILS, []);
  }

  static saveEmails(emails: EmailLog[]): void {
    setItem(KEYS.EMAILS, emails);
  }

  // Reset to seed data helper
  static resetToSeedData(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(KEYS.VARIANTS, JSON.stringify(INITIAL_VARIANTS));
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(INITIAL_QUOTES));
    localStorage.setItem(KEYS.EMAILS, JSON.stringify([]));
  }
}
