import type { TestimonialsData } from "@/lib/content";

const avatars = [
  "from-[#ffd3e4] to-[#c7ceff]",
  "from-[#b8f0e6] to-[#bfd8ff]",
  "from-[#ffe3b8] to-[#ffc8de]",
];

export function Testimonials({ data }: { data: TestimonialsData }) {
  if (data.items.length === 0) return null;
  return (
    <section className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col gap-10 px-4 py-16 md:px-16">
      <h2 className="text-center font-display text-4xl font-normal tracking-[-0.035em] md:text-[44px]">{data.title}</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {data.items.map((t, i) => (
          <figure key={i} className="glass flex flex-col gap-6 p-8">
            <blockquote className="text-base leading-[1.7]">&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption className="flex items-center gap-3">
              <div className={`h-[42px] w-[42px] rounded-full bg-gradient-to-br ${avatars[i % avatars.length]}`} />
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
