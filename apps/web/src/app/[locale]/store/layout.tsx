"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { RequireRole } from "@/components/dashboard/require-role";
import { useAuthStore } from "@/stores/auth-store";
import { apiFetch } from "@/lib/api-client";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("store.nav");
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    clearAuth();
    router.push("/login");
  }

  return (
    <RequireRole role="STORE_OWNER">
      <div className="mx-auto flex flex-col md:flex-row max-w-6xl gap-6 md:gap-8 px-6 py-8">
        <aside className="w-full md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-4">
          <nav className="flex flex-row flex-wrap md:flex-col gap-3 md:gap-2 text-sm">
            <Link href="/store" className="text-muted-foreground hover:text-foreground">{t("shipments")}</Link>
            <Link href="/store/inventory" className="text-muted-foreground hover:text-foreground">{t("inventory")}</Link>
            <button onClick={handleLogout} className="text-left text-muted-foreground hover:text-verify-red md:mt-4">
              {t("logout")}
            </button>
          </nav>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </RequireRole>
  );
}