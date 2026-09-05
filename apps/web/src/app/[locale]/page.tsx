import { useTranslations } from "next-intl";
import { BentoGrid, BentoCell } from "@/components/design/bento-grid";
import { HexCard } from "@/components/design/hex-card";
import { GlassPanel } from "@/components/design/glass-panel";

export default function Home() {
  const t = useTranslations("home");
  const p = useTranslations("pillars");

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="font-display text-4xl font-medium leading-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">{t("subtitle")}</p>
          <div className="mt-8 flex gap-3">
            <button className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background">
              {t("cta")}
            </button>
            <button className="rounded-full border border-border px-5 py-2.5 text-sm font-medium">
              {t("ctaSecondary")}
            </button>
          </div>
        </div>

        <GlassPanel className="ml-auto max-w-sm">
          <p className="text-xs text-muted-foreground">Bottle HC-2026-B0F3A2-000012</p>
          <p className="mt-2 font-display text-2xl text-verify-green">Verified — GREEN</p>
          <p className="mt-1 text-sm text-muted-foreground">No anomalies detected.</p>
        </GlassPanel>
      </div>

      <BentoGrid className="mt-16">
        <BentoCell>
          <HexCard><p className="font-display text-lg">Trace</p><p className="mt-2 text-sm text-muted-foreground">{p("trace")}</p></HexCard>
        </BentoCell>
        <BentoCell>
          <HexCard><p className="font-display text-lg">Verify</p><p className="mt-2 text-sm text-muted-foreground">{p("verify")}</p></HexCard>
        </BentoCell>
        <BentoCell>
          <HexCard><p className="font-display text-lg">Monitor</p><p className="mt-2 text-sm text-muted-foreground">{p("monitor")}</p></HexCard>
        </BentoCell>
        <BentoCell>
          <HexCard><p className="font-display text-lg">Predict</p><p className="mt-2 text-sm text-muted-foreground">{p("predict")}</p></HexCard>
        </BentoCell>
      </BentoGrid>
    </main>
  );
}