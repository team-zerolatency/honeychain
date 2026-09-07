import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@repo/i18n/en.json";
import hi from "@repo/i18n/hi.json";

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi } },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;