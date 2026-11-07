"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { checkPayAction, chooseMethodAction, otherMethodAction, type PayStatus } from "@/app/bayar/[orderId]/actions";

type Method = { id: string; label: string; hint: string; kind: "qris" | "va" | "bill" | "store" };
type Instruction = { method: string; expiresAt: string | null; qr?: string | null; bank?: string; vaNumber?: string; billerCode?: string; billKey?: string; paymentCode?: string; store?: string };
export type PayData = { orderId: string; plan: string; boothCount: number; periodDays: number; amount: number; status: PayStatus; dueAt: string; methods: Method[]; instruction: Instruction | null };

const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
const pad = (n: number) => String(n).padStart(2, "0");
const TABS: { id: string; title: string; kinds: Method["kind"][] }[] = [
  { id: "qris", title: "QRIS", kinds: ["qris"] },
  { id: "bank", title: "Bank", kinds: ["va", "bill"] },
  { id: "store", title: "Toko", kinds: ["store"] },
];
const short = (m: Method) => m.label.replace(" Virtual Account", "").replace(" Niaga", "");
const tabHint = (m: Method) => (m.kind === "va" ? "Virtual Account" : m.kind === "bill" ? "Kode bayar" : "Bayar tunai");

function CopyField({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-foreground/[0.05] px-4 py-3">
      <div className="min-w-0">
        <div className="text-[12px] text-muted">{label}</div>
        <div className="truncate font-display text-[20px] font-semibold tabular-nums tracking-wide">{value}</div>
      </div>
      <button type="button" onClick={() => { void navigator.clipboard?.writeText(value).then(() => { setDone(true); setTimeout(() => setDone(false), 1800); }); }} className="shrink-0 rounded-full border border-foreground/15 px-3.5 py-1.5 text-[12.5px] font-semibold hover:bg-foreground/[0.06]">
        {done ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}

/** STUDIODO's own payment card: pick any method, see what to do (QR / VA number / store code) with a countdown and live status. */
export function PayQris({ data: initial, token }: { data: PayData; token: string }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState<PayStatus>(initial.status);
  const [choosing, setChoosing] = useState(!initial.instruction);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [pick, setTab] = useState("");
  const [, start] = useTransition();
  const [left, setLeft] = useState(() => Math.max(0, new Date(initial.dueAt).getTime() - Date.now()));
  const ins = data.instruction;
  // Tabs follow what is actually available (a method Midtrans refuses as "not activated" drops out).
  const tabs = [...TABS.filter((t) => data.methods.some((m) => t.kinds.includes(m.kind))), { id: "card", title: "Kartu", kinds: [] as Method["kind"][] }];
  const tab = tabs.some((t) => t.id === pick) ? pick : tabs[0].id;
  const shown = data.methods.filter((m) => (TABS.find((t) => t.id === tab)?.kinds ?? []).includes(m.kind));
  const waiting = status === "pending" && !!ins && !choosing;

  useEffect(() => {
    if (status !== "pending" || !ins) return;
    const tick = setInterval(() => setLeft(Math.max(0, new Date(data.dueAt).getTime() - Date.now())), 1000);
    let stop = false;
    const poll = async () => {
      const s = await checkPayAction(data.orderId, token);
      if (!stop && s !== "pending") setStatus(s);
    };
    void poll();
    const t = setInterval(poll, 4000);
    return () => { stop = true; clearInterval(tick); clearInterval(t); };
  }, [status, ins, data.orderId, data.dueAt, token]);

  useEffect(() => {
    if (status !== "paid") return;
    const t = setTimeout(() => router.push(`/portal/tagihan?status=selesai&order_id=${encodeURIComponent(data.orderId)}`), 3500);
    return () => clearTimeout(t);
  }, [status, data.orderId, router]);

  const choose = (id: string) => {
    setError(null);
    setBusy(id);
    start(async () => {
      const r = await chooseMethodAction(data.orderId, token, id);
      setBusy(null);
      if (!r.ok) {
        setError(r.error);
        if (r.error.includes("belum tersedia")) setData((d) => ({ ...d, methods: d.methods.filter((m) => m.id !== id) }));
        return;
      }
      setData(r.data);
      setStatus(r.data.status);
      setChoosing(false);
    });
  };
  const other = () => {
    setError(null);
    setBusy("other");
    start(async () => {
      const r = await otherMethodAction(data.orderId, token);
      if (!r.ok) { setBusy(null); setError(r.error); return; }
      window.location.assign(r.url);
    });
  };

  const expired = status === "expired" || (status === "pending" && left <= 0 && !!ins);
  const h = Math.floor(left / 3_600_000), m = Math.floor((left % 3_600_000) / 60_000), s = Math.floor((left % 60_000) / 1000);
  const label = ins ? data.methods.find((x) => x.id === ins.method)?.label ?? "Pembayaran" : "";

  return (
    <div className="glass overflow-hidden p-0">
      <div className="px-7 pb-5 pt-7 text-center">
        <div className="text-[13px] text-muted">Bayar langganan {data.plan}</div>
        <div className="mt-1 font-display text-[40px] font-semibold leading-none tracking-tight">{rupiah(data.amount)}</div>
        <div className="mt-2 text-[13px] text-muted">{data.boothCount} booth · {data.periodDays} hari</div>
      </div>

      {status === "paid" ? (
        <div className="grid justify-items-center gap-3 border-t border-foreground/10 px-7 py-10 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[#dff7ec] text-[#0f6b45]" aria-hidden="true"><svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
          <h1 className="font-display text-[22px] tracking-tight">Pembayaran diterima</h1>
          <p className="text-[14px] text-muted">Langganan Anda sudah aktif. Mengalihkan ke dashboard…</p>
          <Link href="/portal/tagihan?status=selesai" className="btn btn-primary mt-2 px-7 py-3 text-[15px]">Ke dashboard</Link>
        </div>
      ) : status === "failed" || expired ? (
        <div className="grid justify-items-center gap-3 border-t border-foreground/10 px-7 py-10 text-center">
          <h1 className="font-display text-[22px] tracking-tight">{status === "failed" ? "Pembayaran gagal" : "Waktu pembayaran habis"}</h1>
          <p className="text-[14px] text-muted">Buat pembayaran baru dari halaman booth dan langganan.</p>
          <Link href="/portal/booth" className="btn btn-primary mt-2 px-7 py-3 text-[15px]">Buat pembayaran baru</Link>
        </div>
      ) : choosing || !ins ? (
        <div className="grid gap-4 border-t border-foreground/10 px-6 py-5">
          <h1 className="font-display text-[17px] tracking-tight">Pilih cara bayar</h1>
          <div role="tablist" className="grid grid-flow-col auto-cols-fr gap-1 rounded-2xl bg-foreground/[0.06] p-1">
            {tabs.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => { setTab(t.id); setError(null); }} className={`rounded-xl px-2 py-2 text-[13px] font-semibold transition ${tab === t.id ? "bg-panel text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}>{t.title}</button>
            ))}
          </div>
          {tab === "card" ? (
            <button type="button" disabled={busy !== null} onClick={other} className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3.5 text-left transition hover:border-accent disabled:opacity-60">
              <span className="block text-[15px] font-semibold">{busy === "other" ? "Membuka…" : "Kartu kredit/debit dan lainnya"}</span>
              <span className="block text-[12.5px] leading-snug text-muted">Dibuka di halaman pembayaran aman Midtrans.</span>
            </button>
          ) : (
            <div className={`grid gap-2 ${shown.length > 1 ? "grid-cols-2" : ""}`}>
              {shown.map((x) => (
                <button key={x.id} type="button" disabled={busy !== null} onClick={() => choose(x.id)} className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] px-4 py-3 text-left transition hover:border-accent hover:bg-foreground/[0.06] disabled:opacity-60">
                  <span className="block text-[15px] font-semibold">{busy === x.id ? "Memproses…" : short(x)}</span>
                  <span className="block text-[12px] leading-snug text-muted">{shown.length > 1 ? tabHint(x) : x.hint}</span>
                </button>
              ))}
            </div>
          )}
          {error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{error}</p>}
          {ins && <button type="button" onClick={() => setChoosing(false)} className="justify-self-center text-[13px] font-semibold text-accent underline underline-offset-4">Kembali ke {label}</button>}
        </div>
      ) : (
        <div className="grid gap-4 border-t border-foreground/10 px-7 py-6">
          <div className="text-center text-[13px] font-semibold text-muted">{label}</div>
          {ins.method === "qris" ? (
            <div className="grid justify-items-center gap-3">
              {ins.qr ? (
                <div className="rounded-3xl bg-white p-4 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element -- QR drawn by the API as an SVG data URL */}
                  <img src={ins.qr} alt="Kode QRIS untuk membayar" width={248} height={248} className="h-[248px] w-[248px]" />
                </div>
              ) : null}
              <p className="text-center text-[14px] leading-relaxed text-muted">Buka aplikasi e-wallet atau m-banking apa pun, pilih <strong className="text-foreground">Scan QRIS</strong>, lalu pindai kode di atas.</p>
              {ins.qr && <a href={ins.qr} download={`QRIS-${data.orderId}.svg`} className="text-[13px] font-semibold text-accent underline underline-offset-4">Unduh kode QR</a>}
            </div>
          ) : ins.method === "mandiri" ? (
            <div className="grid gap-2.5">
              <CopyField label="Kode perusahaan (biller)" value={ins.billerCode ?? ""} />
              <CopyField label="Kode pembayaran" value={ins.billKey ?? ""} />
              <p className="text-[13.5px] leading-relaxed text-muted">Di ATM Mandiri atau Livin&apos; by Mandiri: Bayar → Multipayment, lalu masukkan kedua kode di atas.</p>
            </div>
          ) : ins.vaNumber ? (
            <div className="grid gap-2.5">
              <CopyField label={`Nomor Virtual Account ${(ins.bank ?? "").toUpperCase()}`} value={ins.vaNumber} />
              <p className="text-[13.5px] leading-relaxed text-muted">Transfer tepat <strong className="text-foreground">{rupiah(data.amount)}</strong> ke nomor di atas lewat ATM, mobile banking, atau internet banking. Nama tujuan akan tampil sesuai akun pembayaran.</p>
            </div>
          ) : ins.paymentCode ? (
            <div className="grid gap-2.5">
              <CopyField label={`Kode pembayaran ${ins.store === "indomaret" ? "Indomaret" : "Alfamart"}`} value={ins.paymentCode} />
              <p className="text-[13.5px] leading-relaxed text-muted">Sebutkan kode ini di kasir dan bayar tunai {rupiah(data.amount)}. Biaya layanan toko bisa berlaku.</p>
            </div>
          ) : null}
          <div className="mx-auto flex items-center gap-2 rounded-full bg-foreground/[0.06] px-4 py-2 text-[13px]" role="status">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#f5a623]" aria-hidden="true" />
            Menunggu pembayaran · sisa <span className="font-semibold tabular-nums">{pad(h)}:{pad(m)}:{pad(s)}</span>
          </div>
          {waiting && <button type="button" onClick={() => { setError(null); setChoosing(true); }} className="justify-self-center text-[13px] font-semibold text-accent underline underline-offset-4">Ganti cara bayar</button>}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-foreground/10 px-7 py-4 text-[12px] text-muted">
        <span>Invoice {data.orderId}</span>
        <Link href={`/invoice/${encodeURIComponent(data.orderId)}?t=${encodeURIComponent(token)}`} className="font-semibold text-accent underline underline-offset-4">Lihat invoice</Link>
      </div>
    </div>
  );
}
