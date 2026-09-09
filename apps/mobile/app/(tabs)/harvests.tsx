import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { HoneycombBackground } from "@/components/design/honeycomb-background";
import { ScreenHeader } from "@/components/screen-header";
import { useAppColorScheme } from "@/lib/theme";
import { RequireAuth } from "@/components/require-auth";

export default function HarvestsTab() {
  const { t } = useTranslation();
  const { t: tc } = useAppColorScheme();

  return (
    <RequireAuth>
      <View className={tc("flex-1 bg-background", "flex-1 bg-background-dark")}>
      <HoneycombBackground />
        <ScreenHeader title={t("dashboard.nav.harvests")} />
          <Text className={tc("px-6 text-muted", "px-6 text-muted-dark")}>
            Harvest recording lands here in Phase 20.6.
         </Text>
      </View>
    </RequireAuth>
  );
}