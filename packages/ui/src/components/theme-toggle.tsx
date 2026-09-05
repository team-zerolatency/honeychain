"use client";

import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  let t = (key: string) => key;
  try {
    t = useTranslations("nav");
  } catch {
    // Graceful fallback when rendered outside NextIntlClientProvider
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("themeToggle")}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}