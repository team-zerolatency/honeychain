"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { RequireRole } from "@/components/dashboard/require-role";
import { useAuthStore } from "@/stores/auth-store";
import { apiFetch } from "@/lib/api-client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("dashboard.nav");
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    clearAuth();
    router.push("/login");
  }

  return (
    <RequireRole role="BEEKEEPER">
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-10">
        <aside className="w-48 shrink-0">
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">{t("overview")}</Link>
            <Link href="/dashboard/harvests" className="text-muted-foreground hover:text-foreground">{t("harvests")}</Link>
            <Link href="/dashboard/store-owners" className="text-muted-foreground hover:text-foreground">{t("storeOwners")}</Link>
            <button onClick={handleLogout} className="mt-4 text-left text-muted-foreground hover:text-verify-red">
              {t("logout")}
            </button>
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </RequireRole>
  );
}