import Link from "next/link";
import { Icon } from "@/components/Icon";
import { CountUp } from "@/components/dash/CountUp";
import { PageHeader } from "@/components/dash/PageHeader";
import { getSummary } from "@/lib/portal";
import { daysUntil, formatDate, formatDateTime, formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

type Day = { date: string; sessions: number; revenue: number };
const fmtDay = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

/** Percent change of the last half of the series against the half before it; null when there is nothing to compare. */
function trend(data: Day[] | undefined, key: "revenue" | "sessions") {
  if (!data || data.length < 4) return null;
  const mid = Math.floor(data.length / 2);
  const prev = data.slice(0, mid).reduce((a, d) => a + d[key], 0);
  const cur = data.slice(mid).reduce((a, d) => a + d[key], 0);
  if (prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

function Trend({ value, onDark = false }: { value: number | null; onDark?: boolean }) {
  if (value === null) return <span className={`text-[12px] ${onDark ? "text-white/55" : "text-muted"}`}>30 hari terakhir</span>;
  const up = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[12px] font-semibold ${up ? (onDark ? "text-[#7be3b0]" : "text-[#0f8a58]") : onDark ? "text-[#ff9a9a]" : "text-[#c23a3a]"}`}>
      <Icon name="trending" className={`h-3.5 w-3.5 ${up ? "" : "-scale-y-100"}`} />
      {up ? "+" : ""}{value}% <span className={`font-normal ${onDark ? "text-white/55" : "text-muted"}`}>vs 15 hari sebelumnya</span>
    </span>
  );
}

function RevenueChart({ data }: { data: Day[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const best = data.reduce((a, b) => (b.revenue > a.revenue ? b : a), data[0]);
  const ticks = [max, max / 2, 0];
  return (
    <section className="glass flex flex-col p-6 md:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-lg tracking-tight">Pendapatan harian</h2>
          <p className="text-[13px] text-muted">{best.revenue > 0 ? `Tertinggi ${formatRupiah(best.revenue)} pada ${fmtDay(best.date)}` : "Belum ada transaksi dalam 30 hari terakhir"}</p>
        </div>
        <span className="rounded-full bg-[var(--soft)] px-3 py-1.5 text-[12px] font-semibold text-muted">30 hari</span>
      </div>
      <div className="flex min-h-[210px] flex-1 gap-3">
        <div className="flex flex-col justify-between pb-6 text-right text-[11px] tabular-nums text-muted" aria-hidden="true">
          {ticks.map((t, i) => <span key={i}>{t >= 1_000_000 ? `${(t / 1_000_000).toFixed(1).replace(".0", "")} jt` : t >= 1000 ? `${Math.round(t / 1000)} rb` : Math.round(t)}</span>)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative flex flex-1 items-end gap-[5px] border-b border-[var(--card-edge)]" role="img" aria-label="Grafik pendapatan 30 hari terakhir">
            <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-[var(--card-edge)]" />
            <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-[var(--card-edge)]" />
            {data.map((d, i) => {
              const h = Math.max(d.revenue > 0 ? 4 : 1.5, (d.revenue / max) * 100);
              const isBest = d.date === best.date && d.revenue > 0;
              return (
                <div key={d.date} className="group relative flex h-full flex-1 items-end">
                  <div className={`dash-bar w-full rounded-t-[7px] ${isBest ? "bg-[var(--ink)]" : d.revenue > 0 ? "bg-gradient-to-t from-accent to-accent-soft group-hover:brightness-110" : "bg-[var(--soft)]"}`} style={{ height: `${h}%`, ["--i" as string]: i }} />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-[var(--ink)] px-3 py-2 text-[12px] leading-snug text-white shadow-xl group-hover:block">
                    <div className="font-semibold">{formatRupiah(d.revenue)}</div>
                    <div className="text-white/65">{fmtDay(d.date)} · {d.sessions} sesi</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[11.5px] text-muted"><span>{fmtDay(data[0].date)}</span><span>{fmtDay(data[Math.floor(data.length / 2)].date)}</span><span>{fmtDay(data[data.length - 1].date)}</span></div>
        </div>
      </div>
    </section>
  );
}

function Ring({ value, total }: { value: number; total: number }) {
  const r = 46;
  const len = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <div className="relative grid h-[124px] w-[124px] shrink-0 place-items-center">
      <svg viewBox="0 0 110 110" className="-rotate-90" width="124" height="124" aria-hidden="true">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--soft)" strokeWidth="11" />
        <circle cx="55" cy="55" r={r} fill="none" stroke="url(#ringg)" strokeWidth="11" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - pct)} className="dash-ring" style={{ ["--ring-len" as string]: len }} />
        <defs><linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--accent)" /><stop offset="1" stopColor="var(--accent-soft)" /></linearGradient></defs>
      </svg>
      <div className="absolute text-center"><div className="font-display text-2xl leading-none tracking-tight">{value}<span className="text-base text-muted">/{total}</span></div><div className="mt-1 text-[10.5px] uppercase tracking-wider text-muted">booth aktif</div></div>
    </div>
  );
}

const QUICK = [
  { href: "/portal/booth", icon: "monitor", label: "Tambah booth", tint: "bg-[#e3e6ff] text-[#3a3ad0]" },
  { href: "/portal/voucher", icon: "ticket", label: "Buat voucher", tint: "bg-[#ffe1ee] text-[#c0306a]" },
  { href: "/portal/paket", icon: "box", label: "Atur paket", tint: "bg-[#d9f5ec] text-[#0f7a58]" },
  { href: "/portal/unduh", icon: "download", label: "Unduh aplikasi", tint: "bg-[#ffecc9] text-[#9a6200]" },
];

export default async function PortalHome() {
  const s = await getSummary();
  const lic = s.licenses;
  const totalKeys = s.kiosks.length;
  const onlineKiosks = s.kiosks.filter((k) => k.online).length;
  // Online first, then most recently active — old test keys sink to the bottom instead of burying live kiosks.
  const sortedKiosks = [...s.kiosks].sort(
    (a, b) => Number(b.online) - Number(a.online) || new Date(b.lastUsedAt ?? 0).getTime() - new Date(a.lastUsedAt ?? 0).getTime(),
  );
  const KIOSK_PREVIEW = 6;
  const shownKiosks = sortedKiosks.slice(0, KIOSK_PREVIEW);
  const hiddenKiosks = totalKeys - shownKiosks.length;
  const activeBooths = lic ? lic.activeKeys - lic.locked - lic.unpaid : totalKeys;

  // Per-booth licences: the headline is how many booths run, not one account-wide date.
  let statusTone = "bg-[#dff7ec] text-[#0f6b45]";
  let statusText = "Semua booth aktif";
  if (lic && lic.activeKeys === 0) { statusTone = "bg-[var(--soft)] text-muted"; statusText = "Belum ada booth"; }
  else if (lic && lic.locked > 0) { statusTone = "bg-[#ffe3e3] text-[#a12626]"; statusText = `${lic.locked} dari ${lic.activeKeys} booth terkunci`; }
  else if (lic && lic.unpaid > 0) { statusTone = "bg-[#fff3d6] text-[#7a5a00]"; statusText = `${lic.unpaid} booth belum berlangganan`; }
  else if (lic && lic.expiringSoon > 0) { statusTone = "bg-[#fff3d6] text-[#7a5a00]"; statusText = `${lic.expiringSoon} booth berakhir dalam 7 hari`; }
  else if (lic && lic.trial > 0) { statusTone = "bg-[#fff3d6] text-[#7a5a00]"; statusText = `${lic.trial} booth masih trial`; }
  const nearestEnd = lic?.nearestEndsAt ?? s.tenant.subscriptionEndsAt;
  const nearestDays = daysUntil(nearestEnd);
  const revTrend = trend(s.daily, "revenue");
  const sesTrend = trend(s.daily, "sessions");

  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader
        eyebrow={`Paket ${s.tenant.planName}`}
        title={s.tenant.name}
        intro={s.email ? `Masuk sebagai ${s.email}` : undefined}
        actions={<Link href="/portal/booth" className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 text-[14px]"><Icon name="monitor" className="h-4 w-4" />Kelola booth &amp; langganan</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-5">
        <div className="glass-dark dash-card-hover relative overflow-hidden rounded-[26px] p-6">
          <span className="dash-orb" style={{ right: -40, bottom: -50, width: 170, height: 170, background: "radial-gradient(circle, rgba(154,166,255,.45), transparent 68%)" }} aria-hidden="true" />
          <div className="relative">
            <div className="text-[13px] text-white/65">Pendapatan (30 hari)</div>
            <div className="mt-2 font-display text-[30px] leading-tight tracking-tight xl:text-[28px] 2xl:text-[32px]"><CountUp value={s.last30Days.revenue} format="rupiah" /></div>
            <div className="mt-2"><Trend value={revTrend} onDark /></div>
          </div>
        </div>
        <div className="glass dash-card-hover p-6">
          <div className="text-[13px] text-muted">Sesi foto (30 hari)</div>
          <div className="mt-2 font-display text-[30px] leading-tight tracking-tight 2xl:text-[32px]"><CountUp value={s.last30Days.sessions} /></div>
          <div className="mt-2"><Trend value={sesTrend} /></div>
        </div>
        <div className="glass dash-card-hover p-6">
          <div className="text-[13px] text-muted">Booth online sekarang</div>
          <div className="mt-2 font-display text-[30px] leading-tight tracking-tight 2xl:text-[32px]"><CountUp value={onlineKiosks} /><span className="text-xl text-muted"> / {totalKeys}</span></div>
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted"><span className={`h-2 w-2 rounded-full ${onlineKiosks > 0 ? "bg-[#1fb26b]" : "bg-muted/40"}`} />{onlineKiosks > 0 ? "Terhubung ke server" : "Tidak ada yang online"}</div>
        </div>
        <div className="glass dash-card-hover p-6">
          <div className="text-[13px] text-muted">Masa aktif terdekat</div>
          <div className="mt-2 font-display text-[30px] leading-tight tracking-tight 2xl:text-[32px]">{nearestDays !== null ? (nearestDays >= 0 ? <><CountUp value={nearestDays} /><span className="text-xl text-muted"> hari</span></> : "Berakhir") : "—"}</div>
          <div className="mt-2 text-[12px] text-muted">{nearestEnd ? `s/d ${formatDate(nearestEnd)}` : "Tanpa batas waktu"}</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-5">
        {s.daily && s.daily.length > 0 ? <RevenueChart data={s.daily} /> : <section className="glass p-7 text-[14px] text-muted">Grafik pendapatan muncul setelah ada transaksi.</section>}
        <div className="flex flex-col gap-4 lg:gap-5">
          <section className="glass p-6">
            <div className="flex items-center gap-5">
              <Ring value={Math.max(0, activeBooths)} total={lic?.activeKeys ?? totalKeys} />
              <div className="min-w-0">
                <h2 className="font-display text-lg tracking-tight">Langganan</h2>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">{lic ? `${lic.paid} berlangganan${lic.trial > 0 ? ` · ${lic.trial} trial` : ""}${lic.unpaid > 0 ? ` · ${lic.unpaid} belum bayar` : ""}` : s.tenant.planName}</p>
                <span className={`mt-2.5 inline-block rounded-full px-3 py-1 text-[11.5px] font-semibold ${statusTone}`}>{statusText}</span>
              </div>
            </div>
          </section>
          <section className="glass flex-1 p-5">
            <h2 className="mb-3 px-1 font-display text-lg tracking-tight">Aksi cepat</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK.map((q) => (
                <Link key={q.href} href={q.href} prefetch className="group flex items-center gap-2.5 rounded-2xl bg-[var(--soft)] p-3 text-[13px] font-semibold transition hover:bg-[color-mix(in_srgb,var(--foreground)_9%,transparent)]">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-110 group-hover:-rotate-6 ${q.tint}`}><Icon name={q.icon} className="h-[17px] w-[17px]" /></span>
                  <span className="leading-tight">{q.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-5">
        <section className="glass p-6 md:p-7">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-display text-lg tracking-tight">Booth Anda</h2><Link href="/portal/booth" className="text-[13px] font-semibold text-accent hover:underline">Kelola semua</Link></div>
          {s.kiosks.length === 0 ? (
            <p className="py-6 text-[14px] text-muted">Belum ada booth. Buka &ldquo;Booth &amp; langganan&rdquo; untuk menambah booth, lalu pasangkan key-nya di aplikasi STUDIODO pada PC booth.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[14px]">
                <thead className="border-b border-[var(--card-edge)] text-[11.5px] uppercase tracking-wider text-muted">
                  <tr><th className="py-2.5 pr-4 font-semibold">Booth</th><th className="pr-4 font-semibold">Terakhir aktif</th><th className="pr-4 font-semibold">Lisensi</th><th className="text-right font-semibold">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-edge)]">
                  {shownKiosks.map((k) => (
                    <tr key={k.id} className="transition-colors hover:bg-[var(--soft)]">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><Icon name="monitor" className="h-[17px] w-[17px]" /></span>
                          <div className="min-w-0"><div className="truncate font-semibold">{k.label ?? "Booth tanpa nama"}</div><div className="text-[12px] text-muted">{k.paired ? "Terpasang" : "Belum dipasangkan"} · v{k.appVersion ?? "—"}</div></div>
                        </div>
                      </td>
                      <td className="pr-4 text-muted">{formatDateTime(k.lastUsedAt)}</td>
                      <td className="pr-4">
                        <span className={`whitespace-nowrap rounded-full px-3 py-1 text-[11.5px] font-semibold ${k.locked ? "bg-[#ffe3e3] text-[#a12626]" : k.licenseType === "trial" ? "bg-[#fff3d6] text-[#7a5a00]" : "bg-[#dff7ec] text-[#0f6b45]"}`}>
                          {k.licenseType === "unpaid" ? "Belum berlangganan" : k.locked ? (k.licenseType === "trial" ? "Trial habis" : "Terkunci") : k.licenseType === "trial" ? `Trial · ${Math.max(0, k.daysRemaining ?? 0)} hari` : k.licenseEndsAt ? `s/d ${formatDate(k.licenseEndsAt)}` : "Aktif"}
                        </span>
                      </td>
                      <td className="text-right"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-semibold ${k.online ? "bg-[#dff7ec] text-[#0f6b45]" : "bg-[var(--soft)] text-muted"}`}><span className={`h-1.5 w-1.5 rounded-full ${k.online ? "bg-[#1fb26b]" : "bg-muted/50"}`} />{k.online ? "Online" : "Offline"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {hiddenKiosks > 0 && <p className="mt-3 text-[13px] text-muted">+{hiddenKiosks} booth lainnya. <Link href="/portal/booth" className="font-semibold text-accent hover:underline">Lihat semua</Link></p>}
        </section>

        <section className="glass p-6 md:p-7">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-display text-lg tracking-tight">Pembayaran terakhir</h2><Link href="/portal/tagihan" className="text-[13px] font-semibold text-accent hover:underline">Tagihan</Link></div>
          {s.recentPayments.length === 0 ? (
            <p className="py-6 text-[14px] text-muted">Belum ada pembayaran langganan.</p>
          ) : (
            <ul className="divide-y divide-[var(--card-edge)]">
              {s.recentPayments.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#d9f5ec] text-[#0f7a58]"><Icon name="check" className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-semibold">{p.planName ?? "Langganan"} · {p.periodDays} hari</div><div className="text-[12px] text-muted">{formatDate(p.createdAt)}</div></div>
                  <div className="text-[14px] font-semibold tabular-nums">{formatRupiah(p.amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
