import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Navbar() {
  const t = useTranslations("nav");

  return (
    <nav className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/" className="font-display text-lg font-medium">
        Honey Chain
      </Link>
      <div className="hidden gap-6 text-sm text-muted-foreground md:flex">
        <span>{t("trace")}</span>
        <span>{t("verify")}</span>
        <span>{t("monitor")}</span>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </nav>
  );
}