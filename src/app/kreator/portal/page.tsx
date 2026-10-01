import Link from "next/link";
import { API_URL } from "@/lib/api";
import { creatorGet, type CreatorMe, type CreatorTemplate } from "@/lib/creator";
import { createDraftAction } from "@/app/kreator/masuk/actions";

export const dynamic = "force-dynamic";

const STATUS: Record<CreatorTemplate["status"], { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "bg-foreground/[0.06] text-muted" },
  pending: { label: "Sedang ditinjau", tone: "bg-[#fff3d6] text-[#7a5a00]" },
  approved: { label: "Terbit di marketplace", tone: "bg-[#dff7ec] text-[#0f6b45]" },
  rejected: { label: "Perlu diperbaiki", tone: "bg-[#ffe3e3] text-[#a12626]" },
};

export default async function CreatorHome({ searchParams }: PageProps<"/kreator/portal">) {
  const sp = await searchParams;
  const [me, templates] = await Promise.all([creatorGet<CreatorMe>("/me"), creatorGet<CreatorTemplate[]>("/templates")]);
  const list = templates ?? [];
  const published = list.filter((t) => t.status === "approved");
  const installs = published.reduce((n, t) => n + t.installCount, 0);
  const galat = typeof sp.galat === "string" ? (sp.galat === "koneksi" ? "Tidak dapat terhubung ke server. Coba lagi." : sp.galat) : "";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Portal kreator</div>
          <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Halo, {me?.name ?? "Kreator"}</h1>
          <p className="mt-2 text-[15px] text-muted">Unggah frame PNG, tandai posisi foto, kirim untuk ditinjau. Template yang disetujui terbit dengan nama Anda.</p>
        </div>
        <form action={createDraftAction}><button type="submit" className="btn btn-primary px-7 py-3.5">+ Template baru</button></form>
      </div>

      {galat && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{galat}</p>}

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="glass p-7"><div className="text-sm text-muted">Template</div><div className="mt-2 font-display text-4xl tracking-tight">{list.length}</div></div>
        <div className="glass p-7"><div className="text-sm text-muted">Terbit</div><div className="mt-2 font-display text-4xl tracking-tight">{published.length}</div></div>
        <div className="glass p-7"><div className="text-sm text-muted">Dipasang booth</div><div className="mt-2 font-display text-4xl tracking-tight">{installs}</div></div>
      </div>

      {list.length === 0 ? (
        <section className="glass p-10 text-center">
          <h2 className="font-display text-2xl tracking-tight">Belum ada template</h2>
          <p className="mx-auto mt-2 max-w-[420px] text-[15px] text-muted">Mulai dengan satu frame. Baca <Link href="/kreator/portal/panduan" className="font-semibold text-accent underline underline-offset-4">panduan format</Link> dulu agar lolos tinjauan.</p>
        </section>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <li key={t.id} className="glass flex flex-col gap-4 p-6">
              <Link href={`/kreator/portal/template/${t.id}`} className="grid aspect-[3/4] place-items-center overflow-hidden rounded-2xl bg-foreground/[0.05]">
                {t.frameUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={`${API_URL}${t.frameUrl}`} alt={`Frame ${t.name}`} className="h-full w-full object-contain" />
                  : <span className="text-sm text-muted">Belum ada frame</span>}
              </Link>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg tracking-tight">{t.name}</h2>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS[t.status].tone}`}>{STATUS[t.status].label}</span>
              </div>
              {t.status === "rejected" && t.reviewNote && <p className="rounded-xl bg-[#ffe3e3] px-3 py-2 text-[13px] text-[#a12626]">{t.reviewNote}</p>}
              <div className="mt-auto flex items-center justify-between text-[13px] text-muted">
                <span>{t.slots.length} slot foto{t.status === "approved" ? ` · ${t.installCount} pemasangan` : ""}</span>
                <Link href={`/kreator/portal/template/${t.id}`} className="font-semibold text-accent underline underline-offset-4">{t.status === "draft" || t.status === "rejected" ? "Edit" : "Lihat"}</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
