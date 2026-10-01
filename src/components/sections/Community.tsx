import Link from "next/link";
import { SectionHeading } from "../SectionHeading";
import { IconTile } from "../Icon";
import { fetchDirectory } from "@/lib/directory";
import type { CommunityData } from "@/lib/content";

const tints = ["from-[#ffd3e4] to-[#fff0f6]", "from-[#b8f0e6] to-[#eafbf8]", "from-[#c7ceff] to-[#edefff]"];

export async function Community({ data }: { data: CommunityData }) {
  const dir = await fetchDirectory();
  const listed = dir?.items.length ?? 0;
  const cities = dir?.cities.length ?? 0;

  return (
    <section id="komunitas" className="relative z-10 mx-auto grid w-full max-w-[1312px] items-start gap-12 px-4 py-20 md:px-16 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-6">
        <SectionHeading align="left" eyebrow={data.eyebrow} title={data.title} />
        <p className="text-[17px] leading-[1.7] text-muted">{data.body}</p>
        <ul className="flex flex-col gap-3">
          {data.perks.map((p, i) => (
            <li key={`${p.title}-${i}`} className="glass flex items-center gap-4 rounded-[20px]! px-5 py-4">
              <IconTile size="md" name={p.icon || ["map-pin", "palette", "sparkles"][i % 3]} tint={tints[i % tints.length]} />
              <div>
                <div className="text-[15px] font-semibold">{p.title}</div>
                <div className="text-[13px] text-muted">{p.body}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Real, live community entry points — no invented leaderboard numbers. */}
      <div className="flex flex-col gap-6">
        <div className="glass-dark flex flex-col gap-4 p-9">
          <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#c6cce0]">Direktori booth</div>
          <h3 className="font-display text-3xl tracking-tight text-white">Cari photobooth di kotamu</h3>
          <p className="text-[15px] leading-relaxed text-[#c6cce0]">
            {listed > 0
              ? `${listed} booth di ${cities} kota sudah terdaftar dan siap dihubungi untuk acara Anda.`
              : "Pemilik booth bisa menampilkan booth-nya di sini agar mudah ditemukan calon pelanggan."}
          </p>
          <Link href="/booth" className="btn mt-2 self-start bg-white px-6 py-3 text-foreground">Lihat direktori</Link>
        </div>
        <div className="glass flex flex-col gap-4 p-9">
          <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">Kreator</div>
          <h3 className="font-display text-3xl tracking-tight">Rancang frame untuk booth lain</h3>
          <p className="text-[15px] leading-relaxed text-muted">Desainer bisa mengirim portofolio dan menayangkan template di marketplace dengan kredit nama sendiri.</p>
          <Link href="/kreator" className="btn btn-primary mt-2 self-start px-6 py-3">Jadi kreator</Link>
        </div>
      </div>
    </section>
  );
}
