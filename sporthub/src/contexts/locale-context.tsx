"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  type LocaleCode,
  DEFAULT_LOCALE,
  isLocaleCode,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
} from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n/translations";

type LocaleContextValue = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function setLocaleCookie(code: LocaleCode) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE_NAME}=${code}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: LocaleCode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);

  const setLocale = useCallback(
    (code: LocaleCode) => {
      setLocaleState(code);
      setLocaleCookie(code);
      if (typeof document !== "undefined") {
        document.documentElement.lang = code;
      }
      router.refresh();
    },
    [router]
  );

  const t = useMemo(() => {
    const dict = getTranslations(locale);
    return (key: string) => dict[key] ?? key;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleCode {
  const ctx = useContext(LocaleContext);
  if (!ctx) return DEFAULT_LOCALE;
  return ctx.locale;
}

export function useSetLocale(): (code: LocaleCode) => void {
  const ctx = useContext(LocaleContext);
  if (!ctx) return () => {};
  return ctx.setLocale;
}

export function useTranslations(): (key: string) => string {
  const ctx = useContext(LocaleContext);
  if (!ctx) return (key: string) => key;
  return ctx.t;
}
