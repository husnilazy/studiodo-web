"use server";

import { revalidatePath } from "next/cache";
import { portalCall } from "@/lib/portal";
import type { ActionResult, CrmCustomer, CrmList, CrmQuery, CrmSession, LiveData } from "@/lib/portalTypes";

const FILTERS = new Set(["all", "returning", "new", "consent", "optout"]);
const SORTS = new Set(["recent", "visits", "spend", "name"]);
const KEY = /^(wa:\d{9,15}|em:[^\s@]+@[^\s@]+\.[^\s@]+)$/;

function qs(params: CrmQuery) {
  const out = new URLSearchParams();
  if (params.q) out.set("q", String(params.q).slice(0, 80));
  if (params.filter && FILTERS.has(params.filter)) out.set("filter", params.filter);
  if (params.sort && SORTS.has(params.sort)) out.set("sort", params.sort);
  if (params.tag) out.set("tag", String(params.tag).slice(0, 24));
  if (params.limit) out.set("limit", String(Math.max(1, Math.min(100, Math.floor(params.limit)))));
  if (params.offset) out.set("offset", String(Math.max(0, Math.floor(params.offset))));
  return out.toString();
}

export async function loadCustomersAction(params: CrmQuery): Promise<ActionResult<CrmList>> {
  const r = await portalCall<CrmList>("GET", `/api/crm/customers?${qs(params)}`);
  return r.ok ? { ok: true, data: r.data } : { ok: false, error: r.error };
}

export async function loadCustomerAction(key: string): Promise<ActionResult<{ customer: CrmCustomer; sessions: CrmSession[] }>> {
  if (!KEY.test(key)) return { ok: false, error: "Pelanggan tidak valid." };
  const r = await portalCall<{ customer: CrmCustomer; sessions: CrmSession[] }>("GET", `/api/crm/customer?key=${encodeURIComponent(key)}`);
  return r.ok ? { ok: true, data: r.data } : { ok: false, error: r.error };
}

export async function saveCustomerAction(input: { key: string; name: string; notes: string; tags: string[]; marketingOptOut: boolean }): Promise<ActionResult> {
  if (!KEY.test(input.key)) return { ok: false, error: "Pelanggan tidak valid." };
  const r = await portalCall("PUT", "/api/crm/customer", {
    key: input.key, name: String(input.name ?? "").slice(0, 100), notes: String(input.notes ?? "").slice(0, 2000),
    tags: (Array.isArray(input.tags) ? input.tags : []).slice(0, 10).map((t) => String(t).slice(0, 24)), marketingOptOut: input.marketingOptOut === true,
  });
  if (!r.ok) return { ok: false, error: r.error };
  revalidatePath("/portal/pelanggan");
  return { ok: true, data: undefined };
}

export async function exportCustomersAction(params: CrmQuery): Promise<ActionResult<CrmCustomer[]>> {
  const r = await portalCall<{ items: CrmCustomer[] }>("GET", `/api/crm/export?${qs({ ...params, limit: undefined, offset: undefined })}`);
  return r.ok ? { ok: true, data: r.data.items } : { ok: false, error: r.error };
}

export async function loadLiveAction(): Promise<ActionResult<LiveData>> {
  const r = await portalCall<LiveData>("GET", "/api/live");
  return r.ok ? { ok: true, data: r.data } : { ok: false, error: r.error };
}
