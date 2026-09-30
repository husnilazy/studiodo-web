"use client";

import { useActionState } from "react";
import { installTemplateAction, type InstallState } from "@/app/portal/template/actions";

export function InstallButton({ id, installed }: { id: string; installed: boolean }) {
  const [state, action, pending] = useActionState<InstallState, FormData>(installTemplateAction, { error: null, ok: false });
  if (installed || state.ok) {
    return <span className="block rounded-full bg-[#dff7ec] px-4 py-3 text-center text-sm font-semibold text-[#0f6b45]">Sudah terpasang</span>;
  }
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="btn btn-primary px-4 py-3 text-center text-sm disabled:opacity-60">{pending ? "Memasang…" : "Pakai template"}</button>
      {state.error && <p role="alert" className="text-[13px] text-[#a12626]">{state.error}</p>}
    </form>
  );
}
