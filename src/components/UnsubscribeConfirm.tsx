"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Spinner } from "@/components/Spinner";
import { unsubscribeAction, type FormState } from "@/app/lupa-password/actions";

/** Asks for one click before changing anything (mail scanners open links; only a real click should unsubscribe). */
export function UnsubscribeConfirm({ token, label, realm }: { token: string; label: string; realm: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(unsubscribeAction, { error: null, ok: false });
  const settings = realm === "creator" ? "/kreator/portal/akun" : "/portal/akun";
  if (state.ok) {
    return (
      <div className="glass flex flex-col items-start gap-4 p-8 md:p-10" role="status">
        <span className="pop-in grid h-14 w-14 place-items-center rounded-full bg-[#dff7ec] text-[#0f6b45]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true"><path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
        <p className="text-[15px] leading-relaxed text-muted">Selesai. Anda tidak akan menerima lagi email &ldquo;{label}&rdquo;. Bisa diaktifkan kembali kapan saja di <Link href={settings} className="font-semibold text-accent underline underline-offset-4">pengaturan akun</Link>.</p>
      </div>
    );
  }
  return (
    <form action={action} aria-busy={pending} className={`glass grid gap-5 p-8 md:p-10 ${pending ? "form-busy" : ""}`}>
      <input type="hidden" name="token" value={token} />
      <p className="text-[15px] leading-relaxed text-muted">Berhenti menerima email <strong className="text-foreground">&ldquo;{label}&rdquo;</strong>? Email keamanan dan email penting akun tetap terkirim.</p>
      {state.error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-primary py-4 text-base disabled:opacity-60">{pending ? <><Spinner />Memproses…</> : "Ya, berhenti berlangganan"}</button>
    </form>
  );
}
