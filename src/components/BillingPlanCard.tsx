"use client";

import { useState } from "react";
import { CheckoutButton } from "@/components/CheckoutButton";
import type { PublicPlan } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { kioskLabel, pickInterval, planOptions, type Interval } from "@/lib/pricing";

/** One plan in the tenant portal's billing page: price (with promo), a monthly/yearly choice when the plan has both, and the pay button. */
export function BillingPlanCard({ plan, current, canPay }: { plan: PublicPlan; current: boolean; canPay: boolean }) {
  const options = planOptions(plan);
  const both = Boolean(options.monthly && options.yearly && plan.billingInterval !== "yearly");
  const [wanted, setWanted] = useState<Interval>(both ? "yearly" : "monthly");
  const { interval, option } = pickInterval(options, wanted);
  const word = interval === "yearly" ? "tahun" : "bulan";
  const discounted = option.final < option.list;

  return (
    <article className="glass flex flex-col gap-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl tracking-tight">{plan.name}</h2>
        {current && <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">Paket Anda</span>}
      </div>

      {both && (
        <div role="radiogroup" aria-label="Periode" className="inline-flex w-fit rounded-full border border-foreground/10 bg-foreground/[0.04] p-1 text-[13px] font-semibold">
          {(["monthly", "yearly"] as const).map((value) => (
            <button key={value} type="button" role="radio" aria-checked={wanted === value} onClick={() => setWanted(value)} className={`rounded-full px-4 py-1.5 transition ${wanted === value ? "bg-foreground text-[var(--on-foreground)] shadow-sm" : "text-muted"}`}>
              {value === "monthly" ? "Bulanan" : `Tahunan${options.yearlySavingsPercent > 0 ? ` · -${options.yearlySavingsPercent}%` : ""}`}
            </button>
          ))}
        </div>
      )}

      <div>
        {discounted && <div className="text-[15px] text-muted line-through">{formatRupiah(option.list)}</div>}
        <div><span className="font-display text-4xl tracking-tight">{formatRupiah(option.final)}</span><span className="text-muted"> /{word}</span></div>
        {interval === "yearly" && <div className="mt-1 text-[13px] text-muted">Setara {formatRupiah(option.perMonth)} per bulan</div>}
        {options.promoPercent > 0 && plan.discountLabel && <div className="mt-1 text-[13px] font-semibold text-[#9a5b00]">{plan.discountLabel}</div>}
      </div>

      {plan.description && <p className="text-[15px] text-muted">{plan.description}</p>}
      <p className="text-[13px] text-muted">{kioskLabel(plan.kioskLimit)}</p>
      {canPay && (
        <div className="mt-auto">
          <CheckoutButton planSlug={plan.slug} interval={interval} label={current ? `Perpanjang 1 ${word}` : "Pilih paket ini"} featured={false} />
        </div>
      )}
    </article>
  );
}
