import Link from "next/link";
import { SectionHeading } from "../SectionHeading";
import { Icon } from "../Icon";
import { Orb } from "../Decor";
import { fetchPublicPlans, type PublicPlan } from "@/lib/api";
import type { PricingData } from "@/lib/content";

type Card = {
  key: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured: boolean;
};

const rupiah = new Intl.NumberFormat("id-ID");

function toCard(plan: PublicPlan, featured: boolean): Card {
  const price = Number(plan.price);
  const features = [
    plan.kioskLimit === null ? "Kiosk tak terbatas" : `${plan.kioskLimit} kiosk`,
    "QRIS dan voucher",
    "Galeri cloud",
    "Update otomatis",
    ...(plan.screenBuilderEnabled ? ["Screen Builder"] : []),
    ...(plan.gifVideoEnabled ? ["GIF dan video"] : []),
  ];
  return {
    key: plan.slug,
    name: plan.name,
    price: price === 0 ? "Gratis" : `Rp ${rupiah.format(price)}`,
    period: price === 0 ? "" : plan.billingInterval === "yearly" ? "/tahun" : "/bulan",
    description: plan.description ?? "",
    features,
    cta: featured ? "Coba Gratis 7 Hari" : "Pilih Paket",
    href: `/daftar?paket=${encodeURIComponent(plan.slug)}`,
    featured,
  };
}

export async function Pricing({ data }: { data: PricingData }) {
  const plans = await fetchPublicPlans();
  // With 3+ plans the middle one is highlighted; with fewer, none is.
  const cards = plans
    ? plans.map((p, i) => toCard(p, plans.length >= 3 && i === Math.floor(plans.length / 2)))
    : [];

  return (
    <section id="harga" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col items-center gap-12 px-4 py-20 md:px-16">
      <Orb className="-left-10 top-24 h-56 w-56" speed={0.12} />
      <Orb className="-right-16 bottom-10 h-80 w-80" speed={-0.14} ring spin />
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      {cards.length === 0 && (
        <div className="glass flex w-full max-w-[720px] flex-col items-start gap-4 p-10">
          <p className="text-[15px] leading-relaxed text-muted">Daftar harga sedang tidak dapat dimuat. Hubungi tim kami untuk informasi paket dan harga terbaru.</p>
          <Link href="/kontak" className="btn btn-primary px-7 py-3.5">Hubungi Kami</Link>
        </div>
      )}
      <div className={`mx-auto grid w-full gap-6 ${cards.length === 1 ? "max-w-[440px]" : cards.length === 2 ? "max-w-[900px] md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}>
        {cards.map((p, i) => (
          <article
            key={p.key}
            data-reveal="up"
            data-delay={String(i * 120)}
            className={`${p.featured ? "glass-dark lg:-translate-y-3" : "glass"} lift relative flex min-h-[500px] flex-col gap-5 p-8 sm:p-10`}
          >
            {p.featured && (
              <span className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3.5 py-1.5 text-xs font-semibold">
                <Icon name="star" className="h-3.5 w-3.5" />
                Paling populer
              </span>
            )}
            <h3 className={`font-display text-[22px] tracking-tight ${p.featured ? "text-white" : ""}`}>{p.name}</h3>
            <div>
              <span className={`font-display text-5xl tracking-tight ${p.featured ? "text-white" : ""}`}>{p.price}</span>
              <span className={`text-[15px] ${p.featured ? "text-[#c6cce0]" : "text-muted"}`}> {p.period}</span>
            </div>
            {p.description && (
              <p className={`text-[15px] leading-relaxed ${p.featured ? "text-[#c6cce0]" : "text-muted"}`}>{p.description}</p>
            )}
            <div className={`h-px ${p.featured ? "bg-white/15" : "bg-foreground/10"}`} />
            <ul className="flex flex-1 flex-col gap-3.5 text-[15px]">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${p.featured ? "bg-white/20 text-white" : "bg-accent/15 text-accent"}`}><Icon name="check" className="h-3 w-3" /></span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={p.href}
              className={`btn py-[15px] text-center ${
                p.featured ? "bg-white text-[#0b1020]" : "border border-foreground/20 text-foreground"
              }`}
            >
              {p.cta}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
