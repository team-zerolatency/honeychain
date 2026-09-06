import { View } from "react-native";
import { BlurView } from "expo-blur";
import { useColorScheme } from "nativewind";

export function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { colorScheme } = useColorScheme();
  return (
    <View className={`overflow-hidden rounded-2xl border border-accent/20 ${className}`}>
      <BlurView intensity={40} tint={colorScheme === "dark" ? "dark" : "light"} className="p-4">
        {children}
      </BlurView>
    </View>
  );
}