"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Spinner } from "@/components/Spinner";
import { updateCreatorProfileAction, type ProfileState } from "@/app/kreator/masuk/actions";
import type { CreatorMe } from "@/lib/creator";

const field = "w-full rounded-2xl border border-transparent bg-[var(--soft)] px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:bg-[var(--card)] focus:ring-2 focus:ring-accent/25";

export function CreatorProfileForm({ me }: { me: CreatorMe }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateCreatorProfileAction, { error: null, ok: false });
  return (
    <form action={action} className={`grid gap-4 ${pending ? "form-busy" : ""}`} aria-busy={pending}>
      <label className="grid gap-2 text-sm font-medium">Nama kredit<input name="name" defaultValue={me.name} required minLength={2} maxLength={100} className={field} /></label>
      <label className="grid gap-2 text-sm font-medium">Bio singkat <span className="font-normal text-muted">(maks. 600 karakter)</span><textarea name="bio" rows={4} maxLength={600} defaultValue={me.bio ?? ""} placeholder="Ceritakan gaya desain dan pengalaman Anda." className={field} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">Instagram<input name="instagramHandle" defaultValue={me.instagramHandle ?? ""} maxLength={40} placeholder="namaakun" className={field} /></label>
        <label className="grid gap-2 text-sm font-medium">WhatsApp <span className="font-normal text-muted">(tidak ditampilkan publik)</span><input name="whatsapp" type="tel" defaultValue={me.whatsapp ?? ""} maxLength={40} className={field} /></label>
      </div>
      <label className="grid gap-2 text-sm font-medium">Situs / portofolio<input name="website" type="url" defaultValue={me.website ?? ""} maxLength={200} placeholder="https://" className={field} /></label>
      {state.error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{state.error}</p>}
      {state.ok && <p role="status" className="rounded-2xl bg-[#dff7ec] px-4 py-3 text-sm text-[#0f6b45]">Profil tersimpan. <Link href={`/kreator/${me.id}`} className="font-semibold underline underline-offset-4">Lihat profil publik</Link></p>}
      <div><button type="submit" disabled={pending} className="btn btn-primary px-7 py-3 disabled:opacity-60">{pending ? <><Spinner />Menyimpan…</> : "Simpan profil"}</button></div>
    </form>
  );
}
