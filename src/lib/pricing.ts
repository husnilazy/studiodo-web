import type { PublicPlan, PublicPriceOption } from "./api";

export type Interval = "monthly" | "yearly";

export type PlanOptions = {
  monthly: PublicPriceOption | null;
  yearly: PublicPriceOption | null;
  yearlySavingsPercent: number;
  promoPercent: number;
  promoEndsAt: string | null;
};

/**
 * The prices to show for a plan. The API sends them ready-made (`pricing`, computed by the same code checkout charges
 * with); an older API without that field falls back to the plain list price so the page still renders.
 */
export function planOptions(plan: PublicPlan): PlanOptions {
  if (plan.pricing) {
    return {
      monthly: plan.pricing.monthly,
      yearly: plan.pricing.yearly,
      yearlySavingsPercent: plan.pricing.yearlySavingsPercent,
      promoPercent: plan.pricing.activeDiscountPercent,
      promoEndsAt: plan.pricing.discountEndsAt,
    };
  }
  const price = Number(plan.price) || 0;
  const only: PublicPriceOption = { list: price, final: price, discountPercent: 0, perMonth: plan.billingInterval === "yearly" ? Math.round(price / 12) : price };
  return plan.billingInterval === "yearly"
    ? { monthly: null, yearly: only, yearlySavingsPercent: 0, promoPercent: 0, promoEndsAt: null }
    : { monthly: only, yearly: null, yearlySavingsPercent: 0, promoPercent: 0, promoEndsAt: null };
}

/** Which interval a plan actually shows when the visitor asked for `wanted` (a plan may only offer one of them). */
export function pickInterval(options: PlanOptions, wanted: Interval): { interval: Interval; option: PublicPriceOption } {
  if (wanted === "yearly" && options.yearly) return { interval: "yearly", option: options.yearly };
  if (options.monthly) return { interval: "monthly", option: options.monthly };
  return { interval: "yearly", option: options.yearly! };
}

export const kioskLabel = (limit: number | null) => (limit === null ? "Kiosk tak terbatas" : limit === 1 ? "1 kiosk" : `Hingga ${limit} kiosk`);
