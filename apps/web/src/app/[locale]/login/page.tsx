import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@repo/ui/card";
import { HexCard } from "@repo/ui/hex-card";

export default function LoginPage() {
  const t = useTranslations("auth");

  return (
    <main className="mx-auto flex max-w-md flex-col px-6 py-20">
      <Card className="p-6 md:p-7">
        <HexCard className="p-8">
          <h1 className="font-display text-2xl font-medium">{t("loginTitle")}</h1>
          <div className="mt-6">
            <LoginForm />
          </div>
        </HexCard>
      </Card>
    </main>
  );
}