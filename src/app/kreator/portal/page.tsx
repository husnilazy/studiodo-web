import Link from "next/link";
import { Icon } from "@/components/Icon";
import { CreatorTemplateList } from "@/components/CreatorTemplateList";
import { PageHeader } from "@/components/dash/PageHeader";
import { CountUp } from "@/components/dash/CountUp";
import { API_URL } from "@/lib/api";
import { creatorGet, type CreatorMe, type CreatorTemplate } from "@/lib/creator";
import { createDraftAction } from "@/app/kreator/masuk/actions";

export const dynamic = "force-dynamic";

export default async function CreatorHome({ searchParams }: PageProps<"/kreator/portal">) {
  const sp = await searchParams;
  const [me, templates] = await Promise.all([creatorGet<CreatorMe>("/me"), creatorGet<CreatorTemplate[]>("/templates")]);
  const list = templates ?? [];
  const published = list.filter((t) => t.status === "approved");
  const reviewing = list.filter((t) => t.status === "pending").length;
  const needsFix = list.filter((t) => t.status === "rejected");
  const installs = published.reduce((n, t) => n + t.installCount, 0);
  const top = [...published].sort((a, b) => b.installCount - a.installCount)[0];
  const galat = typeof sp.galat === "string" ? (sp.galat === "koneksi" ? "Tidak dapat terhubung ke server. Coba lagi." : sp.galat) : "";
  const profileDone = Boolean(me?.bio && (me.instagramHandle || me.website));

  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader
        eyebrow="Portal kreator"
        title={`Halo, ${me?.name ?? "Kreator"}`}
        intro="Unggah frame PNG, tandai posisi foto, kirim untuk ditinjau. Template yang disetujui terbit dengan nama Anda."
        actions={<>
          {me?.id && <Link href={`/kreator/${me.id}`} className="btn inline-flex items-center gap-2 px-5 py-2.5 text-[13.5px]"><Icon name="external" className="h-4 w-4" />Profil publik</Link>}
          <form action={createDraftAction}><button type="submit" className="btn btn-primary px-6 py-3 text-[14px]">+ Template baru</button></form>
        </>}
      />

      {galat && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{galat}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-5">
        <div className="glass-dark dash-card-hover rounded-[26px] p-6"><div className="text-[13px] text-white/65">Dipasang booth</div><div className="mt-2 font-display text-[32px] leading-tight tracking-tight"><CountUp value={installs} /></div><div className="mt-2 text-[12px] text-white/55">{top ? `Terlaris: ${top.name}` : "Belum ada pemasangan"}</div></div>
        <div className="glass dash-card-hover p-6"><div className="text-[13px] text-muted">Template terbit</div><div className="mt-2 font-display text-[32px] leading-tight tracking-tight"><CountUp value={published.length} /></div><div className="mt-2 text-[12px] text-muted">dari {list.length} template</div></div>
        <div className="glass dash-card-hover p-6"><div className="text-[13px] text-muted">Sedang ditinjau</div><div className="mt-2 font-display text-[32px] leading-tight tracking-tight"><CountUp value={reviewing} /></div><div className="mt-2 text-[12px] text-muted">biasanya 1–3 hari kerja</div></div>
        <div className="glass dash-card-hover p-6"><div className="text-[13px] text-muted">Perlu diperbaiki</div><div className={`mt-2 font-display text-[32px] leading-tight tracking-tight ${needsFix.length ? "text-[#c23a3a]" : ""}`}><CountUp value={needsFix.length} /></div><div className="mt-2 text-[12px] text-muted">{needsFix.length ? "Lihat catatan peninjau" : "Semua aman"}</div></div>
      </div>

      {!profileDone && (
        <Link href="/kreator/portal/akun" className="glass dash-card-hover flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div><div className="text-[14.5px] font-semibold">Lengkapi profil publik Anda</div><div className="text-[13px] text-muted">Tambahkan bio dan tautan Instagram/situs agar tenant percaya pada karya Anda.</div></div>
          <span className="text-[13px] font-semibold text-accent">Lengkapi →</span>
        </Link>
      )}

      {list.length === 0 ? (
        <section className="glass p-10 text-center">
          <h2 className="font-display text-2xl tracking-tight">Belum ada template</h2>
          <p className="mx-auto mt-2 max-w-[420px] text-[15px] text-muted">Mulai dengan satu frame. Baca <Link href="/kreator/portal/panduan" className="font-semibold text-accent underline underline-offset-4">panduan format</Link> lebih dulu, lalu tekan &ldquo;Template baru&rdquo;.</p>
        </section>
      ) : (
        <CreatorTemplateList templates={list} apiUrl={API_URL} />
      )}
    </div>
  );
}
