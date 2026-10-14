"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { Spinner } from "@/components/Spinner";
import { formatRupiah } from "@/lib/format";
import { METHOD_LABEL, type PaymentMethod, type PosCatalog, type PosItem, type PosOrder, type PosTicket } from "@/lib/posTypes";
import { posAction } from "@/app/portal/kasir/actions";

const field = "h-11 w-full rounded-2xl border-0 bg-[var(--soft)] px-4 text-[14.5px] text-foreground outline-none focus:ring-2 focus:ring-accent/40";
const card = "rounded-[22px] bg-[var(--card)] ring-1 ring-[var(--card-edge)]";

type Line = PosItem & { key: string };
type Tab = "package" | "print" | "frame" | "product" | "custom";

export function OpenShiftForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cash, setCash] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const submit = () => {
    setError(null);
    start(async () => {
      const r = await posAction("POST", "/api/pos/shifts/open", { cashierName: name, openingCash: Number(cash) || 0 });
      if (!r.ok) return setError(r.error);
      router.refresh();
    });
  };
  return (
    <div className={`${card} mx-auto w-full max-w-[460px] p-7`}>
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent"><Icon name="wallet" className="h-6 w-6" /></div>
      <h2 className="mt-4 font-display text-[22px] tracking-tight">Buka shift kasir</h2>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">Catat nama kasir dan uang modal di laci. Semua transaksi sampai shift ditutup akan masuk ke laporan kas shift ini.</p>
      <div className="mt-5 flex flex-col gap-3">
        <label className="text-[13px] font-semibold">Nama kasir<input className={`${field} mt-1.5 font-normal`} value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Dina" maxLength={60} /></label>
        <label className="text-[13px] font-semibold">Modal awal di laci (Rp)<input className={`${field} mt-1.5 font-normal`} inputMode="numeric" placeholder="0" value={cash} onChange={(e) => setCash(e.target.value.replace(/\D/g, ""))} /></label>
        {error && <div role="alert" className="text-[13px] text-[#a12626]">{error}</div>}
        <button type="button" disabled={pending || !name.trim()} onClick={submit} className="btn btn-primary mt-1 px-6 py-3.5 text-[15px] disabled:opacity-50">{pending && <Spinner />}Buka shift</button>
      </div>
    </div>
  );
}

export function PosTerminal({ catalog }: { catalog: PosCatalog }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("package");
  const [lines, setLines] = useState<Line[]>([]);
  const [discount, setDiscount] = useState("");
  const [discMode, setDiscMode] = useState<"rp" | "pct">("rp");
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [received, setReceived] = useState("");
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [makeTicket, setMakeTicket] = useState(true);
  const [custom, setCustom] = useState({ name: "", price: "" });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ order: PosOrder; ticket: PosTicket | null } | null>(null);
  const [pending, start] = useTransition();

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const discRaw = discMode === "pct" ? Math.round((subtotal * Math.min(100, Number(discount) || 0)) / 100) : Number(discount) || 0;
  const disc = Math.min(subtotal, discRaw);
  const total = subtotal - disc;
  const cash = Number(received) || 0;
  const hasBooth = lines.some((l) => l.type === "package" || l.type === "print");
  const hasFrame = lines.some((l) => l.type === "frame");
  const hasPackage = lines.some((l) => l.type === "package");
  const quick = useMemo(() => [...new Set([total, ...[20000, 50000, 100000, 200000].filter((v) => v > total)].filter((v) => v > 0))].slice(0, 5), [total]);

  if (!catalog.shift) return <OpenShiftForm />;

  const add = (item: Omit<PosItem, "qty">) => {
    setError(null);
    setLines((prev) => {
      const key = `${item.type}:${item.refId ?? item.name}:${item.unitPrice}`;
      const i = prev.findIndex((l) => l.key === key);
      if (i >= 0) return prev.map((l, n) => (n === i ? { ...l, qty: Math.min(99, l.qty + 1) } : l));
      return [...prev, { ...item, qty: 1, key }];
    });
  };
  const bump = (key: string, by: number) => setLines((prev) => prev.flatMap((l) => (l.key !== key ? [l] : l.qty + by < 1 ? [] : [{ ...l, qty: Math.min(99, l.qty + by) }])));
  const reset = () => { setLines([]); setDiscount(""); setDiscMode("rp"); setReceived(""); setName(""); setWa(""); setError(null); setMethod("cash"); };

  const pay = () => {
    setError(null);
    if (!lines.length) return setError("Keranjang masih kosong.");
    if (hasFrame && !hasPackage) return setError("Frame custom harus dibeli bersama paket foto. Tambahkan paket dulu.");
    if (method === "cash" && cash < total) return setError("Uang diterima kurang dari total.");
    start(async () => {
      let ticket: PosTicket | null = null;
      if (makeTicket && hasBooth) {
        const t = await posAction<PosTicket>("POST", "/api/pos/queue", { customerName: name, customerWhatsapp: wa });
        if (t.ok) ticket = t.data;
      }
      const r = await posAction<PosOrder>("POST", "/api/pos/orders", {
        items: lines.map(({ type, refId, name: n, qty, unitPrice }) => ({ type, refId, name: n, qty, unitPrice })),
        discount: disc, paymentMethod: method, cashReceived: method === "cash" ? cash : undefined,
        customerName: name, customerWhatsapp: wa, queueTicketId: ticket?.id,
      });
      if (!r.ok) return setError(r.error);
      setDone({ order: r.data, ticket });
    });
  };

  const tabs: { id: Tab; label: string }[] = [{ id: "package", label: "Paket foto" }, { id: "print", label: "Cetak tambahan" }, { id: "frame", label: "Frame custom" }, { id: "product", label: "Produk" }, { id: "custom", label: "Item bebas" }];
  const q = search.trim().toLowerCase();
  const match = (t: string) => !q || t.toLowerCase().includes(q);
  const prints = catalog.packages.flatMap((p) => p.prints.map((x) => ({ ...x, pkg: p.name }))).filter((x) => match(x.name) || match(x.pkg));
  // Add-ons of the packages already in the cart, offered as one-tap chips so the cashier does not have to hunt for them.
  const cartPkgIds = new Set(lines.filter((l) => l.type === "package").map((l) => l.refId));
  const suggestions = catalog.packages.filter((p) => cartPkgIds.has(p.id)).flatMap((p) => p.prints.map((x) => ({ ...x, pkg: p.name })))
    .filter((x) => !lines.some((l) => l.type === "print" && l.refId === x.key));

  return (
    <div className="grid min-h-0 gap-4 lg:grid-cols-[1fr_400px]">
      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#22c58b]" />Shift berjalan · kasir <b className="text-foreground">{catalog.shift.cashierName}</b></span>
          <Link href="/portal/kasir/shift" className="font-semibold text-accent hover:underline">Tutup shift →</Link>
        </div>
        <div className="flex gap-1.5 overflow-x-auto" role="tablist">
          {tabs.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`shrink-0 rounded-full px-4 py-2 text-[13.5px] font-semibold transition ${tab === t.id ? "bg-accent text-white" : "bg-[var(--card)] text-muted ring-1 ring-[var(--card-edge)] hover:text-foreground"}`}>{t.label}</button>)}
        </div>

        {tab !== "custom" && <input className={field} type="search" placeholder="Cari item…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Cari item" />}

        {tab === "package" && (
          <Grid empty={catalog.packages.length === 0 || !catalog.packages.some((p) => match(p.name))} hint="Belum ada paket foto aktif. Buat dulu di menu Paket foto.">
            {catalog.packages.filter((p) => match(p.name)).map((p) => <Tile key={p.id} title={p.name} sub={`${p.photoCount} foto${p.prints.length ? ` · ${p.prints.length} add-on` : ""}`} price={p.price} onClick={() => add({ type: "package", refId: p.id, name: p.name, unitPrice: p.price })} />)}
          </Grid>
        )}
        {tab === "print" && (
          <Grid empty={prints.length === 0} hint={<>{q ? "Tidak ada add-on yang cocok." : <>Belum ada add-on. Tambahkan di <Link className="font-semibold text-accent" href="/portal/paket">Paket foto</Link> (bagian Add-on saat mengubah paket), mis. Cetak tambahan 4R.</>}</>}>
            {prints.map((x) => <Tile key={x.key} title={x.name} sub={`Add-on · ${x.pkg}`} price={x.price} onClick={() => add({ type: "print", refId: x.key, name: `${x.name} (${x.pkg})`, unitPrice: x.price })} />)}
          </Grid>
        )}
        {tab === "frame" && (
          <Grid empty={!(catalog.customFrames ?? []).some((f) => match(f.name) || match(f.customerName ?? ""))} hint={<>Belum ada frame custom. Unggah desain pelanggan di <Link className="font-semibold text-accent" href="/portal/frame/custom">Frame custom</Link>.</>}>
            {(catalog.customFrames ?? []).filter((f) => match(f.name) || match(f.customerName ?? "")).map((f) => <Tile key={f.id} title={f.name} sub={f.customerName ? `Untuk ${f.customerName}` : "Frame custom"} price={f.price} onClick={() => { if (lines.some((l) => l.type === "frame")) return setError("Satu transaksi hanya untuk satu frame custom."); add({ type: "frame", refId: f.id, name: `Frame custom · ${f.name}`, unitPrice: f.price }); }} />)}
          </Grid>
        )}
        {tab === "product" && (
          <Grid empty={catalog.products.length === 0 || !catalog.products.some((p) => match(p.name))} hint={<>Belum ada produk. Tambahkan di <Link className="font-semibold text-accent" href="/portal/kasir/pengaturan">Produk & pengaturan</Link>.</>}>
            {catalog.products.filter((p) => match(p.name)).map((p) => <Tile key={p.id} title={p.name} sub="Produk" price={p.price} onClick={() => add({ type: "product", refId: p.id, name: p.name, unitPrice: p.price })} />)}
          </Grid>
        )}
        {tab === "custom" && (
          <div className={`${card} flex flex-col gap-3 p-5 sm:max-w-[460px]`}>
            <label className="text-[13px] font-semibold">Nama item<input className={`${field} mt-1.5 font-normal`} value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} placeholder="mis. Sewa properti" maxLength={80} /></label>
            <label className="text-[13px] font-semibold">Harga (Rp)<input className={`${field} mt-1.5 font-normal`} inputMode="numeric" value={custom.price} onChange={(e) => setCustom({ ...custom, price: e.target.value.replace(/\D/g, "") })} /></label>
            <button type="button" disabled={!custom.name.trim() || !Number(custom.price)} onClick={() => { add({ type: "custom", name: custom.name.trim(), unitPrice: Number(custom.price) }); setCustom({ name: "", price: "" }); }} className="btn btn-primary px-6 py-3 text-[14.5px] disabled:opacity-50">Tambah ke keranjang</button>
          </div>
        )}
      </section>

      <aside className={`${card} flex h-fit flex-col gap-4 p-5 lg:sticky lg:top-4`}>
        <div className="flex items-center justify-between"><h2 className="font-display text-[19px] tracking-tight">Keranjang</h2>{lines.length > 0 && <button type="button" onClick={reset} className="text-[12.5px] font-semibold text-muted hover:text-[#a12626]">Kosongkan</button>}</div>
        {lines.length === 0 ? <p className="rounded-2xl bg-[var(--soft)] px-4 py-8 text-center text-[13.5px] text-muted">Pilih paket atau produk di sebelah kiri.</p> : (
          <ul className="flex max-h-[300px] flex-col gap-2 overflow-auto pr-1">
            {lines.map((l) => (
              <li key={l.key} className="flex items-center gap-3 rounded-2xl bg-[var(--soft)] px-3 py-2.5">
                <div className="min-w-0 flex-1"><div className="truncate text-[13.5px] font-semibold">{l.name}</div><div className="text-[12px] text-muted">{formatRupiah(l.unitPrice)}</div></div>
                <div className="flex items-center gap-1.5">
                  <button type="button" aria-label="Kurangi" onClick={() => bump(l.key, -1)} className="grid h-7 w-7 place-items-center rounded-full bg-[var(--card)] text-[15px] font-bold ring-1 ring-[var(--card-edge)]">−</button>
                  <span className="w-5 text-center text-[13.5px] font-semibold tabular-nums">{l.qty}</span>
                  <button type="button" aria-label="Tambah" onClick={() => bump(l.key, 1)} className="grid h-7 w-7 place-items-center rounded-full bg-[var(--card)] text-[15px] font-bold ring-1 ring-[var(--card-edge)]">+</button>
                </div>
                <div className="w-[84px] text-right text-[13.5px] font-semibold tabular-nums">{formatRupiah(l.unitPrice * l.qty)}</div>
              </li>
            ))}
          </ul>
        )}

        {suggestions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">Tawarkan add-on</div>
            <div className="flex flex-wrap gap-1.5">{suggestions.map((x) => <button key={x.key} type="button" onClick={() => add({ type: "print", refId: x.key, name: `${x.name} (${x.pkg})`, unitPrice: x.price })} className="rounded-full bg-accent/10 px-3 py-1.5 text-[12.5px] font-semibold text-accent transition hover:bg-accent/20">+ {x.name} · {formatRupiah(x.price)}</button>)}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <input className={field} placeholder="Nama pelanggan" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          <input className={field} placeholder="WhatsApp" inputMode="tel" value={wa} onChange={(e) => setWa(e.target.value)} maxLength={20} />
        </div>
        {hasBooth && <label className="flex items-center gap-2.5 text-[13px] text-muted"><input type="checkbox" checked={makeTicket} onChange={(e) => setMakeTicket(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />Buat nomor antrian otomatis</label>}

        <div className="flex flex-col gap-1.5 border-t border-[var(--card-edge)] pt-3 text-[14px]">
          <Row label="Subtotal" value={formatRupiah(subtotal)} />
          {disc > 0 && discMode === "pct" && <Row label={`Potongan ${discount}%`} value={`− ${formatRupiah(disc)}`} />}
          <div className="flex items-center justify-between gap-3"><span className="flex items-center gap-1.5 text-muted">Diskon<span className="inline-flex overflow-hidden rounded-full bg-[var(--soft)] text-[11.5px] font-semibold">{(["rp", "pct"] as const).map((m) => <button key={m} type="button" onClick={() => { setDiscMode(m); setDiscount(""); }} className={`px-2.5 py-1 ${discMode === m ? "bg-[var(--ink)] text-white" : ""}`}>{m === "rp" ? "Rp" : "%"}</button>)}</span></span><input className="h-9 w-[130px] rounded-full border-0 bg-[var(--soft)] px-3.5 text-right text-[13.5px] outline-none focus:ring-2 focus:ring-accent/40" inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value.replace(/\D/g, "").slice(0, discMode === "pct" ? 3 : 9))} placeholder="0" /></div>
          <div className="flex items-baseline justify-between pt-1"><span className="font-semibold">Total</span><span className="font-display text-[26px] font-semibold tracking-tight tabular-nums">{formatRupiah(total)}</span></div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {(["cash", "qris", "transfer", "other"] as const).map((m) => <button key={m} type="button" onClick={() => setMethod(m)} className={`rounded-full px-2 py-2 text-[12.5px] font-semibold transition ${method === m ? "bg-[var(--ink)] text-white" : "bg-[var(--soft)] text-muted hover:text-foreground"}`}>{METHOD_LABEL[m]}</button>)}
        </div>
        {method === "cash" && (
          <div className="flex flex-col gap-2">
            <input className={field} inputMode="numeric" placeholder="Uang diterima (Rp)" value={received} onChange={(e) => setReceived(e.target.value.replace(/\D/g, ""))} />
            <div className="flex flex-wrap gap-1.5">{quick.map((v) => <button key={v} type="button" onClick={() => setReceived(String(v))} className="rounded-full bg-[var(--soft)] px-3 py-1.5 text-[12px] font-semibold text-muted hover:text-foreground">{v === total ? "Uang pas" : formatRupiah(v)}</button>)}</div>
            {cash > 0 && <div className={`text-[13.5px] font-semibold ${cash >= total ? "text-[#0f6b45]" : "text-[#a12626]"}`}>{cash >= total ? `Kembalian ${formatRupiah(cash - total)}` : `Kurang ${formatRupiah(total - cash)}`}</div>}
          </div>
        )}
        {error && <div role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-2.5 text-[13px] text-[#a12626]">{error}</div>}
        <button type="button" disabled={pending || lines.length === 0} onClick={pay} className="btn btn-primary w-full px-6 py-4 text-[16px] disabled:opacity-50">{pending && <Spinner />}Bayar {formatRupiah(total)}</button>
      </aside>

      {done && <SuccessModal done={done} onNew={() => { setDone(null); reset(); router.refresh(); }} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between"><span className="text-muted">{label}</span><span className="tabular-nums">{value}</span></div>;
}

function Grid({ children, empty, hint }: { children: React.ReactNode; empty: boolean; hint: React.ReactNode }) {
  if (empty) return <p className={`${card} px-5 py-10 text-center text-[14px] text-muted`}>{hint}</p>;
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">{children}</div>;
}

function Tile({ title, sub, price, onClick }: { title: string; sub: string; price: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`${card} dash-card-hover flex min-h-[112px] flex-col justify-between p-4 text-left transition active:scale-[0.98]`}>
      <div><div className="text-[14.5px] font-semibold leading-snug">{title}</div><div className="mt-0.5 text-[12px] text-muted">{sub}</div></div>
      <div className="font-display text-[17px] tracking-tight text-accent">{price === 0 ? "Gratis" : formatRupiah(price)}</div>
    </button>
  );
}

function SuccessModal({ done, onNew }: { done: { order: PosOrder; ticket: PosTicket | null }; onNew: () => void }) {
  const { order, ticket } = done;
  const [copied, setCopied] = useState(false);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Pembayaran berhasil">
      <div className="w-full max-w-[440px] rounded-[28px] bg-[var(--card)] p-7 text-center shadow-2xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#22c58b] text-white"><svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
        <h2 className="mt-4 font-display text-[24px] tracking-tight">Pembayaran diterima</h2>
        <p className="mt-1 text-[13px] text-muted">{order.orderNumber} · {METHOD_LABEL[order.paymentMethod]}</p>
        <div className="mt-3 font-display text-[34px] font-semibold tracking-tight tabular-nums">{formatRupiah(order.total)}</div>
        {order.changeGiven !== null && order.changeGiven > 0 && <div className="mt-1 text-[15px] font-semibold text-[#0f6b45]">Kembalian {formatRupiah(order.changeGiven)}</div>}
        {order.kioskVoucherCode && (
          <div className="mt-5 rounded-2xl bg-accent/10 p-4">
            <div className="text-[12px] font-semibold uppercase tracking-widest text-accent">Kode untuk kiosk</div>
            <button type="button" onClick={() => { void navigator.clipboard?.writeText(order.kioskVoucherCode ?? ""); setCopied(true); }} className="mt-1 font-display text-[28px] font-semibold tracking-wider">{order.kioskVoucherCode}</button>
            <div className="mt-1 text-[12px] text-muted">{copied ? "Disalin!" : "Pelanggan memasukkan kode ini di layar pembayaran kiosk (menu voucher)."}</div>
            {order.items.some((i) => i.type === "frame") && <div className="mt-2 rounded-xl bg-accent/10 px-3 py-2 text-[12.5px] font-semibold text-accent">Voucher ini membuka frame custom pelanggan. Sesi langsung memakai frame itu.</div>}
          </div>
        )}
        {ticket && <div className="mt-3 rounded-2xl bg-[var(--soft)] p-3.5 text-[14px]">Nomor antrian <b className="ml-1 font-display text-[22px] tracking-tight">{ticket.label}</b></div>}
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <Link href={`/struk-kasir/${order.id}`} target="_blank" className="btn glass rounded-full! px-5 py-3.5 text-[14.5px]">Cetak struk</Link>
          <button type="button" onClick={onNew} className="btn btn-primary px-5 py-3.5 text-[14.5px]">Transaksi baru</button>
        </div>
      </div>
    </div>
  );
}
