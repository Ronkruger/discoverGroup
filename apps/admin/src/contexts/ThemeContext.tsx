/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedSettings = localStorage.getItem('discovergroup-admin-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.theme) {
          setThemeState(settings.theme);
        }
      } catch (error) {
        console.error('Error loading theme from settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    let newEffectiveTheme: 'light' | 'dark' = 'light';

    if (theme === 'dark') {
      newEffectiveTheme = 'dark';
    } else if (theme === 'auto') {
      newEffectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      newEffectiveTheme = 'light';
    }

    setEffectiveTheme(newEffectiveTheme);

    if (newEffectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        const newEffectiveTheme = e.matches ? 'dark' : 'light';
        setEffectiveTheme(newEffectiveTheme);
        
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    const savedSettings = localStorage.getItem('discovergroup-admin-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        settings.theme = newTheme;
        localStorage.setItem('discovergroup-admin-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Error updating theme in settings:', error);
      }
    } else {
      const newSettings = { theme: newTheme };
      localStorage.setItem('discovergroup-admin-settings', JSON.stringify(newSettings));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

