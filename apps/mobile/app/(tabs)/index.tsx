import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { HoneycombBackground } from "@/components/design/honeycomb-background";
import { ScreenHeader } from "@/components/screen-header";
import { RequireAuth } from "@/components/require-auth";
import { useAppColorScheme } from "@/lib/theme";
import { useAuthStore } from "@/stores/auth-store";
import { apiFetch } from "@/lib/api-client";
import { clearRefreshToken } from "@/lib/secure-storage";

export default function DashboardTab() {
  const { t } = useTranslation();
  const { t: tc } = useAppColorScheme();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const accessToken = useAuthStore((s) => s.accessToken);

  async function handleLogout() {
    await apiFetch("/auth/logout", { method: "POST", token: accessToken ?? undefined }).catch(() => {});
    await clearRefreshToken();
    clearAuth();
    router.replace("/login");
  }

  return (
    <RequireAuth>
      <View className={tc("flex-1 bg-background", "flex-1 bg-background-dark")}>
        <HoneycombBackground />
        <View className="z-10 flex-1">
          <ScreenHeader title={t("dashboard.nav.overview")} />
          <Text className={tc("px-6 text-muted", "px-6 text-muted-dark")}>
            Hive list and AI insights land here in Phase 20.6.
          </Text>
          <Pressable onPress={handleLogout} className="mx-6 mt-6">
            <Text className="text-sm text-verify-red">{t("dashboard.nav.logout")}</Text>
          </Pressable>
        </View>
      </View>
    </RequireAuth>
  );
}