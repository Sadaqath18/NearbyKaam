import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode =
  | "en"
  | "hi"
  | "kn"
  | "ta"
  | "te"
  | "mr"
  | "ur"
  | "ml"
  | "gu"
  | "bn"
  | "pa"
  | "or"
  | "as"
  | "ks"
  | "sd"
  | "ne";

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    const stored = localStorage.getItem(
      "nearbykaam_lang",
    ) as LanguageCode | null;
    if (stored) setLanguageState(stored);
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    localStorage.setItem("nearbykaam_lang", lang);
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
};
