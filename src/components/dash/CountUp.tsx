"use client";

import { useEffect, useState } from "react";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

/** Number that counts up from 0 on first paint (and snaps to the final value for reduced motion). `format="rupiah"` for money. */
export function CountUp({ value, format = "number", duration = 900 }: { value: number; format?: "number" | "rupiah"; duration?: number }) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (value === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start the animation from zero after hydration
    setShown(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className="tabular-nums">{format === "rupiah" ? rupiah.format(shown) : shown.toLocaleString("id-ID")}</span>;
}
