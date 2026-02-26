# i18n (multilanguage) setup

- **Source language:** English (EN). All keys and default text live in `locales/en.json`.
- **Locales:** EN, DE, FR, ES, IT, PL, RU. Add new keys to `en.json` first, then copy keys (with empty or translated values) to other locale files.
- **Switching:** User choice is stored in cookie `sporthub_locale` and applied app-wide. Use the header language switcher (e.g. "EN" dropdown).

## Adding translations

1. Add or edit keys in `locales/en.json` (flat keys, e.g. `"nav.signIn": "Sign in"`).
2. Copy the same keys to other locale files (`de.json`, `fr.json`, etc.) and fill in the translated value. Leave empty to fall back to EN.
3. In **client components**, use the hook:
   ```tsx
   import { useTranslations } from "@/contexts/locale-context";
   const t = useTranslations();
   return <h1>{t("home.title")}</h1>;
   ```
4. **Server components** cannot use `useTranslations`. Either pass translated strings from a server helper (e.g. `getTranslations(locale)`) or keep the text in a client component that uses `useTranslations`.

## Config

- `src/lib/i18n/config.ts` — default locale, supported locales, cookie name.
- `src/lib/i18n/translations.ts` — loads locale JSON and merges with EN fallback.
- `src/contexts/locale-context.tsx` — `LocaleProvider`, `useLocale`, `useSetLocale`, `useTranslations`.
