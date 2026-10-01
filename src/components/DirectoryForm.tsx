"use client";

import { useActionState } from "react";
import { saveDirectoryAction, type DirectoryState } from "@/app/portal/direktori/actions";

const field =
  "w-full rounded-2xl border border-foreground/10 bg-white/70 px-4 py-3.5 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25";

export type DirectoryProfile = {
  name: string;
  city: string | null;
  instagram: string | null;
  website: string | null;
  whatsapp: string | null;
  listed: boolean;
  description: string;
  showWhatsapp: boolean;
};

export function DirectoryForm({ profile }: { profile: DirectoryProfile }) {
  const [state, action, pending] = useActionState<DirectoryState, FormData>(saveDirectoryAction, { error: null, ok: false });
  return (
    <form action={action} className="grid max-w-[640px] gap-5">
      <label className="glass flex items-start gap-4 rounded-[20px]! p-5">
        <input type="checkbox" name="listed" defaultChecked={profile.listed} className="mt-1 h-5 w-5 accent-[var(--accent)]" />
        <span>
          <span className="block font-semibold">Tampilkan booth saya di direktori publik</span>
          <span className="block text-[13px] leading-relaxed text-muted">Calon pelanggan dapat menemukan booth Anda di halaman &ldquo;Cari photobooth&rdquo;. Anda bisa menyembunyikannya kapan saja.</span>
        </span>
      </label>
      <label className="grid gap-2 text-sm font-medium">Kota <span className="font-normal text-muted">(wajib agar bisa dicari)</span>
        <input name="city" maxLength={100} defaultValue={profile.city ?? ""} className={field} placeholder="mis. Bandung" />
      </label>
      <label className="grid gap-2 text-sm font-medium">Deskripsi singkat <span className="font-normal text-muted">(maks. 300 karakter)</span>
        <textarea name="description" rows={3} maxLength={300} defaultValue={profile.description} className={field} placeholder="mis. Photobooth untuk wedding & ulang tahun, area Bandung Raya" />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">Instagram <span className="font-normal text-muted">(tanpa @)</span>
          <input name="instagram" maxLength={60} defaultValue={profile.instagram ?? ""} className={field} />
        </label>
        <label className="grid gap-2 text-sm font-medium">Website
          <input name="website" maxLength={200} defaultValue={profile.website ?? ""} className={field} placeholder="https://" />
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="showWhatsapp" defaultChecked={profile.showWhatsapp} disabled={!profile.whatsapp} className="mt-0.5 h-5 w-5 accent-[var(--accent)]" />
        <span>
          Tampilkan tombol WhatsApp{profile.whatsapp ? ` (${profile.whatsapp})` : ""}
          <span className="block text-[13px] text-muted">{profile.whatsapp ? "Nomor ini akan terlihat publik. Biarkan tidak dicentang bila tidak ingin dihubungi langsung." : "Nomor WhatsApp belum ada di profil akun Anda. Hubungi tim STUDIODO untuk menambahkannya."}</span>
        </span>
      </label>
      {state.error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{state.error}</p>}
      {state.ok && <p role="status" className="rounded-2xl bg-[#dff7ec] px-4 py-3 text-sm text-[#0f6b45]">Tersimpan. Perubahan tampil di direktori dalam beberapa menit.</p>}
      <button type="submit" disabled={pending} className="btn btn-primary py-4 text-base disabled:opacity-60">{pending ? "Menyimpan…" : "Simpan"}</button>
    </form>
  );
}
