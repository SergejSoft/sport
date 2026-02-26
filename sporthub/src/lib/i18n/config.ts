/**
 * i18n config — EN is the source language.
 * Add translation values to locale JSON files under src/lib/i18n/locales/.
 */

export const DEFAULT_LOCALE = "en" as const;

export const SUPPORTED_LOCALES = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "it", name: "Italiano" },
  { code: "pl", name: "Polski" },
  { code: "ru", name: "Русский" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

export const LOCALE_CODES: LocaleCode[] = SUPPORTED_LOCALES.map((l) => l.code);

export function isLocaleCode(code: string): code is LocaleCode {
  return LOCALE_CODES.includes(code as LocaleCode);
}

export const LOCALE_COOKIE_NAME = "sporthub_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
