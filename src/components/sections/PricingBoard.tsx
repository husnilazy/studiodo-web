"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "../Icon";
import type { PublicPlan } from "@/lib/api";
import { kioskLabel, pickInterval, planOptions, type Interval } from "@/lib/pricing";
import { formatRupiah } from "@/lib/format";

export type VolumeOffer = { title: string; body: string; perks: string[]; cta: string; href: string; external: boolean };

const COMMON_FEATURES = ["QRIS dan voucher", "Galeri cloud untuk pelanggan", "Update aplikasi otomatis"];

type Row = { label: string; included: boolean };

/** Every line a plan card lists, in order: kiosk count, features every plan has, gated features, then the plan's own extras. */
function featureRows(plan: PublicPlan): Row[] {
  return [
    { label: kioskLabel(plan.kioskLimit), included: true },
    ...COMMON_FEATURES.map((label) => ({ label, included: true })),
    { label: "Screen Builder (desain layar kiosk)", included: plan.screenBuilderEnabled },
    { label: "GIF dan video", included: plan.gifVideoEnabled },
    ...(plan.features ?? []).map((label) => ({ label, included: true })),
  ];
}

const formatEnds = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

export function PricingBoard({ plans, volume }: { plans: PublicPlan[]; volume: VolumeOffer }) {
  const options = plans.map(planOptions);
  const hasYearly = options.some((o, i) => o.yearly && plans[i].billingInterval !== "yearly");
  const maxSavings = Math.max(0, ...options.map((o) => o.yearlySavingsPercent));
  const [interval, setInterval] = useState<Interval>(hasYearly ? "yearly" : "monthly");
  const featuredIndex = plans.findIndex((p) => p.featured);
  const highlight = featuredIndex >= 0 ? featuredIndex : plans.length >= 3 ? Math.floor(plans.length / 2) : -1;

  const gridClass = plans.length === 1 ? "max-w-[440px]" : plans.length === 2 ? "max-w-[900px] md:grid-cols-2" : plans.length === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="flex w-full flex-col gap-14">
      {hasYearly && (
        <div data-reveal="up" className="flex flex-col items-center gap-3">
          <div role="radiogroup" aria-label="Periode langganan" className="glass relative inline-flex rounded-full! p-1.5">
            <span
              aria-hidden="true"
              className="absolute inset-y-1.5 w-[calc(50%-6px)] rounded-full bg-foreground shadow-md transition-transform duration-300 ease-out"
              style={{ transform: interval === "yearly" ? "translateX(calc(100% + 0px))" : "translateX(0)", left: 6 }}
            />
            {(["monthly", "yearly"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={interval === value}
                onClick={() => setInterval(value)}
                className={`relative z-10 min-w-[130px] rounded-full px-6 py-2.5 text-[15px] font-semibold transition-colors ${interval === value ? "text-[var(--on-foreground)]" : "text-muted hover:text-foreground"}`}
              >
                {value === "monthly" ? "Bulanan" : "Tahunan"}
              </button>
            ))}
          </div>
          {maxSavings > 0 && (
            <p className="flex items-center gap-2 text-[14px] font-medium text-muted">
              <span className="rounded-full bg-[#dff7ec] px-2.5 py-0.5 text-xs font-bold text-[#0f6b45]">Hemat hingga {maxSavings}%</span>
              dengan langganan tahunan
            </p>
          )}
        </div>
      )}

      <div className={`mx-auto grid w-full gap-6 ${gridClass}`}>
        {plans.map((plan, i) => {
          const featured = i === highlight;
          const opts = options[i];
          const { interval: shown, option } = pickInterval(opts, interval);
          const free = option.final === 0;
          const discounted = option.final < option.list;
          const off = Math.round((1 - option.final / option.list) * 100);
          const muted = featured ? "text-[#c6cce0]" : "text-muted";
          const periodWord = shown === "yearly" ? "tahun" : "bulan";
          return (
            <article
              key={plan.slug}
              data-reveal="up"
              data-delay={String(i * 120)}
              className={`${featured ? "glass-dark lg:-translate-y-3" : "glass"} lift relative flex flex-col gap-5 p-8 sm:p-9`}
            >
              {featured && (
                <span className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3.5 py-1.5 text-xs font-semibold">
                  <Icon name="star" className="h-3.5 w-3.5" />
                  Paling populer
                </span>
              )}
              <div>
                <h3 className={`font-display text-[24px] tracking-tight ${featured ? "text-white" : ""}`}>{plan.name}</h3>
                {plan.description && <p className={`mt-1.5 min-h-[46px] text-[15px] leading-relaxed ${muted}`}>{plan.description}</p>}
              </div>

              <div className="min-h-[132px]">
                {discounted && (
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`text-[16px] line-through ${featured ? "text-white/45" : "text-muted/70"}`}>{formatRupiah(option.list)}</span>
                    <span className="rounded-full bg-[#ffe3e8] px-2.5 py-0.5 text-xs font-bold text-[#b4233f]">Hemat {off}%</span>
                  </div>
                )}
                <div className="flex flex-wrap items-baseline gap-x-1.5">
                  <span className={`font-display text-[36px] leading-none tracking-tight xl:text-[40px] ${featured ? "text-white" : ""}`}>{free ? "Gratis" : formatRupiah(option.final)}</span>
                  {!free && <span className={`text-[15px] ${muted}`}>/{periodWord}</span>}
                </div>
                {shown === "yearly" && !free && (
                  <p className={`mt-2 text-[14px] ${muted}`}>
                    Setara <strong className={featured ? "text-white" : "text-foreground"}>{formatRupiah(option.perMonth)}</strong> per bulan
                  </p>
                )}
                {opts.promoPercent > 0 && plan.discountLabel && (
                  <p className={`mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold ${featured ? "text-[#ffd98a]" : "text-[#9a5b00]"}`}>
                    <Icon name="gift" className="h-3.5 w-3.5" />
                    {plan.discountLabel}
                    {opts.promoEndsAt ? ` · sampai ${formatEnds(opts.promoEndsAt)}` : ""}
                  </p>
                )}
                {opts.promoPercent > 0 && !plan.discountLabel && opts.promoEndsAt && (
                  <p className={`mt-2 text-[13px] font-semibold ${featured ? "text-[#ffd98a]" : "text-[#9a5b00]"}`}>Promo sampai {formatEnds(opts.promoEndsAt)}</p>
                )}
              </div>

              <div className={`h-px ${featured ? "bg-white/15" : "bg-foreground/10"}`} />
              <ul className="flex flex-1 flex-col gap-3 text-[15px]">
                {featureRows(plan).map((row) => (
                  <li key={row.label} className={`flex items-start gap-3 ${row.included ? "" : featured ? "text-white/40" : "text-muted/60"}`}>
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        row.included ? (featured ? "bg-white/20 text-white" : "bg-accent/15 text-accent") : featured ? "bg-white/10 text-white/40" : "bg-foreground/[0.06] text-muted/60"
                      }`}
                    >
                      <Icon name={row.included ? "check" : "minus"} className="h-3 w-3" />
                    </span>
                    <span className={row.included ? "" : "line-through decoration-1"}>{row.label}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/daftar?paket=${encodeURIComponent(plan.slug)}&periode=${shown === "yearly" ? "tahunan" : "bulanan"}`}
                className={`btn py-[15px] text-center ${featured ? "bg-white text-[#0b1020]" : "border border-foreground/20 text-foreground"}`}
              >
                {featured ? "Coba Gratis 7 Hari" : "Pilih Paket"}
              </Link>
            </article>
          );
        })}
      </div>

      <p data-reveal="up" className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-center text-[14px] text-muted">
        {["Batal kapan saja", "Coba gratis 7 hari", "Pembayaran lewat payment gateway resmi", "Harga dalam Rupiah"].map((note) => (
          <span key={note} className="inline-flex items-center gap-2"><Icon name="check" className="h-3.5 w-3.5 text-accent" />{note}</span>
        ))}
      </p>

      {plans.length >= 2 && <CompareTable plans={plans} options={options} interval={interval} />}

      <VolumeBanner volume={volume} />
    </div>
  );
}

function CompareTable({ plans, options, interval }: { plans: PublicPlan[]; options: ReturnType<typeof planOptions>[]; interval: Interval }) {
  // Rows come from what the plans really differ on: kiosk count, the two gated features, and every extra bullet any plan lists.
  const extras = Array.from(new Set(plans.flatMap((p) => p.features ?? [])));
  const cell = (included: boolean) =>
    included ? (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent"><Icon name="check" className="h-3.5 w-3.5" /></span>
    ) : (
      <span className="mx-auto block h-0.5 w-4 rounded-full bg-foreground/20" aria-label="Tidak termasuk" />
    );
  const rows: { label: string; render: (plan: PublicPlan) => React.ReactNode }[] = [
    { label: "Jumlah kiosk", render: (p) => <span className="font-semibold">{p.kioskLimit === null ? "Tak terbatas" : p.kioskLimit}</span> },
    { label: "QRIS, voucher, galeri cloud, update otomatis", render: () => cell(true) },
    { label: "Screen Builder", render: (p) => cell(p.screenBuilderEnabled) },
    { label: "GIF dan video", render: (p) => cell(p.gifVideoEnabled) },
    ...extras.map((label) => ({ label, render: (p: PublicPlan) => cell((p.features ?? []).includes(label)) })),
  ];
  return (
    <div data-reveal="up" className="glass overflow-x-auto p-2 sm:p-4">
      <h3 className="px-4 pb-2 pt-4 font-display text-[22px] tracking-tight">Bandingkan paket</h3>
      <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left text-[15px]">
        <thead>
          <tr>
            <th className="px-4 py-3 font-medium text-muted" />
            {plans.map((plan, i) => {
              const { interval: shown, option } = pickInterval(options[i], interval);
              return (
                <th key={plan.slug} className="px-4 py-3 text-center align-bottom">
                  <div className="font-display text-[18px] font-semibold tracking-tight">{plan.name}</div>
                  <div className="mt-0.5 text-[13px] font-normal text-muted">{option.final === 0 ? "Gratis" : `${formatRupiah(option.final)}/${shown === "yearly" ? "thn" : "bln"}`}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="[&>td]:border-t [&>td]:border-foreground/[0.08]">
              <td className="px-4 py-3.5 text-[15px] text-muted">{row.label}</td>
              {plans.map((plan) => (
                <td key={plan.slug} className="px-4 py-3.5 text-center">{row.render(plan)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VolumeBanner({ volume }: { volume: VolumeOffer }) {
  const linkProps = volume.external ? { target: "_blank", rel: "noreferrer" } : {};
  return (
    <section data-reveal="scale" aria-labelledby="penawaran-volume" className="glass-dark relative overflow-hidden p-8 sm:p-12">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="flex flex-col gap-5">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white">
            <Icon name="users" className="h-3.5 w-3.5" /> Untuk banyak booth
          </span>
          <h3 id="penawaran-volume" className="font-display text-3xl tracking-tight text-white md:text-4xl">{volume.title}</h3>
          <p className="max-w-[560px] text-[16px] leading-relaxed text-[#c6cce0]">{volume.body}</p>
          <ul className="grid gap-3 text-[15px] text-white sm:grid-cols-2">
            {volume.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20"><Icon name="check" className="h-3 w-3" /></span>
                {perk}
              </li>
            ))}
          </ul>
          <Link href={volume.href} {...linkProps} className="btn mt-1 w-fit bg-white px-8 py-4 text-[#0b1020]">
            {volume.cta}
          </Link>
        </div>
        <div aria-hidden="true" className="relative mx-auto hidden h-56 w-56 items-center justify-center lg:flex">
          <span className="orbit-spin absolute inset-0 rounded-full border border-white/20"><span className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-white/70" /></span>
          <span className="absolute inset-6 rounded-full border border-white/10" />
          <div className="relative text-center">
            <p className="font-display text-6xl tracking-tight text-white">10+</p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-[#c6cce0]">booth</p>
          </div>
        </div>
      </div>
    </section>
  );
}
