import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthCodeExchange } from "@/components/auth-code-exchange";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isLocaleCode } from "@/lib/i18n/config";
import "./globals.css";

// Avoid running Header (and Prisma) at build time so Vercel build doesn't need DB access.
export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SportHub — Discover & book group sports",
  description: "Discover and book group sports, classes, and activities near you.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const initialLocale =
    typeof localeCookie === "string" && isLocaleCode(localeCookie)
      ? localeCookie
      : DEFAULT_LOCALE;

  return (
    <html lang={initialLocale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers initialLocale={initialLocale}>
          <Suspense fallback={null}>
            <AuthCodeExchange />
          </Suspense>
          <Header />
          <div className="flex min-h-[calc(100vh-theme(spacing.14))] flex-col">
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
