import { View, Text } from "react-native";
import { ThemeToggle } from "@/components/design/theme-toggle";
import { LanguageSwitcher } from "@/components/design/language-switcher";
import { useAppColorScheme } from "@/lib/theme";

export function ScreenHeader({ title }: { title: string }) {
  const { t } = useAppColorScheme();
  return (
    <View className="flex-row items-center justify-between px-6 pb-4 pt-16">
      <Text className={t("font-display text-xl text-foreground", "font-display text-xl text-foreground-dark")}>
        {title}
      </Text>
      <View className="flex-row items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </View>
    </View>
  );
}