export function SectionHeading({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  align?: "center" | "left";
}) {
  return (
    <div data-reveal="up" className={`flex flex-col gap-4 ${align === "center" ? "items-center text-center" : "items-start"}`}>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="max-w-[760px] font-display text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-[52px]">
        {title}
      </h2>
    </div>
  );
}
