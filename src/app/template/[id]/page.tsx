import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icon";
import { PageShell } from "@/components/PageShell";
import { TemplateCard } from "@/components/TemplateCard";
import { TemplateFeedback, Stars, type FeedbackState } from "@/components/TemplateFeedback";
import { API_URL } from "@/lib/api";
import { fetchMarketItem, isNew } from "@/lib/marketplace";
import { getToken } from "@/lib/portal";

/** What the signed-in tenant (if any) may do here. A bad/expired session simply counts as a guest — this page is public. */
async function feedbackState(id: string): Promise<FeedbackState> {
  const token = await getToken();
  if (!token) return { kind: "guest" };
  try {
    const res = await fetch(`${API_URL}/api/portal/marketplace/${id}/feedback`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { kind: "guest" };
    const d = (await res.json()) as { installed: boolean; myReview: { rating: number; comment: string } | null; reportOpen: boolean };
    return { kind: "tenant", installed: d.installed, myReview: d.myReview, reportOpen: d.reportOpen };
  } catch {
    return { kind: "guest" };
  }
}

const CATEGORY: Record<string, string> = { minimal: "Minimal", wedding: "Wedding", birthday: "Birthday", corporate: "Corporate", seasonal: "Seasonal", custom: "Custom" };
const PRESET: Record<string, string> = { "4r": "4R (10,2 × 15,2 cm)", "2r": "2R (6 × 9 cm)", a4: "A4", square: "Persegi", custom: "Kustom" };

export async function generateMetadata({ params }: PageProps<"/template/[id]">): Promise<Metadata> {
  const { id } = await params;
  const d = await fetchMarketItem(id);
  return d ? { title: `${d.item.name} — Template Frame`, description: d.item.description || `Frame photobooth ${d.item.name} untuk STUDIODO.` } : { title: "Template tidak ditemukan" };
}

export default async function TemplateDetailPage({ params }: PageProps<"/template/[id]">) {
  const { id } = await params;
  const d = await fetchMarketItem(id);
  if (!d) notFound();
  const { item, creator, related, reviews = [], reportReasons = [] } = d;
  const feedback = await feedbackState(item.id);

  const facts: [string, string][] = [
    ["Kategori", CATEGORY[item.category] ?? item.category],
    ["Orientasi", item.orientation === "landscape" ? "Lanskap" : "Potret"],
    ["Slot foto", `${item.slotCount} foto`],
    ["Ukuran cetak", PRESET[item.outputPreset ?? ""] ?? "Sesuai frame"],
    ["Resolusi", `${item.canvasWidth} × ${item.canvasHeight} px`],
    ["Dipasang", `${item.installCount} booth`],
  ];

  return (
    <PageShell eyebrow="Marketplace template" title={item.name} intro={item.description || undefined}>
      <Link href="/template" className="mb-6 -mt-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"><Icon name="chevron-left" className="h-4 w-4" />Semua template</Link>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div data-reveal="scale" className="glass relative flex items-center justify-center rounded-3xl! bg-gradient-to-b from-[#ffd3e4] to-[#c7ceff] p-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote frame art of arbitrary size */}
          <img src={item.imageUrl} alt={`Frame ${item.name}`} className="max-h-[560px] w-auto max-w-full object-contain drop-shadow-[0_14px_28px_rgba(60,70,140,0.3)]" />
          <div className="absolute left-4 top-4 flex gap-1.5">
            {item.featured && <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold text-on-foreground">Unggulan</span>}
            {isNew(item) && <span className="rounded-full bg-[#1fb26b] px-3 py-1 text-[11px] font-semibold text-white">Baru</span>}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass p-7">
            <h2 className="font-display text-xl tracking-tight">Detail frame</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {facts.map(([k, v]) => <div key={k}><dt className="text-[12px] uppercase tracking-wider text-muted">{k}</dt><dd className="mt-1 text-[15px] font-semibold">{v}</dd></div>)}
            </dl>
          </div>

          <div className="glass flex flex-wrap items-center justify-between gap-4 p-7">
            <div>
              <div className="text-[12px] uppercase tracking-wider text-muted">Kreator</div>
              {creator
                ? <Link href={`/kreator/${creator.id}`} className="mt-1 block text-[17px] font-semibold hover:text-accent">{creator.name}{creator.instagramHandle ? <span className="ml-2 text-sm font-normal text-muted">@{creator.instagramHandle}</span> : null}</Link>
                : <div className="mt-1 text-[17px] font-semibold">{item.creatorName ?? "STUDIODO"}</div>}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/portal/template?pilih=${item.id}`} className="btn btn-primary px-7 py-3.5">Pakai template ini</Link>
              <Link href="/daftar" className="btn glass rounded-full! px-6 py-3.5 text-muted">Belum punya akun?</Link>
            </div>
          </div>

          <div className="glass p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl tracking-tight">Ulasan</h2>
              {item.ratingCount ? <div className="flex items-center gap-2.5"><Stars value={Math.round(item.ratingAverage ?? 0)} size="text-xl" /><span className="text-[15px] font-semibold">{item.ratingAverage?.toFixed(1)}</span><span className="text-[13px] text-muted">({item.ratingCount} ulasan)</span></div> : <span className="text-[13px] text-muted">Belum ada ulasan</span>}
            </div>
            {reviews.length > 0 && (
              <ul className="mt-4 divide-y divide-foreground/10">
                {reviews.map((r) => (
                  <li key={r.id} className="py-3.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1"><Stars value={r.rating} size="text-sm" /><span className="text-[14px] font-semibold">{r.tenantName}</span><span className="text-[12px] text-muted">{new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span></div>
                    {r.comment && <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <TemplateFeedback templateId={item.id} state={feedback} reasons={reportReasons} />

          <p className="text-[13px] leading-relaxed text-muted">Setelah dipasang, frame muncul di layar &ldquo;Pilih Frame&rdquo; semua booth Anda dan bisa disembunyikan atau diatur kapan saja dari dashboard.</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 font-display text-2xl tracking-tight">Template serupa</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((r, i) => <TemplateCard key={r.id} item={r} index={i} href={`/template/${r.id}`} />)}
          </div>
        </section>
      )}
    </PageShell>
  );
}
