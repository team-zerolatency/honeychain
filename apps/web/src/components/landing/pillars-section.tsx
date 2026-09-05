"use client";

import { useTranslations } from "next-intl";
import { HexCard } from "@repo/ui/hex-card";
import { ScrollReveal } from "@repo/ui/scroll-reveal";
import { motion } from "motion/react";

const PILLARS = ["trace", "verify", "monitor", "predict"] as const;

export function PillarsSection() {
  const t = useTranslations("pillars");

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <ScrollReveal className="grid grid-cols-1 gap-4 md:grid-cols-4 items-stretch">
        {PILLARS.map((key) => (
          <motion.div key={key} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
            <HexCard className="h-full flex flex-col justify-start">
              <p className="font-display text-lg capitalize">{key}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t(key)}</p>
            </HexCard>
          </motion.div>
        ))}
      </ScrollReveal>
    </section>

  );
}