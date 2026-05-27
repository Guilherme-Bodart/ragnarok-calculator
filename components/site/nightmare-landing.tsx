"use client";

import { useEffect, useState } from "react";
import {
  defaultLocale,
  dictionaries,
  isLocale,
  type Locale,
} from "@/content/i18n";
import { Hero } from "@/components/site/hero";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Manifesto } from "@/components/site/manifesto";
import { Recruitment } from "@/components/site/recruitment";
import { GuildSaasShowcase } from "@/components/site/guild-saas-showcase";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SpriteStage } from "@/components/site/sprite-stage";

const storageKey = "nightmare-locale";

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

export function NightmareLanding() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : locale;
  }, [locale]);

  function handleLocaleChange(nextLocale: Locale) {
    setLocale(nextLocale);
    window.localStorage.setItem(storageKey, nextLocale);
  }

  const t = dictionaries[locale];

  return (
    <div className="nightmare-page">
      <SiteHeader t={t.nav} />
      <LanguageSwitcher
        locale={locale}
        onLocaleChange={handleLocaleChange}
        t={t.language}
      />
      <main>
        <Hero t={t.hero} siteName={t.meta.siteName} />
        <Manifesto t={t.values} />
        <GuildSaasShowcase t={t.agenda} />
        <Recruitment t={t.recruitment} />
      </main>
      <SiteFooter t={t.meta} />
      <SpriteStage />
    </div>
  );
}
