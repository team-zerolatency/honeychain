import { Pressable, Text } from "react-native";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === "hi";

  return (
    <Pressable onPress={() => i18n.changeLanguage(isHindi ? "en" : "hi")} className="p-2" hitSlop={8}>
      <Text className="text-xs font-medium text-accent-dark">{isHindi ? "EN" : "हि"}</Text>
    </Pressable>
  );
}