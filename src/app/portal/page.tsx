import Link from "next/link";
import { getSummary } from "@/lib/portal";
import { daysUntil, formatDate, formatDateTime, formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

function RevenueChart({ data }: { data: { date: string; sessions: number; revenue: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const best = data.reduce((a, b) => (b.revenue > a.revenue ? b : a), data[0]);
  const fmtDay = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  return (
    <section className="glass p-8">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl tracking-tight">Pendapatan harian</h2>
        <span className="text-[13px] text-muted">{best.revenue > 0 ? `Tertinggi ${formatRupiah(best.revenue)} · ${fmtDay(best.date)}` : "Belum ada transaksi dalam 30 hari terakhir"}</span>
      </div>
      <div className="flex h-36 items-end gap-[3px]" role="img" aria-label="Grafik pendapatan 30 hari terakhir">
        {data.map((d) => (
          <div key={d.date} title={`${fmtDay(d.date)} — ${formatRupiah(d.revenue)} · ${d.sessions} sesi`} className="flex h-full flex-1 items-end">
            <div className="w-full rounded-t-[3px] bg-accent/80" style={{ height: `${Math.max(d.revenue > 0 ? 4 : 1, (d.revenue / max) * 100)}%`, opacity: d.revenue > 0 ? 1 : 0.25 }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-muted"><span>{fmtDay(data[0].date)}</span><span>{fmtDay(data[data.length - 1].date)}</span></div>
    </section>
  );
}

export default async function PortalHome() {
  const s = await getSummary();
  const days = daysUntil(s.tenant.subscriptionEndsAt);
  const totalKeys = s.kiosks.length;
  const onlineKiosks = s.kiosks.filter((k) => k.online).length;
  // Online first, then most recently active — old test keys sink to the bottom instead of burying live kiosks.
  const sortedKiosks = [...s.kiosks].sort(
    (a, b) => Number(b.online) - Number(a.online) || new Date(b.lastUsedAt ?? 0).getTime() - new Date(a.lastUsedAt ?? 0).getTime(),
  );
  const KIOSK_PREVIEW = 8;
  const shownKiosks = sortedKiosks.slice(0, KIOSK_PREVIEW);
  const hiddenKiosks = totalKeys - shownKiosks.length;

  let statusTone = "bg-[#dff7ec] text-[#0f6b45]";
  let statusText = "Aktif";
  if (s.tenant.locked) { statusTone = "bg-[#ffe3e3] text-[#a12626]"; statusText = "Terkunci — perpanjang untuk mengaktifkan kembali kiosk"; }
  else if (days !== null && days < 0) { statusTone = "bg-[#fff3d6] text-[#7a5a00]"; statusText = `Masa aktif habis, masa tenggang ${s.tenant.graceDaysRemaining ?? 0} hari lagi`; }
  else if (days !== null && days <= 7) { statusTone = "bg-[#fff3d6] text-[#7a5a00]"; statusText = `Berakhir ${days} hari lagi`; }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Dashboard</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">{s.tenant.name}</h1>
        {s.email && <p className="mt-1 text-sm text-muted">Masuk sebagai {s.email}</p>}
      </div>

      <section className="glass flex flex-col items-start justify-between gap-5 p-8 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted">Paket saat ini</div>
          <div className="font-display text-3xl tracking-tight">{s.tenant.planName}</div>
          <div className="text-[15px] text-muted">
            {s.tenant.subscriptionEndsAt ? `Berlaku sampai ${formatDate(s.tenant.subscriptionEndsAt)}` : "Tanpa batas waktu"}
          </div>
          <span className={`mt-1 inline-block self-start rounded-full px-3.5 py-1.5 text-xs font-semibold ${statusTone}`}>{statusText}</span>
        </div>
        <Link href="/portal/tagihan" className="btn btn-primary px-7 py-3.5">Perpanjang / ganti paket</Link>
      </section>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="glass p-7"><div className="text-sm text-muted">Sesi foto (30 hari)</div><div className="mt-2 font-display text-4xl tracking-tight">{s.last30Days.sessions}</div></div>
        <div className="glass p-7"><div className="text-sm text-muted">Pendapatan (30 hari)</div><div className="mt-2 font-display text-4xl tracking-tight">{formatRupiah(s.last30Days.revenue)}</div></div>
        <div className="glass p-7">
          <div className="text-sm text-muted">Kunci kiosk</div>
          <div className="mt-2 font-display text-4xl tracking-tight">{totalKeys}{s.tenant.kioskLimit !== null && <span className="text-xl text-muted"> / {s.tenant.kioskLimit}</span>}</div>
          <div className="mt-1 text-[13px] text-muted">{onlineKiosks} online sekarang</div>
        </div>
      </div>

      {s.daily && s.daily.length > 0 && <RevenueChart data={s.daily} />}

      <section className="glass p-8">
        <h2 className="mb-4 font-display text-xl tracking-tight">Kiosk</h2>
        {s.kiosks.length === 0 ? (
          <p className="text-[15px] text-muted">Belum ada kiosk. Buat kunci kiosk dari menu Admin di aplikasi STUDIODO, lalu pasangkan di PC booth.</p>
        ) : (
          <ul className="divide-y divide-foreground/[0.08]">
            {shownKiosks.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div>
                  <div className="font-semibold">{k.label ?? "Kiosk tanpa nama"}</div>
                  <div className="text-[13px] text-muted">
                    {k.paired ? "Terpasang" : "Belum dipasangkan"} · versi {k.appVersion ?? "—"} · terakhir aktif {formatDateTime(k.lastUsedAt)}
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${k.online ? "bg-[#dff7ec] text-[#0f6b45]" : "bg-foreground/[0.06] text-muted"}`}>
                  {k.online ? "Online" : "Offline"}
                </span>
              </li>
            ))}
          </ul>
        )}
        {hiddenKiosks > 0 && <p className="mt-3 text-[13px] text-muted">+{hiddenKiosks} kunci lainnya (kebanyakan tidak aktif). Kelola kunci di menu Admin aplikasi STUDIODO.</p>}
      </section>

      <section className="glass p-8">
        <h2 className="mb-4 font-display text-xl tracking-tight">Pembayaran terakhir</h2>
        {s.recentPayments.length === 0 ? (
          <p className="text-[15px] text-muted">Belum ada pembayaran langganan.</p>
        ) : (
          <ul className="divide-y divide-foreground/[0.08]">
            {s.recentPayments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3.5 text-[15px]">
                <span>{p.planName ?? "Langganan"} · {p.periodDays} hari</span>
                <span className="text-muted">{formatDate(p.createdAt)} · <span className="font-semibold text-foreground">{formatRupiah(p.amount)}</span></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
