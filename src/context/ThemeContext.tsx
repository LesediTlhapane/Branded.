import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type Theme = 'dark-gold' | 'blue-white' | 'slate-dark';
export type ThemeMode = 'auto' | 'dark-gold' | 'blue-white' | 'slate-dark';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isCustomerPortalActive: boolean;
  setIsCustomerPortalActive: (active: boolean) => void;
  getThemeName: (t: Theme) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'sa_quote_app_theme_mode_v2';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  const [isCustomerPortalActive, setIsCustomerPortalActive] = useState(false);

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'blue-white';
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return (saved as ThemeMode) || 'blue-white';
    } catch {
      return 'blue-white';
    }
  });

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  // Determine active visual theme based on mode or user role / portal context
  const getCalculatedTheme = (): Theme => {
    if (themeMode !== 'auto') {
      return themeMode;
    }

    // Default theme for the entire app & dashboard is Blue & White
    return 'blue-white';
  };

  const activeTheme = getCalculatedTheme();

  // Apply data-theme attribute on document root or body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  const getThemeName = (t: Theme): string => {
    switch (t) {
      case 'dark-gold':
        return 'Sophisticated Dark Gold (Admin)';
      case 'blue-white':
        return 'Corporate Blue & White (Customer)';
      case 'slate-dark':
        return 'Midnight Slate Navy (Staff)';
      default:
        return 'Default Theme';
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        themeMode,
        setThemeMode,
        isCustomerPortalActive,
        setIsCustomerPortalActive,
        getThemeName,
      }}
    >
      <div data-theme={activeTheme} className="min-h-screen">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
