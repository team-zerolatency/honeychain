import { Pressable, Text } from "react-native";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const languages = ["en", "hi", "pa"];
  const currentIndex = Math.max(0, languages.indexOf(i18n.language));
  const nextLanguage = languages[(currentIndex + 1) % languages.length];
  const labels = { en: "EN", hi: "हि", pa: "ਪੰ" };

  return (
    <Pressable onPress={() => i18n.changeLanguage(nextLanguage)} className="p-2" hitSlop={8}>
      <Text className="text-xs font-medium text-accent-dark">{labels[i18n.language as keyof typeof labels] ?? "EN"}</Text>
    </Pressable>
  );
}