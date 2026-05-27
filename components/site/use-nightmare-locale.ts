"use client";

import { useEffect, useState } from "react";
import {
  defaultLocale,
  dictionaries,
  isLocale,
  type Locale,
} from "@/content/i18n";

const storageKey = "nightmare-locale";

export function useNightmareLocale() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : locale;
  }, [locale]);

  function updateLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem(storageKey, nextLocale);
  }

  return {
    dictionary: dictionaries[locale],
    locale,
    setLocale: updateLocale,
  };
}

function getInitialLocale() {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  const savedLocale = window.localStorage.getItem(storageKey);
  if (savedLocale && isLocale(savedLocale)) {
    return savedLocale;
  }

  const browserLocale = window.navigator.language.slice(0, 2);
  return isLocale(browserLocale) ? browserLocale : defaultLocale;
}
