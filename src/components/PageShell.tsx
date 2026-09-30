import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
  narrow = false,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="blob left-[55%] -top-20 h-[560px] w-[560px] bg-[#bfc6ff] opacity-75" />
      <div className="blob -left-32 top-[500px] h-[460px] w-[460px] bg-[#ffc8de] opacity-60" />
      <Navbar />
      <main id="konten" className={`relative z-10 mx-auto w-full flex-1 px-4 pb-10 pt-14 md:px-16 md:pt-20 ${narrow ? "max-w-[820px]" : "max-w-[1312px]"}`}>
        <div className="mb-10 flex max-w-[720px] flex-col gap-4">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">{title}</h1>
          {intro && <p className="text-[17px] leading-relaxed text-muted">{intro}</p>}
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
}
