import "../global.css";
import "@/i18n";
import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Fraunces_500Medium, Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import { Manrope_400Regular, Manrope_600SemiBold } from "@expo-google-fonts/manrope";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthBootstrap } from "@/components/auth-bootstrap";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [fontsLoaded] = useFonts({ Fraunces_500Medium, Fraunces_600SemiBold, Manrope_400Regular, Manrope_600SemiBold });

  useEffect(() => {
    if (!colorScheme) setColorScheme("dark");
  }, [colorScheme, setColorScheme]);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <View className="flex-1">
        <AuthBootstrap />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" options={{ presentation: "modal" }} />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}