import { SectionHeading } from "../SectionHeading";
import { IconTile } from "../Icon";
import { Orb } from "../Decor";
import type { HowData } from "@/lib/content";

const FALLBACK_ICONS = ["user-plus", "download", "sliders", "rocket", "sparkles", "chart"];
const tints = ["from-[#c7ceff] to-[#edefff]", "from-[#ffd3e4] to-[#fff0f6]", "from-[#b8f0e6] to-[#eafbf8]", "from-[#ffe3b8] to-[#fff6e6]"];

export function HowItWorks({ data }: { data: HowData }) {
  return (
    <section id="cara-kerja" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-12 px-4 py-16 md:px-16">
      <Orb className="right-4 top-0 h-40 w-40 md:right-24" speed={0.14} />
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      <div className="relative">
        {/* connector drawn behind the cards on wide screens */}
        <svg aria-hidden="true" data-reveal="up" className="pointer-events-none absolute left-[8%] right-[8%] top-[58px] hidden h-3 w-[84%] lg:block" viewBox="0 0 100 2" preserveAspectRatio="none">
          <line className="step-line text-accent" x1="0" y1="1" x2="100" y2="1" pathLength="100" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="100" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.steps.map((s, i) => (
            <li key={`${s.title}-${i}`} data-reveal="up" data-delay={String(i * 120)} className="glass lift flex min-h-[240px] flex-col gap-4 p-7 sm:p-8">
              <div className="flex items-center justify-between">
                <IconTile name={s.icon || FALLBACK_ICONS[i % FALLBACK_ICONS.length]} tint={tints[i % tints.length]} />
                <span className="font-display text-[44px] font-light leading-none text-accent/70">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="font-display text-[22px] tracking-tight">{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
