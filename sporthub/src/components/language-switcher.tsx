"use client";

import { useLocale, useSetLocale } from "@/contexts/locale-context";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { useRef, useState } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = SUPPORTED_LOCALES.find((l) => l.code === locale);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <span aria-hidden className="text-base" title={current?.name}>
          {locale.toUpperCase()}
        </span>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          >
            {SUPPORTED_LOCALES.map((l) => (
              <li key={l.code} role="option" aria-selected={l.code === locale}>
                <button
                  type="button"
                  onClick={() => {
                    setLocale(l.code);
                    setOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    l.code === locale ? "bg-gray-50 font-medium text-gray-900" : "text-gray-700"
                  }`}
                >
                  {l.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
