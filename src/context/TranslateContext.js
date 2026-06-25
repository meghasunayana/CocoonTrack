// src/context/TranslateContext.js
// Manages Google Translate widget + language state across the entire app

import React, { createContext, useContext, useEffect, useState } from "react";

const TranslateContext = createContext();
export const useTranslate = () => useContext(TranslateContext);

// Supported languages — add more as needed
export const LANGUAGES = [
  { code: "en", label: "English",  native: "English"    },
  { code: "kn", label: "Kannada",  native: "ಕನ್ನಡ"      },
  { code: "te", label: "Telugu",   native: "తెలుగు"      },
  { code: "ta", label: "Tamil",    native: "தமிழ்"       },
  { code: "hi", label: "Hindi",    native: "हिन्दी"      },
];

export const TranslateProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(
    () => localStorage.getItem("ct_lang") || "en"
  );
  const [widgetReady, setWidgetReady] = useState(false);

  // ── Inject Google Translate script once ─────────────────────────────────
  useEffect(() => {
    // Callback Google Translate calls when ready
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: LANGUAGES.map((l) => l.code).join(","),
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element" // hidden div in index.html
      );
      setWidgetReady(true);
    };

    if (!document.getElementById("gt-script")) {
      const script = document.createElement("script");
      script.id = "gt-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      setWidgetReady(true);
    }
  }, []);

  // ── Apply language by programmatically selecting in the hidden widget ────
  const applyLanguage = (langCode) => {
    if (langCode === "en") {
      // Restore original — Google Translate uses a cookie
      const frame = document.querySelector(".goog-te-banner-frame");
      if (frame) {
        const btn = frame.contentDocument?.querySelector(".goog-te-banner-content button");
        if (btn) btn.click();
      }
      // Fallback: remove cookie and reload
      document.cookie =
        "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
        window.location.hostname;
      window.location.reload();
      return;
    }

    // Set Google Translate cookie directly — most reliable method
    const cookieVal = `/en/${langCode}`;
    document.cookie = `googtrans=${cookieVal}; path=/`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname}`;

    // Trigger the hidden select element inside Google Translate widget
    const trySelect = () => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event("change"));
      }
    };
    // Try immediately, then retry after widget loads
    trySelect();
    setTimeout(trySelect, 800);
    setTimeout(trySelect, 1500);
  };

  const changeLanguage = (langCode) => {
    setCurrentLang(langCode);
    localStorage.setItem("ct_lang", langCode);
    applyLanguage(langCode);
  };

  // Re-apply saved language on mount after widget is ready
  useEffect(() => {
    if (widgetReady && currentLang !== "en") {
      applyLanguage(currentLang);
    }
  }, [widgetReady]);

  return (
    <TranslateContext.Provider value={{ currentLang, changeLanguage, widgetReady, LANGUAGES }}>
      {children}
    </TranslateContext.Provider>
  );
};
