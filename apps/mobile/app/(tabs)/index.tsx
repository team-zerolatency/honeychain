import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { HoneycombBackground } from "@/components/design/honeycomb-background";
import { ScreenHeader } from "@/components/screen-header";
import { useAppColorScheme } from "@/lib/theme";

export default function DashboardTab() {
  const { t } = useTranslation();
  const { t: tc } = useAppColorScheme();

  return (
    <View className={tc("flex-1 bg-background", "flex-1 bg-background-dark")}>
      <HoneycombBackground />
      <View className="z-10 flex-1">
        <ScreenHeader title={t("dashboard.nav.overview")} />
        <Text className={tc("px-6 text-muted", "px-6 text-muted-dark")}>
          Hive list and AI insights land here in Phase 20.6.
        </Text>
      </View>
    </View>
  );
}