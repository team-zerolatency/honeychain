"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@repo/ui/theme-toggle";
import { Button } from "@repo/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuthStore } from "@/stores/auth-store";

export function Navbar() {
  const t = useTranslations("nav");
  const role = useAuthStore((s) => s.role);

  return (
    <nav className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight transition-opacity hover:opacity-90">
        <Image
          src="/logo.png"
          alt="HoneyChain Logo"
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
          priority
        />
        <span>HoneyChain</span>
      </Link>
      <div className="hidden gap-6 text-sm text-muted-foreground md:flex">
        <span>{t("trace")}</span>
        <span>{t("verify")}</span>
        <span>{t("monitor")}</span>
      </div>
      <div className="flex items-center gap-3">
        {!role && (
          <Button asChild size="sm" className="h-8 px-4 text-xs font-semibold shadow-xs">
            <Link href="/login">
              {t("continue")}
            </Link>
          </Button>
        )}
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </nav>
  );
}