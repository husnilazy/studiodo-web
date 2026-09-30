"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/masuk/actions";

const field =
  "w-full rounded-2xl border border-foreground/10 bg-white/70 px-4 py-3.5 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";

export function LoginForm({ sessionExpired }: { sessionExpired: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, { error: null });
  return (
    <form action={action} className="glass grid gap-5 p-8 md:p-10">
      {sessionExpired && !state.error && (
        <p role="status" className="rounded-2xl bg-[#fff3d6] px-4 py-3 text-sm text-[#7a5a00]">Sesi Anda berakhir. Silakan masuk lagi.</p>
      )}
      <label className="grid gap-2 text-sm font-medium">
        Email
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Password
        <input name="password" type="password" required autoComplete="current-password" className={field} />
      </label>
      {state.error && (
        <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary py-4 text-base disabled:opacity-60">
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}
