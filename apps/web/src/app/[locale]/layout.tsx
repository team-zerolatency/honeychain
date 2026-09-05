import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { fraunces, manrope } from "@/lib/fonts";
import { ThemeProvider } from "@/components/design/theme-provider";
import { HoneycombBackground } from "@/components/design/honeycomb-background";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Honey Chain",
  description: "Blockchain-based honey traceability and smart beekeeping management.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${fraunces.variable} ${manrope.variable} font-sans antialiased`}>
        <NextIntlClientProvider>
          <ThemeProvider>
            <div className="relative min-h-screen overflow-hidden">
              <HoneycombBackground />
              <div className="relative z-10">
                <Navbar />
                {children}
              </div>
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}