import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/stores/auth-store";
import { useAppColorScheme } from "@/lib/theme";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);
  const { isDark } = useAppColorScheme();

  useEffect(() => {
    if (isBootstrapped && !role) router.replace("/login");
  }, [isBootstrapped, role, router]);

  if (!isBootstrapped) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={isDark ? "#E8A317" : "#C2790C"} />
      </View>
    );
  }
  if (!role) return null;
  return <>{children}</>;
}