import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tips bisnis photobooth, panduan penggunaan STUDIODO, dan catatan rilis.",
};

export default function BlogPage() {
  return (
    <PageShell eyebrow="Blog" title="Tips dan panduan booth." intro="Artikel pertama sedang ditulis. Sementara itu, punya pertanyaan? Tim kami siap membantu.">
      <Link href="/kontak" className="btn glass rounded-full! px-7 py-3.5">Hubungi Kami</Link>
    </PageShell>
  );
}
