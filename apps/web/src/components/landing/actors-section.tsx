"use client";

import { useTranslations } from "next-intl";
import { BentoCell } from "@repo/ui/bento-grid";

import { HexCard } from "@repo/ui/hex-card";
import { ScrollReveal } from "@repo/ui/scroll-reveal";
import { motion } from "motion/react";

const ACTORS = ["admin", "beekeeper", "storeOwner", "consumer"] as const;

export function ActorsSection() {
  const t = useTranslations("actors");

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-display text-2xl font-medium md:text-3xl">{t("heading")}</h2>
      <ScrollReveal className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4 items-stretch" stagger={0.08}>
        {ACTORS.map((actor) => (
          <BentoCell key={actor} className="h-full p-6 md:p-7 flex flex-col justify-stretch">
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">

              <HexCard className="h-full flex flex-col justify-start">
                <p className="font-display text-lg">{t(`${actor}.title`)}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t(`${actor}.description`)}</p>
              </HexCard>
            </motion.div>
          </BentoCell>
        ))}
      </ScrollReveal>
    </section>
  );
}