import { Icon } from "../Icon";
import type { TestimonialsData } from "@/lib/content";

const avatars = [
  "from-[#ffd3e4] to-[#c7ceff]",
  "from-[#b8f0e6] to-[#bfd8ff]",
  "from-[#ffe3b8] to-[#ffc8de]",
];

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "S";

export function Testimonials({ data }: { data: TestimonialsData }) {
  if (data.items.length === 0) return null;
  return (
    <section className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-10 px-4 py-16 md:px-16">
      <h2 data-reveal="up" className="text-center font-display text-4xl font-normal tracking-[-0.035em] md:text-[44px]">{data.title}</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {data.items.map((t, i) => (
          <figure key={i} data-reveal="up" data-delay={String(i * 120)} className="glass lift flex flex-col gap-5 p-8">
            <div className="flex items-center justify-between">
              <Icon name="quote" className="h-8 w-8 text-accent/60" />
              <div className="flex gap-0.5 text-[#f5b73a]" aria-label="5 dari 5 bintang">
                {[0, 1, 2, 3, 4].map((s) => <Icon key={s} name="star" className="h-4 w-4 fill-current" />)}
              </div>
            </div>
            <blockquote className="text-base leading-[1.7]">{t.quote}</blockquote>
            <figcaption className="mt-auto flex items-center gap-3">
              <div className={`flex h-[42px] w-[42px] items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-[#0b1020] ${avatars[i % avatars.length]}`}>{initials(t.name)}</div>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-[13px] text-muted">{[t.business, t.city].filter(Boolean).join(" · ")}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
