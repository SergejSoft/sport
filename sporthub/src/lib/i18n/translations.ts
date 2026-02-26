import type { LocaleCode } from "./config";
import { DEFAULT_LOCALE } from "./config";

import en from "./locales/en.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import it from "./locales/it.json";
import pl from "./locales/pl.json";
import ru from "./locales/ru.json";

const messages: Record<LocaleCode, Record<string, string>> = {
  en: en as Record<string, string>,
  de: de as Record<string, string>,
  fr: fr as Record<string, string>,
  es: es as Record<string, string>,
  it: it as Record<string, string>,
  pl: pl as Record<string, string>,
  ru: ru as Record<string, string>,
};

/**
 * Get translation strings for a locale. Missing or empty values fall back to EN.
 */
export function getTranslations(locale: LocaleCode): Record<string, string> {
  const fallback = messages[DEFAULT_LOCALE];
  const target = messages[locale] ?? fallback;
  const out: Record<string, string> = {};
  for (const key of Object.keys(fallback)) {
    const v = target[key];
    out[key] = v !== undefined && v !== "" ? v : (fallback[key] ?? key);
  }
  return out;
}

export type TranslationKey = keyof typeof en;
