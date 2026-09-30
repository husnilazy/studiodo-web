import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Jadi Kreator Template",
  description: "Rancang frame photobooth, bagikan ke komunitas, dan dapatkan tempat di papan peringkat kreator STUDIODO.",
};

const steps = [
  { t: "Rancang frame", b: "Buat frame PNG transparan sesuai ukuran strip yang didukung STUDIODO." },
  { t: "Unggah dan atur", b: "Beri nama, kategori, dan pilih publik atau privat lewat dashboard kreator." },
  { t: "Dipakai banyak booth", b: "Pemilik booth memilih template Anda; pemakaian tercatat di profil kreator." },
];

export default function KreatorPage() {
  return (
    <PageShell eyebrow="Kreator" title="Rancang frame, dipakai ribuan foto." intro="Program kreator sedang disiapkan. Daftar minat sekarang dan jadi yang pertama tahu saat dibuka.">
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.t} className="glass flex flex-col gap-3 p-8">
            <span className="font-display text-[40px] font-light text-accent">0{i + 1}</span>
            <h2 className="font-display text-xl tracking-tight">{s.t}</h2>
            <p className="text-[15px] leading-relaxed text-muted">{s.b}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Link href="/kontak" className="btn btn-primary px-8 py-4">Daftar Minat Kreator</Link>
      </div>
    </PageShell>
  );
}
