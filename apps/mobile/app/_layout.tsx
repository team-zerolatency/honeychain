import "../global.css";
import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Fraunces_500Medium, Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import { Manrope_400Regular, Manrope_600SemiBold } from "@expo-google-fonts/manrope";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium, Fraunces_600SemiBold, Manrope_400Regular, Manrope_600SemiBold,
  });

  useEffect(() => {
    if (!colorScheme) setColorScheme("dark"); // same dark-first brand default as web
  }, [colorScheme, setColorScheme]);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View className={`flex-1 ${colorScheme === "dark" ? "dark" : ""}`}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}