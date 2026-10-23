import { PREMIUM_PRICE_USD } from "@/lib/plans";

/** Wompi charges in COP. Price in whole pesos, configurable without a deploy of code. */
export function premiumPriceCop() {
  const value = Number(process.env.PREMIUM_PRICE_COP);
  return Number.isInteger(value) && value > 0 ? value : 40_000;
}

/** What we record in `payments`: the nominal USD price, so admin revenue stays in one currency. */
export const RECORDED_PRICE = { amountCents: PREMIUM_PRICE_USD * 100, currency: "USD" } as const;
