import { View, Text, ScrollView } from "react-native";
import { HoneycombBackground } from "@/components/design/honeycomb-background";
import { HexCard } from "@/components/design/hex-card";
import { GlassPanel } from "@/components/design/glass-panel";
import { ThemeToggle } from "@/components/design/theme-toggle";
import { useAppColorScheme } from "@/lib/theme";

export default function DesignPreview() {
  const { t } = useAppColorScheme();

  return (
    <View className={t("flex-1 bg-background", "flex-1 bg-background-dark")}>
      <HoneycombBackground />
      <ScrollView className="z-10" contentContainerClassName="gap-4 p-6 pt-16">
        <View className="flex-row items-center justify-between">
          <Text className={t("font-display text-2xl text-foreground", "font-display text-2xl text-foreground-dark")}>
            Honey Chain
          </Text>
          <ThemeToggle />
        </View>

        <GlassPanel>
          <Text className={t("text-xs text-muted", "text-xs text-muted-dark")}>Bottle HC-2026-B0F3A2-000012</Text>
          <Text className={t("mt-2 font-display text-xl text-verify-green", "mt-2 font-display text-xl text-verify-green-dark")}>
            Verified — GREEN
          </Text>
        </GlassPanel>

        <View className="flex-row flex-wrap gap-3">
          {["Trace", "Verify", "Monitor", "Predict"].map((label) => (
            <HexCard key={label} className="h-28 w-[47%]">
              <Text className={t("font-display text-base text-foreground", "font-display text-base text-foreground-dark")}>
                {label}
              </Text>
            </HexCard>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}