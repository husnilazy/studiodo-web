import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { CreatorForm } from "@/components/CreatorForm";

export const metadata: Metadata = {
  title: "Jadi Kreator Template",
  description: "Rancang frame photobooth, tampil di marketplace STUDIODO, dan dipakai ratusan booth.",
};

const steps = [
  { t: "Kirim portofolio", b: "Isi form di bawah dengan tautan karya Anda (Behance, Instagram, Drive, atau lainnya)." },
  { t: "Dapat akun kreator", b: "Jika karya Anda cocok, tim STUDIODO membuatkan akun untuk masuk ke portal kreator." },
  { t: "Unggah & terbit", b: "Unggah frame PNG, tandai slot foto, kirim untuk ditinjau. Setelah disetujui, frame terbit dengan nama Anda dan dipakai pemilik booth lewat satu klik." },
];

export default function KreatorPage() {
  return (
    <PageShell eyebrow="Kreator" title="Rancang frame, dipakai banyak booth." intro="Kami sedang mengundang desainer untuk mengisi marketplace template. Kirim portofolio Anda dan kami kabari.">
      <div className="mb-12 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.t} className="glass flex flex-col gap-3 p-8">
            <span className="font-display text-[40px] font-light text-accent">0{i + 1}</span>
            <h2 className="font-display text-xl tracking-tight">{s.t}</h2>
            <p className="text-[15px] leading-relaxed text-muted">{s.b}</p>
          </div>
        ))}
      </div>
      <div className="max-w-[720px]">
        <h2 className="mb-5 font-display text-2xl tracking-tight">Daftar sebagai kreator</h2>
        <CreatorForm />
        <p className="mt-6 text-sm text-muted">
          Sudah punya akun? <Link href="/kreator/masuk" className="font-semibold text-accent underline underline-offset-4">Masuk ke portal kreator</Link>.<br />
          Ingin melihat hasil karya kreator lain dulu? <Link href="/template" className="font-semibold text-accent underline underline-offset-4">Jelajahi katalog template</Link>.
        </p>
      </div>
    </PageShell>
  );
}
