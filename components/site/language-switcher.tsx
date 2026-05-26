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
  return (
    <div className="language-switcher" aria-label={t.label}>
      {locales.map((item) => (
        <button
          key={item}
          type="button"
          className={cn(item === locale && "active")}
          onClick={() => onLocaleChange(item)}
          aria-pressed={item === locale}
        >
          {dictionaries[item].language[item]}
        </button>
      ))}
    </div>
  );
}
