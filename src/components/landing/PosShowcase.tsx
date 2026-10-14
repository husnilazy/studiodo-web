"use client";

import { Icon } from "../Icon";
import { SectionHeading } from "../SectionHeading";
import { useInView } from "./hooks";

// Three looping mini-demos of the Kasir (POS): the cashier screen taking a sale, the queue board calling a ticket,
// and the shift close with a refund PIN. Loops run only while on screen (paused via animation-play-state).

const CARDS = [
  { tag: "Kasir", title: "Satu layar, semua transaksi", body: "Paket foto, cetak tambahan, produk, dan item bebas dalam satu keranjang. Tunai, QRIS, atau transfer, kembalian dihitung otomatis." },
  { tag: "Antrian", title: "Nomor antrian digital", body: "Pelanggan dapat nomor, Anda tinggal tekan “Panggil berikutnya”. Yang masih di booth lain tidak ikut terpanggil." },
  { tag: "Shift & refund", title: "Kas pas, refund aman", body: "Buka shift dengan modal awal, tutup dengan hitung laci. Refund per item butuh PIN supervisor." },
];

function Cashier({ play }: { play: boolean }) {
  const lines = [["Paket GIF + Cetak", "Rp 60.000"], ["Cetak tambahan ×2", "Rp 20.000"], ["Es teh", "Rp 8.000"]];
  return (
    <div className="pos-loop relative flex h-full flex-col gap-2.5 rounded-2xl bg-panel/80 p-4 ring-1 ring-black/5 dark:ring-white/10" style={{ ["--play" as string]: play ? "running" : "paused" }}>
      <div className="flex items-center justify-between text-[11px] font-semibold text-muted"><span>Keranjang</span><span className="rounded-full bg-[#22c58b]/15 px-2 py-0.5 text-[#12a06f]">Shift: Dina</span></div>
      <ul className="flex flex-col gap-2">
        {lines.map(([n, p], i) => (
          <li key={n} className={`pos-line pos-line-${i} flex items-center justify-between rounded-xl bg-accent/[0.07] px-3 py-2 text-[12.5px]`}><span className="font-semibold">{n}</span><span className="tabular-nums text-muted">{p}</span></li>
        ))}
      </ul>
      <div className="mt-auto">
        <div className="flex items-baseline justify-between"><span className="text-[12px] text-muted">Total</span>
          <span className="relative h-7 w-[110px] text-right font-display text-xl font-semibold tabular-nums">
            <span className="pos-total pos-total-0 absolute right-0">Rp 60.000</span>
            <span className="pos-total pos-total-1 absolute right-0">Rp 80.000</span>
            <span className="pos-total pos-total-2 absolute right-0">Rp 88.000</span>
          </span>
        </div>
        <div className="relative mt-2.5 h-10">
          <div className="pos-pay absolute inset-0 flex items-center justify-center rounded-full bg-foreground text-[13px] font-semibold text-on-foreground">Bayar tunai</div>
          <div className="pos-done absolute inset-0 flex items-center justify-center gap-2 rounded-full bg-[#22c58b] text-[12.5px] font-semibold text-white"><Icon name="check" className="h-4 w-4" />Kode kiosk CASH-7K3Q9X2A</div>
        </div>
      </div>
    </div>
  );
}

function Queue({ play }: { play: boolean }) {
  const cols = ["Menunggu", "Dipanggil", "Selesai"];
  const t = "flex h-9 items-center justify-center rounded-lg bg-accent/[0.08] text-[12px] font-bold";
  return (
    <div className="relative grid h-full grid-cols-3 gap-2 rounded-2xl bg-panel/80 p-3 ring-1 ring-black/5 dark:ring-white/10" style={{ ["--play" as string]: play ? "running" : "paused" }}>
      {cols.map((c, i) => (
        <div key={c} className="flex flex-col gap-2 rounded-xl bg-black/[0.03] p-2 dark:bg-white/[0.04]">
          <div className="text-center text-[10.5px] font-semibold uppercase tracking-wider text-muted">{c}</div>
          {i === 0 && <><div className={t}>B-005</div><div className={t}>B-006</div></>}
          {i === 2 && <div className={`${t} opacity-50`}>B-002</div>}
        </div>
      ))}
      <div className="queue-ticket pointer-events-none absolute left-[3.5%] top-[54px] flex h-9 w-[29%] items-center justify-center rounded-lg bg-accent text-[12px] font-bold text-white shadow-lg" style={{ animationPlayState: "var(--play)" }}>B-004</div>
      <div className="queue-badge absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-full bg-accent/10 py-1.5 text-[11.5px] font-semibold text-accent" style={{ animationPlayState: "var(--play)" }}>
        <Icon name="bell" className="h-3.5 w-3.5" />B-004 → Booth 2
      </div>
    </div>
  );
}

function Shift({ play }: { play: boolean }) {
  return (
    <div className="shift-loop flex h-full flex-col gap-2.5 rounded-2xl bg-panel/80 p-4 ring-1 ring-black/5 dark:ring-white/10" style={{ ["--play" as string]: play ? "running" : "paused" }}>
      <dl className="flex flex-col gap-1.5 text-[12.5px]">
        <div className="flex justify-between"><dt className="text-muted">Modal awal</dt><dd className="tabular-nums">Rp 100.000</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Penjualan tunai</dt><dd className="tabular-nums">Rp 485.000</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Refund</dt><dd className="tabular-nums text-[#e0455a]">−Rp 35.000</dd></div>
        <div className="flex justify-between border-t border-black/5 pt-1.5 font-semibold dark:border-white/10"><dt>Seharusnya di laci</dt><dd className="tabular-nums">Rp 550.000</dd></div>
      </dl>
      <div className="shift-ok flex items-center justify-center gap-1.5 rounded-full bg-[#22c58b]/15 py-1.5 text-[12px] font-semibold text-[#12a06f]" style={{ animationPlayState: "var(--play)" }}><Icon name="check" className="h-3.5 w-3.5" />Kas pas, tanpa selisih</div>
      <div className="mt-auto rounded-xl bg-accent/[0.07] p-3">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-muted"><span>PIN supervisor</span><span className="shift-approved text-[#12a06f]" style={{ animationPlayState: "var(--play)" }}>Refund disetujui</span></div>
        <div className="flex justify-center gap-2.5">{[0, 1, 2, 3].map((i) => <span key={i} className={`pin-dot pin-dot-${i} h-3 w-3 rounded-full bg-accent`} style={{ animationPlayState: "var(--play)" }} />)}</div>
      </div>
    </div>
  );
}

export function PosShowcase() {
  const { ref, visible } = useInView<HTMLDivElement>(0.2);
  const nodes = [<Cashier key="c" play={visible} />, <Queue key="q" play={visible} />, <Shift key="s" play={visible} />];
  return (
    <section id="kasir" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-12 px-4 py-20 md:px-16">
      <SectionHeading eyebrow="Kasir & antrian" title="Kasir, antrian, dan kas. Beres tanpa buku catatan." />
      <div ref={ref} className="grid gap-6 lg:grid-cols-3">
        {CARDS.map((c, i) => (
          <article key={c.tag} data-reveal="up" data-delay={String(i * 120)} className="glass lift flex flex-col gap-6 p-7 sm:p-8">
            <div className="h-[300px]">{nodes[i]}</div>
            <div>
              <span className="eyebrow mb-2 inline-block">{c.tag}</span>
              <h3 className="mb-2 font-display text-2xl tracking-tight">{c.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{c.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
