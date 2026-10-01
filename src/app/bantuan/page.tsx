import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { BlogCard } from "@/components/BlogCard";
import { fetchBlogPosts } from "@/lib/blog";
import { getSite, whatsappLink } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pusat Bantuan",
  description: "Panduan langkah demi langkah memakai aplikasi STUDIODO: dari memasang kiosk sampai mengatur pembayaran, voucher, dan cetak.",
};

export default async function BantuanPage() {
  const [guides, site] = await Promise.all([fetchBlogPosts({ category: "Panduan", guideOrder: true }), getSite()]);
  const wa = whatsappLink(site, "Halo STUDIODO, saya butuh bantuan memakai aplikasi.");

  return (
    <PageShell eyebrow="Pusat bantuan" title="Panduan memakai STUDIODO." intro="Ikuti urutan dari atas untuk memasang booth pertama Anda, atau langsung loncat ke topik yang dibutuhkan.">
      {guides === null ? (
        <p className="text-[15px] text-muted">Panduan belum dapat dimuat. Coba muat ulang halaman beberapa saat lagi.</p>
      ) : guides.length === 0 ? (
        <p className="text-[15px] text-muted">Panduan sedang disiapkan.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((g, i) => <BlogCard key={g.slug} post={g} numbered={i + 1} />)}
        </div>
      )}

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        <div className="glass flex flex-col gap-3 p-8">
          <h2 className="font-display text-xl tracking-tight">Pertanyaan umum</h2>
          <p className="text-[15px] leading-relaxed text-muted">Perangkat, internet, pembayaran, dan berhenti berlangganan.</p>
          <Link href="/#faq" className="btn glass mt-auto self-start rounded-full! px-5 py-2.5 text-sm">Lihat FAQ</Link>
        </div>
        <div className="glass flex flex-col gap-3 p-8">
          <h2 className="font-display text-xl tracking-tight">Tips bisnis</h2>
          <p className="text-[15px] leading-relaxed text-muted">Cara menaikkan pendapatan dan menyiapkan booth untuk event.</p>
          <Link href="/blog?kategori=Tips%20Bisnis" className="btn glass mt-auto self-start rounded-full! px-5 py-2.5 text-sm">Baca tips</Link>
        </div>
        <div className="glass-dark flex flex-col gap-3 p-8">
          <h2 className="font-display text-xl tracking-tight text-white">Masih butuh bantuan?</h2>
          <p className="text-[15px] leading-relaxed text-[#c6cce0]">Tim kami siap membantu pemasangan dan pengaturan.</p>
          <Link href={wa ?? "/kontak"} className="btn mt-auto self-start bg-white px-5 py-2.5 text-sm text-foreground">{wa ? "Chat WhatsApp" : "Hubungi kami"}</Link>
        </div>
      </div>
    </PageShell>
  );
}
