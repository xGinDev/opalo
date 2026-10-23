import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { Leaderboard } from "@/components/landing/leaderboard";
import { Pricing } from "@/components/landing/pricing";

/** The leaderboard is regenerated at most every 5 minutes; the rest of the page is static. */
export const revalidate = 300;

/** Figma 3:6 "01 Sitio público — Inicio" ("Ejemplos" replaced by the leaderboard). */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Leaderboard />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
