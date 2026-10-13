"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Spinner } from "@/components/Spinner";
import { createPortal } from "react-dom";
import type { CrmCustomer, CrmList, CrmSession, CrmSummary } from "@/lib/portalTypes";
import { DEFAULT_WA_TEMPLATE, downloadText, fillTemplate, initialsOf, prettyPhone, relativeTime, rupiah, toCsv, waHref, rupiahShort } from "@/lib/crmFormat";
import { exportCustomersAction, loadCustomerAction, loadCustomersAction, saveCustomerAction } from "@/app/portal/pelanggan/actions";

// Customer database + CRM on the website: one list, a WhatsApp button on every row, and a detail drawer with the whole history.

const PAGE = 20;
const TEMPLATE_KEY = "studiodo-crm-wa-template";
const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "returning", label: "Pelanggan setia" },
  { id: "new", label: "Baru (30 hari)" },
  { id: "consent", label: "Boleh dipublikasi" },
  { id: "optout", label: "Jangan dihubungi" },
] as const;
const SORTS = [
  { id: "recent", label: "Terbaru" },
  { id: "visits", label: "Paling sering" },
  { id: "spend", label: "Belanja terbesar" },
  { id: "name", label: "Nama A–Z" },
] as const;

const field = "w-full rounded-2xl border border-foreground/10 bg-panel/70 px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";
const smallBtn = "btn glass rounded-full! px-4 py-2.5 text-[13px] text-muted transition hover:text-foreground disabled:opacity-50";

const readTemplate = () => { try { return localStorage.getItem(TEMPLATE_KEY) || DEFAULT_WA_TEMPLATE; } catch { return DEFAULT_WA_TEMPLATE; } };

function WhatsAppIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4.1A8 8 0 1 1 20 12z" /><path d="M9.2 8.8c0 3 2.2 5.4 5.6 6.2l1.2-1.3-2-1-.9.8c-.8-.4-1.5-1.1-1.9-1.9l.8-.9-1-2z" />
    </svg>
  );
}

function WhatsAppButton({ customer, brand, large }: { customer: CrmCustomer; brand: string; large?: boolean }) {
  // Read the template when the tab is clicked, not at render: it lives in localStorage, which the server render can't see.
  if (!customer.whatsapp) return null;
  const digits = customer.whatsapp;
  return (
    <a
      href={waHref(digits)}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => {
        e.stopPropagation();
        if (customer.marketingOptOut && !window.confirm("Pelanggan ini meminta tidak dihubungi. Tetap buka WhatsApp?")) { e.preventDefault(); return; }
        e.currentTarget.href = waHref(digits, fillTemplate(readTemplate(), { nama: customer.name, brand, link: customer.lastShareUrl }));
      }}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#25D366] font-semibold text-[#06361a] shadow-md transition hover:brightness-105 active:scale-[.98] ${large ? "min-h-[52px] px-7 text-base" : "min-h-[44px] px-5 text-sm"}`}
    >
      <WhatsAppIcon className={large ? "h-5 w-5" : undefined} />WhatsApp
    </a>
  );
}

function Drawer({ customerKey, brand, onClose, onSaved }: { customerKey: string; brand: string; onClose: () => void; onSaved: () => void }) {
  const [data, setData] = useState<{ customer: CrmCustomer; sessions: CrmSession[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [optOut, setOptOut] = useState(false);
  const [template, setTemplate] = useState(DEFAULT_WA_TEMPLATE);
  const [pickedLink, setPickedLink] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    let alive = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the saved template can only be read from the browser
    setTemplate(readTemplate());
    loadCustomerAction(customerKey).then((r) => {
      if (!alive) return;
      if (!r.ok) { setError(r.error); return; }
      setData(r.data);
      setName(r.data.customer.name ?? "");
      setNotes(r.data.customer.notes ?? "");
      setTags(r.data.customer.tags);
      setOptOut(r.data.customer.marketingOptOut);
      setPickedLink(r.data.customer.lastShareUrl);
    });
    return () => { alive = false; };
  }, [customerKey]);

  const touch = () => { dirty.current = true; };
  const addTag = () => {
    const t = tagDraft.trim().slice(0, 24);
    if (t && !tags.includes(t) && tags.length < 10) { setTags([...tags, t]); touch(); }
    setTagDraft("");
  };
  const save = () => {
    setMessage(null);
    start(async () => {
      const r = await saveCustomerAction({ key: customerKey, name, notes, tags, marketingOptOut: optOut });
      if (r.ok) {
        try { localStorage.setItem(TEMPLATE_KEY, template); } catch { /* storage unavailable */ }
        dirty.current = false;
        setMessage({ tone: "ok", text: "Tersimpan." });
        onSaved();
      } else setMessage({ tone: "error", text: r.error });
    });
  };
  const close = () => { if (dirty.current && !window.confirm("Ada perubahan yang belum disimpan. Tutup tanpa menyimpan?")) return; onClose(); };

  const c = data?.customer;
  const links = (data?.sessions ?? []).filter((s) => s.shareUrl);
  const preview = c ? fillTemplate(template, { nama: name || c.name, brand, link: pickedLink }) : "";

  // Rendered into <body>: inside the portal layout the page content sits in its own stacking context, under the sticky header.
  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/45 backdrop-blur-[2px]" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <aside role="dialog" aria-label="Detail pelanggan" className="flex h-full w-full max-w-[560px] flex-col overflow-hidden border-l border-foreground/10 bg-background shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-foreground/10 p-5">
          {c ? (
            <div className="flex min-w-0 items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent/15 font-display text-xl text-accent">{initialsOf(name || c.name, c.whatsapp ?? c.email ?? "?")}</span>
              <div className="min-w-0">
                <p className="truncate font-display text-2xl tracking-tight">{name || c.name || prettyPhone(c.whatsapp) || c.email}</p>
                <p className="text-sm text-muted">{c.paidSessions} kunjungan · {rupiah(c.totalSpend)} · terakhir {relativeTime(c.lastSeen)}</p>
              </div>
            </div>
          ) : <p className="text-muted">{error ?? "Memuat…"}</p>}
          <button type="button" onClick={close} aria-label="Tutup" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-foreground/15 text-muted hover:text-foreground">✕</button>
        </header>

        {c && (
          <div className="flex-1 space-y-6 overflow-y-auto p-5">
            <section className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {c.whatsapp && <span className="rounded-full bg-foreground/[0.06] px-4 py-2.5 font-medium">{prettyPhone(c.whatsapp)}</span>}
                {c.whatsapp && <button type="button" className={smallBtn} onClick={() => void navigator.clipboard?.writeText(`+${c.whatsapp}`)}>Salin nomor</button>}
                {c.email && <a href={`mailto:${c.email}`} className={`${smallBtn} inline-flex items-center`}>{c.email}</a>}
                {c.consent && <span className="rounded-full bg-[#dff7ec] px-3 py-1.5 text-xs font-semibold text-[#0f6b45]">Boleh dipublikasi</span>}
              </div>
              {c.whatsapp ? (
                <div className="rounded-[22px] border border-[#25D366]/30 bg-[#25D366]/[0.07] p-4">
                  <p className="text-sm font-semibold">Pesan WhatsApp</p>
                  <textarea value={template} onChange={(e) => { setTemplate(e.target.value); touch(); }} rows={3} className={`${field} mt-2`} aria-label="Isi pesan" />
                  <p className="mt-1.5 text-[12px] text-muted">Gunakan <code>{"{nama}"}</code>, <code>{"{brand}"}</code>, <code>{"{link}"}</code>. Pesan dibuka di WhatsApp — Anda tetap menekan kirim sendiri.</p>
                  {links.length > 1 && (
                    <label className="mt-2 grid gap-1.5 text-[13px] text-muted">Link galeri yang disertakan
                      <select value={pickedLink ?? ""} onChange={(e) => setPickedLink(e.target.value)} className={field}>
                        {links.map((s) => <option key={s.id} value={s.shareUrl ?? ""}>{new Date(s.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} · {s.packageName ?? "Sesi"}</option>)}
                      </select>
                    </label>
                  )}
                  <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-panel/70 px-4 py-3 text-sm">{preview}</p>
                  <div className="mt-3">
                    <a
                      href={waHref(c.whatsapp, preview)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => { if (optOut && !window.confirm("Pelanggan ini meminta tidak dihubungi. Tetap buka WhatsApp?")) e.preventDefault(); }}
                      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 text-base font-semibold text-[#06361a] shadow-md transition hover:brightness-105"
                    ><WhatsAppIcon className="h-5 w-5" />Kirim lewat WhatsApp</a>
                  </div>
                </div>
              ) : <p className="rounded-2xl bg-foreground/[0.05] p-3 text-sm text-muted">Pelanggan ini hanya meninggalkan email, belum ada nomor WhatsApp.</p>}
              {optOut && <p className="rounded-2xl bg-[#ffe3e3] p-3 text-sm text-[#a12626]">Ditandai &ldquo;jangan dihubungi&rdquo; — jangan kirim promo ke pelanggan ini.</p>}
            </section>

            <section className="space-y-4">
              <label className="grid gap-2 text-sm font-medium">Nama<input value={name} onChange={(e) => { setName(e.target.value); touch(); }} maxLength={100} placeholder="Tambahkan nama pelanggan" className={field} /></label>
              <div>
                <p className="text-sm font-medium">Label</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((t) => <button key={t} type="button" onClick={() => { setTags(tags.filter((x) => x !== t)); touch(); }} title="Ketuk untuk hapus" className="min-h-[38px] rounded-full bg-accent/12 px-3.5 text-sm font-medium text-accent hover:bg-[#ffe3e3] hover:text-[#a12626]">{t} ✕</button>)}
                  <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); addTag(); }}>
                    <input value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} maxLength={24} placeholder="mis. VIP, EO, Langganan" className="min-h-[38px] w-48 rounded-full border border-foreground/10 bg-panel/70 px-4 text-sm outline-none focus:border-accent" />
                    <button type="submit" className={smallBtn}>Tambah</button>
                  </form>
                </div>
              </div>
              <label className="grid gap-2 text-sm font-medium">Catatan<textarea value={notes} onChange={(e) => { setNotes(e.target.value); touch(); }} rows={3} maxLength={2000} placeholder="Preferensi, acara yang pernah dipesan, dsb." className={field} /></label>
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={optOut} onChange={(e) => { setOptOut(e.target.checked); touch(); }} className="h-5 w-5 accent-[var(--accent)]" />Jangan hubungi untuk promo</label>
              {message && <p role={message.tone === "error" ? "alert" : "status"} className={`rounded-2xl px-4 py-3 text-sm ${message.tone === "ok" ? "bg-[#dff7ec] text-[#0f6b45]" : "bg-[#ffe3e3] text-[#a12626]"}`}>{message.text}</p>}
              <button type="button" onClick={save} disabled={pending} className="btn btn-primary min-h-[52px] w-full py-3.5 text-base disabled:opacity-60">{pending ? <><Spinner />Menyimpan…</> : "Simpan perubahan"}</button>
            </section>

            <section>
              <h3 className="font-display text-lg tracking-tight">Riwayat sesi ({data?.sessions.length ?? 0})</h3>
              <ul className="mt-3 space-y-2">
                {data?.sessions.map((s) => (
                  <li key={s.id} className="rounded-[18px] border border-foreground/10 p-3.5 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{s.packageName ?? "Sesi"} <span className="font-normal text-muted">· {new Date(s.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.paymentStatus === "success" ? "bg-[#dff7ec] text-[#0f6b45]" : "bg-foreground/[0.08] text-muted"}`}>{s.paymentStatus === "success" ? rupiah(s.totalAmount) : s.paymentStatus === "pending" ? "Menunggu bayar" : "Tidak dibayar"}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">{s.boothLabel ? `${s.boothLabel} · ` : ""}{s.photoCount} foto{s.voucherCode ? ` · voucher ${s.voucherCode}` : ""}</p>
                    {s.feedback && <p className="mt-2 rounded-xl bg-foreground/[0.05] px-3 py-2">“{s.feedback}”</p>}
                    {s.shareUrl && <a href={s.shareUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold text-accent underline underline-offset-4">Buka galeri</a>}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}

export function CrmManager({ initial, brand }: { initial: CrmList; brand: string }) {
  const [items, setItems] = useState<CrmCustomer[]>(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [summary, setSummary] = useState<CrmSummary>(initial.summary);
  const [allTags, setAllTags] = useState<string[]>(initial.tags);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("recent");
  const [tag, setTag] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const first = useRef(true);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setTimeout(() => setDebounced(query), 300); return () => clearTimeout(t); }, [query]);

  const params = useMemo(() => ({ q: debounced, filter, sort, tag }), [debounced, filter, sort, tag]);
  const load = useCallback(async (append: boolean, offset: number) => {
    setLoading(true);
    const r = await loadCustomersAction({ ...params, limit: PAGE, offset });
    setLoading(false);
    if (!r.ok) { setError(r.error); return; }
    setError(null);
    setItems((cur) => (append ? [...cur, ...r.data.items] : r.data.items));
    setTotal(r.data.total);
    setSummary(r.data.summary);
    setAllTags(r.data.tags);
  }, [params]);
  useEffect(() => {
    if (first.current) { first.current = false; return; } // the server already rendered the first page
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch when the search or a filter changes
    void load(false, 0);
  }, [load]);

  // Infinite scroll: when the marker at the end of the list scrolls into view inside the panel, fetch the next page.
  const more = items.length < total;
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !more || loading) return;
    const io = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) void load(true, items.length); }, { root: el.closest(".fit-scroll"), rootMargin: "0px 0px 200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [more, loading, items.length, load]);

  const exportCsv = async () => {
    setExporting(true);
    const r = await exportCustomersAction(params);
    setExporting(false);
    if (!r.ok) { setError(r.error); return; }
    const rows: (string | number | null)[][] = [["Nama", "WhatsApp", "Email", "Kunjungan (dibayar)", "Total sesi", "Total belanja", "Pertama datang", "Terakhir datang", "Boleh dipublikasi", "Jangan dihubungi", "Label", "Catatan", "Feedback terakhir"]];
    for (const c of r.data) rows.push([c.name, c.whatsapp ? `+${c.whatsapp}` : "", c.email, c.paidSessions, c.sessions, c.totalSpend, c.firstSeen, c.lastSeen, c.consent ? "Ya" : "Tidak", c.marketingOptOut ? "Ya" : "Tidak", c.tags.join("; "), c.notes, c.lastFeedback]);
    downloadText(`pelanggan-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
  };

  const chip = (active: boolean) => `min-h-[38px] rounded-full px-4 text-[13px] font-semibold transition ${active ? "bg-[var(--ink)] text-white shadow-sm" : "bg-[var(--soft)] text-muted hover:text-foreground"}`;
  const stat = (label: string, value: string, detail?: string) => (
    <div className="glass min-w-0 rounded-[20px] px-4 py-3.5"><div className="text-[12.5px] text-muted">{label}</div><div className="mt-1 truncate font-display text-[22px] leading-tight tracking-tight">{value}</div>{detail && <div className="mt-0.5 truncate text-[11.5px] font-medium text-accent">{detail}</div>}</div>
  );

  return (
    <div className="fit-page flex-1">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stat("Pelanggan", String(summary.customers), `${summary.new30d} baru 30 hari terakhir`)}
        {stat("Punya WhatsApp", String(summary.withWhatsapp), "Bisa dihubungi langsung")}
        {stat("Pelanggan setia", String(summary.returning), "Datang 2× atau lebih")}
        {stat("Boleh dipublikasi", String(summary.consent))}
        {stat("Total belanja", rupiahShort(summary.lifetimeSpend))}
      </div>

      <section className="glass fit-panel">
        <div className="flex flex-col gap-3 border-b border-[var(--card-edge)] px-4 py-4 md:px-5">
        <div className="flex flex-wrap items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama, nomor WhatsApp, email, atau catatan…" aria-label="Cari pelanggan" className={`${field} min-w-[240px] flex-1 !rounded-full !px-6 !py-3`} />
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Urutkan" className={`${field} !w-auto !rounded-full !px-5`}>{SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
          <button type="button" onClick={exportCsv} disabled={exporting} className={`${smallBtn} min-h-[44px]`}>{exporting ? <><Spinner />Menyiapkan…</> : "Ekspor CSV"}</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className={chip(filter === f.id)}>{f.label}</button>)}
          {allTags.map((t) => <button key={t} type="button" onClick={() => setTag(tag === t ? "" : t)} aria-pressed={tag === t} className={chip(tag === t)}>#{t}</button>)}
        </div>
        </div>
        <div className="fit-scroll dash-scroll px-4 md:px-5">

        {error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{error}</p>}

        {items.length === 0 && !loading ? (
          <div className="rounded-[22px] border border-dashed border-foreground/15 p-10 text-center text-muted">
            {debounced || filter !== "all" || tag ? "Tidak ada pelanggan yang cocok dengan pencarian ini." : "Belum ada pelanggan. Nomor WhatsApp atau email yang diisi pelanggan di layar hasil akan muncul di sini."}
          </div>
        ) : (
          <ul className="divide-y divide-foreground/[0.08]">
            {items.map((c) => (
              <li key={c.key}>
                <div role="button" tabIndex={0} onClick={() => setOpen(c.key)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(c.key); } }}
                  className="-mx-2 flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-3 rounded-[20px] px-2 py-3.5 transition hover:bg-foreground/[0.04]">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/15 font-display text-lg text-accent">{initialsOf(c.name, c.whatsapp ?? c.email ?? "?")}</span>
                  <div className="min-w-0 flex-1 basis-56">
                    <p className="truncate text-base font-semibold">{c.name || prettyPhone(c.whatsapp) || c.email}</p>
                    <p className="truncate text-sm text-muted">{c.name ? (prettyPhone(c.whatsapp) || c.email) : c.email && c.whatsapp ? c.email : ""}</p>
                    {(c.tags.length > 0 || c.marketingOptOut || c.consent) && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {c.tags.map((t) => <span key={t} className="rounded-full bg-accent/12 px-2.5 py-0.5 text-[11px] font-medium text-accent">{t}</span>)}
                        {c.consent && <span className="rounded-full bg-[#dff7ec] px-2.5 py-0.5 text-[11px] font-medium text-[#0f6b45]">Publikasi OK</span>}
                        {c.marketingOptOut && <span className="rounded-full bg-[#ffe3e3] px-2.5 py-0.5 text-[11px] font-medium text-[#a12626]">Jangan dihubungi</span>}
                      </div>
                    )}
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold tabular-nums">{rupiah(c.totalSpend)}</p>
                    <p className="text-xs text-muted">{c.paidSessions}× datang · {relativeTime(c.lastSeen)}</p>
                  </div>
                  <div className="ml-auto"><WhatsAppButton customer={c} brand={brand} /></div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {items.length < total && <div ref={sentinel} className="h-px" aria-hidden="true" />}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--card-edge)] px-4 py-3 text-[13px] text-muted md:px-5">
          <span>{loading ? <><Spinner />Memuat…</> : `Menampilkan ${items.length} dari ${total} pelanggan`}</span>
          {items.length < total && !loading && <button type="button" onClick={() => void load(true, items.length)} className={smallBtn}>Muat lebih banyak</button>}
        </div>
      </section>

      {open && <Drawer customerKey={open} brand={brand} onClose={() => setOpen(null)} onSaved={() => void load(false, 0)} />}
    </div>
  );
}
