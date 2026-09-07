import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { HoneycombBackground } from "@/components/design/honeycomb-background";
import { ScreenHeader } from "@/components/screen-header";
import { useAppColorScheme } from "@/lib/theme";

export default function ScanTab() {
  const { t } = useTranslation();
  const { t: tc } = useAppColorScheme();

  return (
    <View className={tc("flex-1 bg-background", "flex-1 bg-background-dark")}>
      <HoneycombBackground />
      <ScreenHeader title={t("verify.title")} />
      <Text className={tc("px-6 text-muted", "px-6 text-muted-dark")}>
        Camera QR scan + scratch verification lands here in Phase 20.5.
      </Text>
    </View>
  );
}