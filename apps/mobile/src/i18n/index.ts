import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@repo/i18n/en.json";
import hi from "@repo/i18n/hi.json";
import pa from "@repo/i18n/pa.json";

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi }, pa: { translation: pa } },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;