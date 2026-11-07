"use client";

import { useCount, useInView } from "./hooks";

type Stat = { value?: number; text?: string; suffix?: string; label: string; hint: string };

function Item({ s, active, i }: { s: Stat; active: boolean; i: number }) {
  const n = useCount(s.value ?? 0, active && s.value !== undefined);
  return (
    <div data-reveal="up" data-delay={String(i * 100)} className="glass lift flex flex-col gap-1 px-6 py-6 text-center md:py-7">
      <div className="font-display text-[40px] font-semibold leading-none tracking-tight text-accent md:text-5xl">
        {s.text ?? <><span className="tabular-nums">{Math.round(n).toLocaleString("id-ID")}</span>{s.suffix}</>}
      </div>
      <div className="mt-2 text-[15px] font-semibold">{s.label}</div>
      <div className="text-[13px] leading-snug text-muted">{s.hint}</div>
    </div>
  );
}

// Only facts about the product that never go stale. A live kiosk count is shown only once it is big enough to build trust (a handful of
// kiosks reads as "tiny"), and nothing here is invented.
const SHOW_KIOSKS_FROM = 25;

export function StatsStrip({ kiosks }: { featureCount?: number; kiosks: number | null }) {
  const { ref, seen } = useInView<HTMLDivElement>(0.3);
  const stats: Stat[] = [
    kiosks && kiosks >= SHOW_KIOSKS_FROM
      ? { value: kiosks, label: "Kiosk aktif", hint: "melapor dalam 30 hari terakhir" }
      : { value: 3, label: "Hasil dalam satu sesi", hint: "Foto, GIF, dan video pendek" },
    { text: "QRIS", label: "Bayar otomatis di layar", hint: "tanpa kasir, tanpa cek mutasi" },
    { text: "1 layar", label: "Untuk semua booth", hint: "harga, penjualan, dan status tiap lokasi" },
    { value: 7, suffix: " hari", label: "Trial gratis", hint: "tanpa kartu kredit" },
  ];
  return (
    <section ref={ref} aria-label="Ringkasan STUDIODO" className="relative z-10 mx-auto w-full max-w-[1312px] px-4 py-6 md:px-16">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {stats.map((s, i) => <Item key={s.label} s={s} active={seen} i={i} />)}
      </div>
    </section>
  );
}
