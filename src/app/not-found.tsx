import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell eyebrow="404" title="Halaman tidak ditemukan." intro="Tautan yang Anda buka tidak ada atau sudah dipindahkan." narrow>
      <Link href="/" className="btn btn-primary px-8 py-4">Kembali ke Beranda</Link>
    </PageShell>
  );
}
