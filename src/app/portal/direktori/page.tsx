import Link from "next/link";
import { DirectoryForm, type DirectoryProfile } from "@/components/DirectoryForm";
import { portalGet } from "@/lib/portal";

export const dynamic = "force-dynamic";

export default async function DirektoriPage() {
  const profile = await portalGet<DirectoryProfile>("/directory");
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Komunitas</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Direktori booth</h1>
        <p className="mt-2 max-w-[560px] text-[15px] text-muted">
          Tampilkan <strong className="text-foreground">{profile.name}</strong> agar mudah ditemukan calon pelanggan. Hanya data di bawah ini yang tampil publik — tidak ada data lain.
          {" "}<Link href="/booth" className="font-semibold text-accent underline underline-offset-4">Lihat halaman publik</Link>
        </p>
      </div>
      <section className="glass p-8"><DirectoryForm profile={profile} /></section>
    </div>
  );
}
