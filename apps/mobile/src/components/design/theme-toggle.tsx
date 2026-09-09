import { Pressable } from "react-native";
import { Sun, Moon } from "lucide-react-native";
import { useColorScheme } from "nativewind";

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  return (
    <Pressable onPress={toggleColorScheme} className="p-2" hitSlop={8}>
      {colorScheme === "dark" ? <Sun size={18} color="#E8A317" /> : <Moon size={18} color="#C2790C" />}
    </Pressable>
  );
}