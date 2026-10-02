import Link from "next/link";
import { SectionHeading } from "../SectionHeading";
import { Orb } from "../Decor";
import { PricingBoard, type VolumeOffer } from "./PricingBoard";
import { fetchPublicPlans } from "@/lib/api";
import { getSite, whatsappLink, type PricingData } from "@/lib/content";

// Used when the CMS copy predates these fields (an older saved "Harga" section) so the offer never renders empty.
const DEFAULTS = {
  subtitle: "Pilih paket sesuai jumlah booth Anda. Hemat lebih banyak dengan langganan tahunan.",
  volumeTitle: "Punya lebih dari 10 booth?",
  volumeBody: "Kelola puluhan booth dari satu dashboard dengan harga khusus per kiosk. Tim kami bantu dari instalasi sampai operasional.",
  volumePerks: ["Harga khusus per kiosk untuk 10+ booth", "Pendampingan instalasi dan pelatihan crew", "Dukungan prioritas lewat WhatsApp", "Satu tagihan untuk semua booth"],
  volumeCta: "Minta penawaran",
};

export async function Pricing({ data }: { data: PricingData }) {
  const [plans, site] = await Promise.all([fetchPublicPlans(), getSite()]);
  const wa = whatsappLink(site, "Halo STUDIODO, saya punya lebih dari 10 booth dan ingin minta penawaran khusus.");
  const cmsPerks = (data.volumePerks ?? []).map((perk) => perk.text?.trim()).filter((text): text is string => Boolean(text));
  const volume: VolumeOffer = {
    title: data.volumeTitle?.trim() || DEFAULTS.volumeTitle,
    body: data.volumeBody?.trim() || DEFAULTS.volumeBody,
    perks: cmsPerks.length > 0 ? cmsPerks : DEFAULTS.volumePerks,
    cta: data.volumeCta?.trim() || DEFAULTS.volumeCta,
    href: wa ?? "/kontak",
    external: Boolean(wa),
  };
  const subtitle = data.subtitle?.trim() || DEFAULTS.subtitle;

  return (
    <section id="harga" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col items-center gap-12 px-4 py-20 md:px-16">
      <Orb className="-left-10 top-24 h-56 w-56" speed={0.12} />
      <Orb className="-right-16 bottom-10 h-80 w-80" speed={-0.14} ring spin />
      <div className="flex flex-col items-center gap-5">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} />
        <p data-reveal="up" data-delay="120" className="max-w-[620px] text-center text-[17px] leading-relaxed text-muted">{subtitle}</p>
      </div>
      {!plans && (
        <div className="glass flex w-full max-w-[720px] flex-col items-start gap-4 p-10">
          <p className="text-[15px] leading-relaxed text-muted">Daftar harga sedang tidak dapat dimuat. Hubungi tim kami untuk informasi paket dan harga terbaru.</p>
          <Link href="/kontak" className="btn btn-primary px-7 py-3.5">Hubungi Kami</Link>
        </div>
      )}
      {plans && <PricingBoard plans={plans} volume={volume} />}
    </section>
  );
}
