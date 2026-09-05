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

  const destination =
    role === "ADMIN" ? "/admin" : role === "STORE_OWNER" ? "/store" : "/dashboard";

  return (
    <nav className="flex items-center justify-between border-b border-border px-3.5 py-2.5 sm:px-6 sm:py-4">
      <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 font-display text-sm sm:text-lg font-medium shrink-0 transition-opacity hover:opacity-90">
        <Image
          src="/logo.png"
          alt="Honey Chain Logo"
          width={32}
          height={32}
          className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
          priority
        />
        <span className="whitespace-nowrap">Honey Chain</span>
      </Link>
      <div className="hidden gap-6 text-sm text-muted-foreground md:flex">
        <span>{t("trace")}</span>
        <span>{t("verify")}</span>
        <span>{t("monitor")}</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {role ? (
          <>
            <Link
              href={destination}
              className="inline-flex shrink-0 whitespace-nowrap items-center justify-center rounded-full bg-accent h-8 sm:h-9 px-3.5 sm:px-4 text-xs sm:text-sm font-medium text-background shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {t("dashboard")}
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex shrink-0 whitespace-nowrap items-center justify-center rounded-full border border-border h-8 sm:h-9 px-3 sm:px-3.5 text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              {t("logout")}
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="inline-flex shrink-0 whitespace-nowrap items-center justify-center rounded-full bg-accent h-8 sm:h-9 px-3.5 sm:px-4 text-xs sm:text-sm font-medium text-background shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
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