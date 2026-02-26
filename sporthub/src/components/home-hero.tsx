"use client";

import { useTranslations } from "@/contexts/locale-context";

export function HomeHero() {
  const t = useTranslations();
  return (
    <>
      <h1 className="text-2xl font-semibold">{t("home.title")}</h1>
      <p className="mt-2 text-gray-600">{t("home.subtitle")}</p>
    </>
  );
}
