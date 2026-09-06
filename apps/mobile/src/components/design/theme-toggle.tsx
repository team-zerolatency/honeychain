import { Pressable } from "react-native";
import { Sun, Moon } from "lucide-react-native";
import { useColorScheme } from "nativewind";

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();
  return (
    <Pressable onPress={() => setColorScheme(colorScheme === "dark" ? "light" : "dark")} className="p-2" hitSlop={8}>
      {colorScheme === "dark" ? <Sun size={18} color="#E8A317" /> : <Moon size={18} color="#C2790C" />}
    </Pressable>
  );
}