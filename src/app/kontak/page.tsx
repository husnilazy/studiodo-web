import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { getSite, whatsappLink } from "@/lib/content";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi tim STUDIODO untuk konsultasi gratis seputar bisnis photobooth Anda.",
};

export default async function KontakPage() {
  const site = await getSite();
  const wa = whatsappLink(site);
  return (
    <PageShell eyebrow="Kontak" title="Ngobrol dulu, gratis." intro="Ceritakan kebutuhan booth Anda dan kami bantu pilih paket yang pas." narrow>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="glass flex flex-col gap-4 p-8">
          <h2 className="font-display text-xl tracking-tight">WhatsApp</h2>
          <p className="text-[15px] leading-relaxed text-muted">Respons tercepat untuk pertanyaan seputar paket dan pemasangan.</p>
          {wa ? (
            <a href={wa} className="btn btn-primary mt-auto py-3.5 text-center">Chat via WhatsApp</a>
          ) : (
            <p className="mt-auto text-sm text-muted">{site.supportEmail ? `Email: ${site.supportEmail}` : "Kontak WhatsApp segera tersedia."}</p>
          )}
        </div>
        <div className="glass flex flex-col gap-4 p-8">
          <h2 className="font-display text-xl tracking-tight">Ajukan akun</h2>
          <p className="text-[15px] leading-relaxed text-muted">Sudah siap mencoba? Isi form singkat dan mulai trial gratis 7 hari.</p>
          <Link href="/daftar" className="btn mt-auto border border-foreground/20 py-3.5 text-center">Buka Form Daftar</Link>
        </div>
      </div>
    </PageShell>
  );
}
