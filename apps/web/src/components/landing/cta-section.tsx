"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { QrCodeIcon } from "@/components/icons/qr-code-icon";

export function CtaSection() {
  const t = useTranslations("cta");

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 text-center">
      <h2 className="font-display text-3xl font-medium md:text-4xl">{t("heading")}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t("subtitle")}</p>
      <Link href="/verify" className="inline-block touch-manipulation">
        <motion.span
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white shadow-xs transition-colors hover:bg-accent-strong"
        >
          <QrCodeIcon className="size-4.5 shrink-0" />
          <span>{t("button")}</span>
        </motion.span>
      </Link>
    </section>
  );
}