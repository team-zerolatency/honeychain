import { View, Text } from "react-native";
import { ScreenHeader } from "@/components/screen-header";
import { useAppColorScheme } from "@/lib/theme";
import { RequireAuth } from "@/components/require-auth";

export default function AlertsTab() {
  const { t } = useAppColorScheme();
  return (
    <RequireAuth>
        <View className={t("flex-1 bg-background", "flex-1 bg-background-dark")}>
            <ScreenHeader title="Alerts" />
            <Text className={t("px-6 text-muted", "px-6 text-muted-dark")}>
                Hive alerts land here in Phase 20.7 (push notifications).
            </Text>
        </View>
    </RequireAuth>
  );
}