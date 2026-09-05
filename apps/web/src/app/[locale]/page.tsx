import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { BentoGrid, BentoCell } from "@repo/ui/bento-grid";
import { HexCard } from "@repo/ui/hex-card";
import { GlassPanel } from "@repo/ui/glass-panel";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const p = await getTranslations("pillars");


  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h1 className="font-display text-4xl font-medium leading-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">{t("subtitle")}</p>
          <div className="mt-8 flex gap-3">
            <button className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity">
              {t("cta")}
            </button>
            <button className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent/10 transition-colors">
              {t("ctaSecondary")}
            </button>
          </div>

          {/* Verification badge placed directly below the CTA buttons on the left */}
          <GlassPanel className="mt-8 max-w-sm">
            <p className="text-xs text-muted-foreground">Bottle HC-2026-B0F3A2-000012</p>
            <p className="mt-2 font-display text-2xl text-verify-green">Verified — GREEN</p>
            <p className="mt-1 text-sm text-muted-foreground">No anomalies detected.</p>
          </GlassPanel>
        </div>

        {/* Hero icon / logo on the right side */}
        <div className="flex items-center justify-center">
          <div className="relative flex items-center justify-center p-6">
            <div className="absolute -inset-6 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-400/10 pointer-events-none" />
            <Image
              src="/logo.png"
              alt="HoneyChain Hero"
              width={340}
              height={340}
              className="relative drop-shadow-2xl transition-transform duration-500 hover:scale-105"
              priority
            />
          </div>
        </div>
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