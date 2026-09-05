"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";

export function CtaSection() {
  const t = useTranslations("cta");

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 text-center">
      <h2 className="font-display text-3xl font-medium md:text-4xl">{t("heading")}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t("subtitle")}</p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-medium text-background"
      >
        {t("button")}
      </motion.button>
    </section>
  );
}