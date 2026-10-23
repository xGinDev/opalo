import { Examples } from "@/components/landing/examples";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { Pricing } from "@/components/landing/pricing";

/** Figma 3:6 "01 Sitio público — Inicio". */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Examples />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
