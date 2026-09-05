import { useTranslations } from "next-intl";
import { ScrollReveal } from "@repo/ui/scroll-reveal";

const STAGES = ["harvested", "extracted", "packed", "dispatched", "received", "availableForSale"] as const;

export function LifecycleSection() {
  const t = useTranslations("lifecycle");

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-display text-2xl font-medium md:text-3xl">{t("heading")}</h2>
      <p className="mt-2 max-w-lg text-muted-foreground">{t("description")}</p>

      <ScrollReveal className="mt-12 flex flex-col md:flex-row md:items-start md:justify-between md:gap-0" stagger={0.06}>
        {STAGES.map((stage, i) => (
          <div
            key={stage}
            className="relative flex flex-1 items-start gap-4 pb-8 md:pb-0 md:flex-col md:items-center md:text-center px-1"
          >
            {/* Connecting line between checkpoints: 1 to 2, 2 to 3, 3 to 4, 4 to 5, 5 to 6 */}
            {i < STAGES.length - 1 && (
              <>
                {/* Horizontal line for desktop */}
                <div
                  aria-hidden="true"
                  className="hidden md:block absolute top-[17px] left-1/2 w-full h-[2px] bg-gradient-to-r from-accent/70 via-accent/40 to-accent/70 z-0"
                />
                {/* Vertical line for mobile */}
                <div
                  aria-hidden="true"
                  className="md:hidden absolute top-9 left-[17px] -bottom-1 w-[2px] bg-gradient-to-b from-accent/70 to-accent/30 z-0"
                />
              </>
            )}

            {/* Checkpoint Circle */}
            <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-accent/60 bg-surface-2 font-display text-sm font-semibold text-accent shadow-sm transition-transform duration-300 hover:scale-110">
              {i + 1}
            </div>

            {/* Checkpoint Label */}
            <p className="text-sm font-medium text-foreground md:mt-3 px-1">{t(`stages.${stage}`)}</p>
          </div>
        ))}
      </ScrollReveal>
    </section>

  );
}