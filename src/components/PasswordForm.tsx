"use client";

import { useActionState } from "react";
import { changePasswordAction, type PasswordState } from "@/app/portal/akun/actions";

const field =
  "w-full rounded-2xl border border-foreground/10 bg-white/70 px-4 py-3.5 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";

export function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePasswordAction, { error: null, ok: false });
  return (
    <form action={action} className="grid max-w-[520px] gap-5">
      <label className="grid gap-2 text-sm font-medium">
        Password saat ini
        <input name="currentPassword" type="password" required autoComplete="current-password" className={field} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Password baru <span className="font-normal text-muted">(minimal 8 karakter)</span>
        <input name="newPassword" type="password" required minLength={8} autoComplete="new-password" className={field} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Ulangi password baru
        <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={field} />
      </label>
      {state.error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{state.error}</p>}
      {state.ok && <p role="status" className="rounded-2xl bg-[#dff7ec] px-4 py-3 text-sm text-[#0f6b45]">Password berhasil diganti. Kiosk yang sudah terpasang tidak terpengaruh.</p>}
      <button type="submit" disabled={pending} className="btn btn-primary py-4 text-base disabled:opacity-60">
        {pending ? "Menyimpan…" : "Ganti Password"}
      </button>
    </form>
  );
}
