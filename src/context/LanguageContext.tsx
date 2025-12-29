/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

type Language = 'en' | 'tl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'tl') ? saved : 'en';
  });

  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load translations dynamically
    import(`../translations/${language}.ts`)
      .then((module) => {
        setTranslations(module.default);
      })
      .catch((err) => {
        console.error('Failed to load translations:', err);
      });
    
    // Save to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Export context separately
export { LanguageContext };

// Default export the provider component
export default LanguageProvider;

