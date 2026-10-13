"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Spinner } from "@/components/Spinner";
import { confirmResetAction, requestResetAction, resendVerificationAction, type FormState } from "@/app/lupa-password/actions";

const field = "w-full rounded-2xl border border-foreground/10 bg-panel/70 px-4 py-3.5 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";
const initial: FormState = { error: null, ok: false };

const CheckIcon = () => (
  <span className="pop-in grid h-14 w-14 place-items-center rounded-full bg-[#dff7ec] text-[#0f6b45]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true"><path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
);

/** "Lupa password": asks for the email. The answer never reveals whether the address has an account. */
export function ForgotPasswordForm({ realm }: { realm: "tenant" | "creator" }) {
  const [state, action, pending] = useActionState(requestResetAction, initial);
  if (state.ok) {
    return (
      <div className="glass flex flex-col items-start gap-4 p-8 md:p-10" role="status">
        <CheckIcon />
        <h2 className="font-display text-2xl tracking-tight">Cek email Anda</h2>
        <p className="text-[15px] leading-relaxed text-muted">Jika alamat itu terdaftar, kami baru saja mengirim tautan untuk membuat kata sandi baru (berlaku 2 jam, sekali pakai). Cek juga folder spam.</p>
      </div>
    );
  }
  return (
    <form action={action} aria-busy={pending} className={`glass grid gap-5 p-8 md:p-10 ${pending ? "form-busy" : ""}`}>
      <input type="hidden" name="jenis" value={realm} />
      <label className="grid gap-2 text-sm font-medium">Email akun<input name="email" type="email" required autoComplete="email" className={field} /></label>
      {state.error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary py-4 text-base disabled:opacity-60">{pending ? <><Spinner />Mengirim…</> : "Kirim tautan"}</button>
    </form>
  );
}

/** Form behind the emailed link: set a new password (also used for first-time setup of an invited account). */
export function SetPasswordForm({ realm, token }: { realm: "tenant" | "creator"; token: string }) {
  const [state, action, pending] = useActionState(confirmResetAction, initial);
  if (state.ok) {
    return (
      <div className="glass flex flex-col items-start gap-4 p-8 md:p-10" role="status">
        <CheckIcon />
        <h2 className="font-display text-2xl tracking-tight">Kata sandi tersimpan</h2>
        <p className="text-[15px] leading-relaxed text-muted">Sekarang Anda bisa masuk dengan kata sandi baru.</p>
        <Link href={realm === "creator" ? "/kreator/masuk" : "/masuk"} className="btn btn-primary px-7 py-3.5">Masuk</Link>
      </div>
    );
  }
  return (
    <form action={action} aria-busy={pending} className={`glass grid gap-5 p-8 md:p-10 ${pending ? "form-busy" : ""}`}>
      <input type="hidden" name="jenis" value={realm} />
      <input type="hidden" name="token" value={token} />
      <label className="grid gap-2 text-sm font-medium">Kata sandi baru <span className="font-normal text-muted">(minimal 8 karakter)</span><input name="password" type="password" required minLength={8} maxLength={200} autoComplete="new-password" className={field} /></label>
      <label className="grid gap-2 text-sm font-medium">Ulangi kata sandi<input name="confirm" type="password" required minLength={8} maxLength={200} autoComplete="new-password" className={field} /></label>
      {state.error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{state.error} {/(kedaluwarsa|sudah dipakai|tidak valid)/i.test(state.error) && <Link href={`/lupa-password?jenis=${realm}`} className="font-semibold underline underline-offset-4">Minta tautan baru</Link>}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary py-4 text-base disabled:opacity-60">{pending ? <><Spinner />Menyimpan…</> : "Simpan kata sandi"}</button>
    </form>
  );
}

/** Shown on /verifikasi when a link is expired or wrong: ask for a fresh one. */
export function ResendVerificationForm({ realm }: { realm: "tenant" | "creator" }) {
  const [state, action, pending] = useActionState(resendVerificationAction, initial);
  if (state.ok) return <p role="status" className="rounded-2xl bg-[#dff7ec] px-4 py-3 text-sm text-[#0f6b45]">Jika alamat itu menunggu verifikasi, email baru sudah dikirim.</p>;
  return (
    <form action={action} aria-busy={pending} className={`grid gap-3 ${pending ? "form-busy" : ""}`}>
      <input type="hidden" name="jenis" value={realm} />
      <label className="grid gap-2 text-sm font-medium">Kirim ulang ke email<input name="email" type="email" required autoComplete="email" className={field} /></label>
      {state.error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary py-3.5 text-[15px] disabled:opacity-60">{pending ? <><Spinner />Mengirim…</> : "Kirim ulang email verifikasi"}</button>
    </form>
  );
}
