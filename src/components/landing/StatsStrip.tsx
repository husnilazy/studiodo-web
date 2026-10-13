"use client";

import { useCount, useInView } from "./hooks";

type Stat = { value: number; suffix?: string; label: string; hint: string };

function Item({ s, active, i }: { s: Stat; active: boolean; i: number }) {
  const n = useCount(s.value, active);
  return (
    <div data-reveal="up" data-delay={String(i * 100)} className="glass lift flex flex-col gap-1 px-6 py-6 text-center md:py-7">
      <div className="font-display text-[40px] font-semibold leading-none tracking-tight text-accent md:text-5xl">
        <span className="tabular-nums">{Math.round(n).toLocaleString("id-ID")}</span>
        {s.suffix}
      </div>
      <div className="mt-2 text-[15px] font-semibold">{s.label}</div>
      <div className="text-[13px] leading-snug text-muted">{s.hint}</div>
    </div>
  );
}

export function StatsStrip({ featureCount, kiosks }: { featureCount: number; kiosks: number | null }) {
  const { ref, seen } = useInView<HTMLDivElement>(0.3);
  const stats: Stat[] = [
    kiosks && kiosks > 0
      ? { value: kiosks, label: "Kiosk aktif", hint: "melapor dalam 30 hari terakhir" }
      : { value: 3, label: "Format hasil", hint: "Foto, GIF, dan video" },
    { value: featureCount, suffix: "+", label: "Fitur siap pakai", hint: "tanpa add-on tersembunyi" },
    { value: 15, suffix: " mnt", label: "Dari daftar sampai jalan", hint: "install, pasangkan, mulai jualan" },
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
