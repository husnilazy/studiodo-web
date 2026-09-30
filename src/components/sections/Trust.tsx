import type { TrustData } from "@/lib/content";

export function Trust({ data }: { data: TrustData }) {
  if (data.logos.length === 0) return null;
  return (
    <section aria-label="Dipercaya pemilik booth" className="relative z-10 mx-auto flex w-full max-w-[1312px] flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row md:px-16">
      <p className="max-w-[220px] text-center text-sm leading-relaxed text-muted md:text-left">{data.caption}</p>
      <ul className="flex flex-wrap justify-center gap-x-12 gap-y-3 font-display text-[19px] text-[#9aa1b2]">
        {data.logos.map((l, i) => (
          <li key={`${l.name}-${i}`}>{l.name}</li>
        ))}
      </ul>
    </section>
  );
}
