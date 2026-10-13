import Link from "next/link";
import { PageHeader } from "@/components/dash/PageHeader";
import { DirectoryForm, type DirectoryProfile } from "@/components/DirectoryForm";
import { portalGet } from "@/lib/portal";

export const dynamic = "force-dynamic";

export default async function DirektoriPage() {
  const profile = await portalGet<DirectoryProfile>("/directory");
  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader eyebrow="Komunitas" title="Direktori booth" intro={<>Tampilkan <strong className="text-foreground">{profile.name}</strong> agar mudah ditemukan calon pelanggan. Hanya data di bawah ini yang tampil publik — tidak ada data lain.
          {" "}<Link href="/booth" className="font-semibold text-accent underline underline-offset-4">Lihat halaman publik</Link></>} />
      <section className="glass p-8"><DirectoryForm profile={profile} /></section>
    </div>
  );
}
