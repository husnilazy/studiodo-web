"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Spinner } from "@/components/Spinner";
import { instantSignupAction, type InstantSignupState } from "@/app/daftar/actions";

// Instant sign-up: the owner picks a plan, fills this short form and lands in the dashboard with a trial booth key already created.
// Choosing "Langsung berlangganan" continues straight to payment; "Coba gratis dulu" goes to the dashboard.

const businessTypes = [
  { value: "photobooth_rental", label: "Sewa photobooth" },
  { value: "event_organizer", label: "Event organizer" },
  { value: "studio", label: "Studio foto" },
  { value: "other", label: "Lainnya" },
];
const field = "w-full rounded-2xl border border-foreground/10 bg-panel/70 px-4 py-3.5 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";

export function InstantSignupForm({ plan, periode, aksi, trialDays }: { plan?: string; periode?: string; aksi?: string; trialDays: number }) {
  const [state, formAction, pending] = useActionState<InstantSignupState, FormData>(instantSignupAction, { error: null });
  const defaultStart = aksi === "bayar" ? "bayar" : "trial";
  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : null;

  return (
    <form action={formAction} aria-busy={pending} className={`glass grid gap-5 p-8 md:p-10 ${pending ? "form-busy" : ""}`}>
      <input type="hidden" name="plan" value={plan ?? ""} />
      <input type="hidden" name="periode" value={periode === "tahunan" ? "tahunan" : "bulanan"} />
      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Perusahaan <input name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-medium">Mau mulai dengan apa?{planLabel ? <span className="font-normal text-muted"> · Paket {planLabel}</span> : null}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            { v: "trial", title: `Coba gratis ${trialDays} hari`, sub: "Tanpa bayar dulu. Pasang kiosk dan coba semua fitur." },
            { v: "bayar", title: "Langsung berlangganan", sub: "Setelah daftar, langsung ke pembayaran dan booth aktif." },
          ] as const).map((o) => (
            <label key={o.v} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-foreground/10 bg-panel/50 p-4 has-[:checked]:border-accent has-[:checked]:bg-accent/[0.06] has-[:checked]:ring-2 has-[:checked]:ring-accent/25">
              <input type="radio" name="mulai" value={o.v} defaultChecked={defaultStart === o.v} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
              <span><span className="block font-semibold">{o.title}</span><span className="block text-[13px] text-muted">{o.sub}</span></span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">Nama bisnis
          <input name="businessName" required minLength={2} maxLength={100} className={field} placeholder="mis. Snap Corner Booth" />
        </label>
        <label className="grid gap-2 text-sm font-medium">Nama pemilik
          <input name="ownerName" required minLength={2} maxLength={100} className={field} autoComplete="name" />
        </label>
        <label className="grid gap-2 text-sm font-medium">Email <span className="font-normal text-muted">(untuk masuk)</span>
          <input name="email" type="email" required className={field} autoComplete="email" />
        </label>
        <label className="grid gap-2 text-sm font-medium">WhatsApp
          <input name="whatsapp" type="tel" maxLength={40} className={field} autoComplete="tel" placeholder="08xxxxxxxxxx" />
        </label>
        <label className="grid gap-2 text-sm font-medium">Password <span className="font-normal text-muted">(minimal 8 karakter)</span>
          <input name="password" type="password" required minLength={8} maxLength={100} className={field} autoComplete="new-password" />
        </label>
        <label className="grid gap-2 text-sm font-medium">Ulangi password
          <input name="password2" type="password" required minLength={8} maxLength={100} className={field} autoComplete="new-password" />
        </label>
        <label className="grid gap-2 text-sm font-medium">Jenis usaha
          <select name="businessType" className={field} defaultValue="photobooth_rental">
            {businessTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">Kota
          <input name="city" maxLength={100} className={field} />
        </label>
      </div>

      {state.error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary py-4 text-base disabled:opacity-60">
        {pending ? <><Spinner />Membuat akun…</> : "Buat Akun & Mulai"}
      </button>
      <p className="text-center text-[12.5px] text-muted">
        Dengan mendaftar Anda menyetujui <Link href="/syarat" className="underline underline-offset-4">Syarat</Link> dan <Link href="/privasi" className="underline underline-offset-4">Kebijakan Privasi</Link>. Sudah punya akun? <Link href="/masuk" className="font-semibold text-accent underline underline-offset-4">Masuk</Link>.
      </p>
    </form>
  );
}
