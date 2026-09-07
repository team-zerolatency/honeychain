import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Sprout, ScanLine } from "lucide-react-native";
import { useAppColorScheme } from "@/lib/theme";

export default function TabsLayout() {
  const { t } = useTranslation();
  const { isDark } = useAppColorScheme();

  const activeColor = isDark ? "#E8A317" : "#C2790C";
  const inactiveColor = isDark ? "#B8A88C" : "#6E5B3E";
  const backgroundColor = isDark ? "#1E160E" : "#FFFBF2";
  const borderColor = isDark ? "#382A18" : "#E7D9BB";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: { backgroundColor, borderTopColor: borderColor },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t("dashboard.nav.overview"), tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="harvests"
        options={{ title: t("dashboard.nav.harvests"), tabBarIcon: ({ color, size }) => <Sprout color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="scan"
        options={{ title: t("verify.title"), tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size} /> }}
      />
    </Tabs>
  );
}