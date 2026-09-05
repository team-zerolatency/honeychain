"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { GlassPanel } from "@repo/ui/glass-panel";
import { Link } from "@/i18n/navigation";


export function Hero() {
  const t = useTranslations("home");

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-16 pb-12 md:grid-cols-2 md:items-center">
      <div>
        <h1 className="font-display text-4xl font-medium leading-tight md:text-5xl">
          <span className="block">{t("titleLine1")}</span>
          <span className="block">{t("titleLine2")}</span>
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/verify" className="touch-manipulation">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="hero-cta inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background"
            >
              {t("cta")}
            </motion.span>
          </Link>
          <Link href="/login" className="touch-manipulation">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors"
            >
              {t("ctaSecondary")}
            </motion.span>
          </Link>
        </div>


        {/* Verification badge placed directly below the CTA buttons on the left */}
        <GlassPanel className="mt-8 max-w-sm">
          <p className="text-xs text-muted-foreground">{t("demoBottleCode")}</p>
          <p className="mt-2 font-display text-2xl text-verify-green">{t("demoVerified")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("demoNoAnomaly")}</p>
        </GlassPanel>
      </div>

      {/* Hero icon / logo on the right side */}
      <div className="flex items-center justify-center">
        <div className="relative flex items-center justify-center p-6">
          <div className="animate-glow absolute -inset-6 rounded-full bg-amber-500/20 blur-3xl dark:bg-amber-400/15 pointer-events-none" />
          <div className="animate-float cursor-pointer">
            <Image
              src="/logo.png"
              alt="HoneyChain Hero"
              width={340}
              height={340}
              className="relative drop-shadow-2xl transition-transform duration-500 hover:scale-105 select-none"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}