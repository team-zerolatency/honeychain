"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ThemeToggle } from "@repo/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuthStore } from "@/stores/auth-store";
import { apiFetch } from "@/lib/api-client";

export function Navbar() {
  const t = useTranslations("nav");
  const role = useAuthStore((s) => s.role);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    clearAuth();
    router.push("/login");
  }

  const destination = role === "STORE_OWNER" ? "/store-owner" : "/dashboard";

  return (
    <nav className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-medium transition-opacity hover:opacity-90">
        <Image
          src="/logo.png"
          alt="Honey Chain Logo"
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
          priority
        />
        <span>Honey Chain</span>
      </Link>
      <div className="hidden gap-6 text-sm text-muted-foreground md:flex">
        <span>{t("trace")}</span>
        <span>{t("verify")}</span>
        <span>{t("monitor")}</span>
      </div>
      <div className="flex items-center gap-3">
        {role ? (
          <>
            <Link
              href={destination}
              className="inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-background shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              {t("dashboard")}
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              {t("logout")}
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-background shadow-sm transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            {t("login")}
          </Link>
        )}
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </nav>
  );
}