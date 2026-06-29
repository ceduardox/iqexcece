import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import es from "@/locales/es.json";
import en from "@/locales/en.json";
import pt from "@/locales/pt.json";

function getInitialLanguage(): string {
  if (typeof window === "undefined") return "es";
  
  try {
    const saved = localStorage.getItem("i18nextLng");
    if (saved && ["es", "en", "pt"].includes(saved.slice(0, 2).toLowerCase())) {
      return saved.slice(0, 2).toLowerCase();
    }
  } catch {}

  const browserLangs = navigator.languages || [navigator.language || "es"];
  for (const lang of browserLangs) {
    if (!lang) continue;
    const code = lang.slice(0, 2).toLowerCase();
    if (code === "es") return "es";
    if (code === "pt") return "pt";
    if (code === "en") return "en";
  }

  return "es";
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      pt: { translation: pt },
    },
    lng: getInitialLanguage(),
    fallbackLng: "es",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
      cleanCode: true,
      lowerCaseLng: true,
    },
  });

export default i18n;

export type AppLanguage = {
  code: string;
  label: string;
  disabled?: boolean;
};

export const languages: AppLanguage[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
];
