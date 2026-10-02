"use client";

import { useActionState } from "react";
import { checkoutAction, type CheckoutState } from "@/app/portal/tagihan/actions";

export function CheckoutButton({ planSlug, interval = "monthly", label, featured }: { planSlug: string; interval?: "monthly" | "yearly"; label: string; featured: boolean }) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(checkoutAction, { error: null });
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="planSlug" value={planSlug} />
      <input type="hidden" name="interval" value={interval} />
      <button
        type="submit"
        disabled={pending}
        className={`btn py-[15px] text-center disabled:opacity-60 ${featured ? "bg-white text-[#0b1020]" : "btn-primary"}`}
      >
        {pending ? "Mengalihkan…" : label}
      </button>
      {state.error && <p role="alert" className="text-sm text-[#a12626]">{state.error}</p>}
    </form>
  );
}
