import en from "./en.json";
import es from "./es.json";
import pt from "./pt.json";

export const dictionaries = {
  pt,
  en,
  es,
} as const;

export type Locale = keyof typeof dictionaries;
export type Dictionary = (typeof dictionaries)["pt"];

export const locales = Object.keys(dictionaries) as Locale[];
export const defaultLocale: Locale = "pt";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
