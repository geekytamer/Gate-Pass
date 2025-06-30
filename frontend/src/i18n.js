import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";


import enUniversity from "./locales/en/university.json";
import arUniversity from "./locales/ar/university.json";
import enDashboard from "./locales/en/dashboard.json";
import arDashboard from "./locales/ar/dashboard.json";
import enScanner from "./locales/en/scanner.json";
import arScanner from "./locales/ar/scanner.json";
import enAdmin from "./locales/en/admin.json";
import arAdmin from "./locales/ar/admin.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: true,

    // ✅ Remove the `ns` and `defaultNS` keys
    // ns: ["dashboard", "university"],
    // defaultNS: "translation",

    // ✅ Move keys under a shared root like "translation"
    resources: {
      en: {
        translation: {
          university: enUniversity,
          dashboard: enDashboard,
          scanner: enScanner,
          admin: enAdmin,
        },
      },
      ar: {
        translation: {
          university: arUniversity,
          dashboard: arDashboard,
            scanner: arScanner,
            admin: arAdmin,
        },
      },
    },

    interpolation: {
      escapeValue: false,
    },
  });
export default i18n;