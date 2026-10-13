import type { ReactNode } from "react";

/** Title block shared by every dashboard page: small label, title, optional blurb and a right-hand action slot. */
export function PageHeader({ eyebrow, title, intro, actions }: { eyebrow?: string; title: string; intro?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="mt-1.5 font-display text-[28px] font-medium leading-tight tracking-[-0.03em] md:text-[32px]">{title}</h1>
        {intro && <p className="mt-1.5 max-w-[720px] text-[14.5px] leading-relaxed text-muted">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
