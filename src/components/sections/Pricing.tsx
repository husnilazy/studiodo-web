import Link from "next/link";
import { SectionHeading } from "../SectionHeading";
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

// Shown only when the API is unreachable (e.g. local dev without the server).
const placeholders: Card[] = [
  { key: "p1", name: "[Nama Paket 1]", price: "[Rp —]", period: "/bulan", description: "[Deskripsi singkat dari tabel plans]", features: ["[N] kiosk", "QRIS dan voucher", "Galeri cloud", "Update otomatis"], cta: "Pilih Paket", href: "/daftar", featured: false },
  { key: "p2", name: "[Nama Paket 2]", price: "[Rp —]", period: "/bulan", description: "[Deskripsi singkat dari tabel plans]", features: ["[N] kiosk", "Semua fitur paket 1", "Screen Builder", "GIF dan video"], cta: "Coba Gratis 7 Hari", href: "/daftar", featured: true },
  { key: "p3", name: "[Nama Paket 3]", price: "[Rp —]", period: "/bulan", description: "[Deskripsi singkat dari tabel plans]", features: ["Kiosk tak terbatas", "Semua fitur paket 2", "Dukungan prioritas"], cta: "Hubungi Kami", href: "/kontak", featured: false },
];

export async function Pricing({ data }: { data: PricingData }) {
  const plans = await fetchPublicPlans();
  // With 3+ plans the middle one is highlighted; with fewer, none is.
  const cards = plans
    ? plans.map((p, i) => toCard(p, plans.length >= 3 && i === Math.floor(plans.length / 2)))
    : placeholders;

  return (
    <section id="harga" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col items-center gap-12 px-4 py-20 md:px-16">
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      <div className="grid w-full gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((p) => (
          <article
            key={p.key}
            className={`${p.featured ? "glass-dark" : "glass"} relative flex min-h-[500px] flex-col gap-5 p-10`}
          >
            {p.featured && (
              <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/15 px-3.5 py-1.5 text-xs font-semibold">
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
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Link
              href={p.href}
              className={`btn py-[15px] text-center ${
                p.featured ? "bg-white text-foreground" : "border border-foreground/20 text-foreground"
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
