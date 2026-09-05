import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/landing/hero";
import { PillarsSection } from "@/components/landing/pillars-section";
import { LifecycleSection } from "@/components/landing/lifecycle-section";
import { ActorsSection } from "@/components/landing/actors-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/footer";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <Hero />
      <PillarsSection />
      <LifecycleSection />
      <ActorsSection />
      <CtaSection />
      <Footer />
    </main>
  );
}