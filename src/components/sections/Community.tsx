import { SectionHeading } from "../SectionHeading";
import type { CommunityData } from "@/lib/content";

const tints = ["from-[#ffd3e4] to-[#fff0f6]", "from-[#b8f0e6] to-[#eafbf8]", "from-[#c7ceff] to-[#edefff]"];
const avatars = [
  "from-[#ffd3e4] to-[#c7ceff]",
  "from-[#b8f0e6] to-[#bfd8ff]",
  "from-[#ffe3b8] to-[#ffc8de]",
  "from-[#d5ccff] to-[#bfc6ff]",
];

export function Community({ data }: { data: CommunityData }) {
  return (
    <section id="komunitas" className="relative z-10 mx-auto grid w-full max-w-[1312px] items-start gap-12 px-4 py-20 md:px-16 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-6">
        <SectionHeading align="left" eyebrow={data.eyebrow} title={data.title} />
        <p className="text-[17px] leading-[1.7] text-muted">{data.body}</p>
        <ul className="flex flex-col gap-3">
          {data.perks.map((p, i) => (
            <li key={`${p.title}-${i}`} className="glass flex items-center gap-4 rounded-[20px]! px-5 py-4">
              <div className={`h-[42px] w-[42px] shrink-0 rounded-[13px] bg-gradient-to-br ${tints[i % tints.length]}`} />
              <div>
                <div className="text-[15px] font-semibold">{p.title}</div>
                <div className="text-[13px] text-muted">{p.body}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="glass flex flex-col gap-1.5 p-8">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="font-display text-2xl tracking-tight">Kreator teratas</h3>
          <span className="text-[13px] text-muted">Bulan ini</span>
        </div>
        {avatars.map((a, i) => (
          <div key={i} className={`flex items-center gap-4 py-3.5 ${i < 3 ? "border-b border-foreground/[0.07]" : ""}`}>
            <span className={`w-[30px] font-display text-[22px] ${i === 0 ? "text-accent" : "text-[#9aa1b2]"}`}>{i + 1}</span>
            <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${a}`} />
            <div className="flex-1">
              <div className="font-semibold">[Nama Kreator]</div>
              <div className="text-[13px] text-muted">[N] template</div>
            </div>
            <span className="text-sm text-muted">[N] pakai</span>
          </div>
        ))}
      </div>
    </section>
  );
}
