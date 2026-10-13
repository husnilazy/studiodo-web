"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Spinner } from "@/components/Spinner";
import { deleteReviewAction, reportTemplateAction, saveReviewAction } from "@/app/portal/template/actions";

export type FeedbackState =
  | { kind: "guest" }
  | { kind: "tenant"; installed: boolean; myReview: { rating: number; comment: string } | null; reportOpen: boolean };

const field = "w-full rounded-2xl border border-transparent bg-foreground/[0.05] px-4 py-3 text-[14.5px] outline-none transition focus:border-accent focus:bg-panel focus:ring-2 focus:ring-accent/25";

function Stars({ value, onChange, size = "text-3xl" }: { value: number; onChange?: (n: number) => void; size?: string }) {
  return (
    <div role={onChange ? "radiogroup" : "img"} aria-label={`Rating ${value} dari 5`} className={`flex gap-1 ${size} leading-none`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} role={onChange ? "radio" : undefined} aria-checked={onChange ? value === n : undefined} aria-label={`${n} bintang`} onClick={() => onChange?.(n)}
          className={`transition ${n <= value ? "text-[#f5b301]" : "text-foreground/20"} ${onChange ? "hover:scale-110" : "cursor-default"}`}>★</button>
      ))}
    </div>
  );
}
export { Stars };

/** Review + report box on the public template page. Guests get a prompt to sign in; only tenants who installed it can review. */
export function TemplateFeedback({ templateId, state, reasons }: { templateId: string; state: FeedbackState; reasons: { key: string; label: string }[] }) {
  const [pending, start] = useTransition();
  const mine = state.kind === "tenant" ? state.myReview : null;
  const [rating, setRating] = useState(mine?.rating ?? 0);
  const [comment, setComment] = useState(mine?.comment ?? "");
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState<"" | "save" | "delete" | "report">("");

  const run = (kind: "save" | "delete" | "report", fn: () => Promise<{ ok: boolean; error?: string }>, okText: string, after?: () => void) => {
    setMsg(null); setBusy(kind);
    start(async () => {
      const r = await fn();
      setBusy("");
      if (r.ok) { setMsg({ tone: "ok", text: okText }); after?.(); } else setMsg({ tone: "error", text: r.error ?? "Gagal" });
    });
  };

  if (state.kind === "guest") {
    return (
      <div className="glass p-6 md:p-7">
        <h2 className="font-display text-lg tracking-tight">Pakai template ini?</h2>
        <p className="mt-1 text-[14px] text-muted">Masuk ke dashboard untuk memberi ulasan atau melaporkan masalah pada template ini.</p>
        <Link href="/masuk" className="btn btn-primary mt-4 inline-block px-6 py-3 text-[14px]">Masuk</Link>
      </div>
    );
  }

  return (
    <div className="glass p-6 md:p-7">
      <h2 className="font-display text-lg tracking-tight">{mine ? "Ulasan Anda" : "Beri ulasan"}</h2>
      {state.installed ? (
        <div className={`mt-3 grid gap-3 ${pending && busy !== "report" ? "form-busy" : ""}`}>
          <Stars value={rating} onChange={setRating} />
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={600} placeholder="Ceritakan pengalaman Anda memakai frame ini (opsional)" className={field} />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={pending || rating === 0} onClick={() => run("save", () => saveReviewAction(templateId, rating, comment), "Ulasan tersimpan. Terima kasih!")} className="btn btn-primary px-6 py-2.5 text-[14px] disabled:opacity-60">
              {busy === "save" ? <><Spinner />Menyimpan…</> : mine ? "Perbarui ulasan" : "Kirim ulasan"}
            </button>
            {mine && <button type="button" disabled={pending} onClick={() => run("delete", () => deleteReviewAction(templateId), "Ulasan dihapus.", () => { setRating(0); setComment(""); })} className="btn px-5 py-2.5 text-[13.5px] text-muted disabled:opacity-60">{busy === "delete" ? <><Spinner />Menghapus…</> : "Hapus ulasan"}</button>}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[14px] text-muted">Pasang template ini ke akun Anda dulu, lalu Anda bisa memberi ulasan. <Link href={`/portal/template?pilih=${templateId}`} className="font-semibold text-accent underline underline-offset-4">Pasang sekarang</Link></p>
      )}

      <div className="mt-5 border-t border-foreground/10 pt-4">
        {state.reportOpen ? (
          <p className="text-[13px] text-muted">Laporan Anda untuk template ini sedang ditinjau tim STUDIODO.</p>
        ) : !showReport ? (
          <button type="button" onClick={() => setShowReport(true)} className="text-[13px] font-semibold text-muted underline underline-offset-4 hover:text-foreground">Laporkan masalah pada template ini</button>
        ) : (
          <div className={`grid gap-3 ${pending && busy === "report" ? "form-busy" : ""}`}>
            <select value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Alasan" className={field}>
              <option value="">Pilih alasan…</option>
              {reasons.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
            <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} maxLength={800} placeholder="Jelaskan masalahnya" className={field} />
            <div className="flex gap-2">
              <button type="button" disabled={pending || !reason} onClick={() => run("report", () => reportTemplateAction(templateId, reason, detail), "Laporan terkirim. Tim kami akan meninjaunya.", () => setShowReport(false))} className="btn btn-primary px-5 py-2.5 text-[13.5px] disabled:opacity-60">{busy === "report" ? <><Spinner />Mengirim…</> : "Kirim laporan"}</button>
              <button type="button" onClick={() => setShowReport(false)} className="btn px-5 py-2.5 text-[13.5px] text-muted">Batal</button>
            </div>
          </div>
        )}
      </div>
      {msg && <p role={msg.tone === "error" ? "alert" : "status"} className={`mt-4 rounded-2xl px-4 py-3 text-sm ${msg.tone === "ok" ? "bg-[#dff7ec] text-[#0f6b45]" : "bg-[#ffe3e3] text-[#a12626]"}`}>{msg.text}</p>}
    </div>
  );
}
