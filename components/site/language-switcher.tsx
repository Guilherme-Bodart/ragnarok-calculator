"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { dictionaries, type Dictionary, type Locale, locales } from "@/content/i18n";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  t: Dictionary["language"];
};

export function LanguageSwitcher({
  locale,
  onLocaleChange,
  t,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function selectLocale(nextLocale: Locale) {
    onLocaleChange(nextLocale);
    setIsOpen(false);
  }

  return (
    <div className="language-switcher" ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t.label}
        className={cn("language-trigger", isOpen && "active")}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span>{dictionaries[locale].language[locale]}</span>
        <ChevronDown aria-hidden size={15} />
      </button>

      {isOpen && (
        <div className="language-menu" role="listbox" aria-label={t.label}>
          {locales.map((item) => {
            const isSelected = item === locale;

            return (
              <button
                aria-selected={isSelected}
                className={cn(isSelected && "active")}
                key={item}
                onClick={() => selectLocale(item)}
                role="option"
                type="button"
              >
                <span>{dictionaries[item].language[item]}</span>
                {isSelected && <Check aria-hidden size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
