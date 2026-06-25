// src/components/LanguageSwitcher.jsx
// Reusable dropdown — drop it anywhere in the app
// Shows flag-style native name buttons, toggles on click

import React, { useState, useRef, useEffect } from "react";
import { useTranslate } from "../context/TranslateContext";

export default function LanguageSwitcher({ theme = "light" }) {
  // theme: "light" (white bg) | "dark" (for green header) | "minimal"
  const { currentLang, changeLanguage, LANGUAGES } = useTranslate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const buttonClass = {
    light:   "border border-gray-200 bg-white text-gray-700",
    dark:    "border border-white/30 bg-white/15 text-white",
    minimal: "border border-gray-100 bg-gray-50 text-gray-600",
  }[theme];

  return (
    <div ref={ref} className="relative" style={{ zIndex: 999 }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${buttonClass}`}
      >
        🌐
        <span className="notranslate">{current.native}</span>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden min-w-[150px]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { changeLanguage(lang.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50
                ${currentLang === lang.code ? "bg-green-50 text-green-700 font-medium" : "text-gray-700"}`}
            >
              {/* Active indicator */}
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${currentLang === lang.code ? "bg-green-600" : "bg-transparent"}`} />
              {/* notranslate keeps the native names from being translated */}
              <span className="notranslate">{lang.native}</span>
              <span className="text-xs text-gray-400 notranslate ml-auto">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
