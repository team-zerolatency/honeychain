"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@repo/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuthStore } from "@/stores/auth-store";

export function Navbar() {
  const t = useTranslations("nav");
  const role = useAuthStore((s) => s.role);

  return (
    <nav className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/" className="font-display text-lg font-medium">Honey Chain</Link>
      <div className="hidden gap-6 text-sm text-muted-foreground md:flex">
        <span>{t("trace")}</span>
        <span>{t("verify")}</span>
        <span>{t("monitor")}</span>
      </div>
      <div className="flex items-center gap-2">
        {!role && (
          <Link href="/login" className="text-sm text-muted-foreground underline underline-offset-4">
            Log in
          </Link>
        )}
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </nav>
  );
}