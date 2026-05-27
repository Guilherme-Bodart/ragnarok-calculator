import {
  dictionaries,
  isLocale,
  type Dictionary,
  type Locale,
  locales,
} from "@/content/i18n";

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
    <label className="language-switcher">
      <span>{t.label}</span>
      <select
        aria-label={t.label}
        onChange={(event) => {
          if (isLocale(event.target.value)) {
            onLocaleChange(event.target.value);
          }
        }}
        value={locale}
      >
        {locales.map((item) => (
          <option key={item} value={item}>
            {dictionaries[item].language[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
