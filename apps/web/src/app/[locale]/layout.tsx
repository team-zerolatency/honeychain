import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { fraunces, manrope } from "@/lib/fonts";
import { ThemeProvider } from "@repo/ui/theme-provider";
import { HoneycombBackground } from "@repo/ui/honeycomb-background";
import { Navbar } from "@/components/navbar";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import { AuthBootstrap } from "@/components/auth-bootstrap";
import { ChatbotWidget } from "@/components/chatbot-widget";

export const metadata: Metadata = {
  title: "Honey Chain",
  description: "Blockchain-based honey traceability and smart beekeeping management.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${fraunces.variable} ${manrope.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <ThemeProvider>
              <AuthBootstrap />
                <div className="relative min-h-screen overflow-x-clip">
                  <HoneycombBackground />
                  <div className="relative z-10 flex min-h-screen flex-col">
                    <Navbar />
                    <div className="flex-1">
                      {children}
                      <ChatbotWidget />
                    </div>
                  </div>
                </div>
            </ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}