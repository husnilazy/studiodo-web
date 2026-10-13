"use server";

import { portalCall } from "@/lib/portal";
import type { ActionResult } from "@/lib/portalTypes";

// One narrow server action for the whole POS UI (terminal, queue board, shifts, settings). The browser never sees the
// session token; this only forwards to /api/pos/* so it can't be pointed at any other API route.
const PATH = /^\/api\/pos\/[a-z0-9/_-]+(\?[a-z0-9=&_-]*)?$/i;
const METHODS = new Set(["GET", "POST", "PATCH", "PUT", "DELETE"]);

export async function posAction<T = unknown>(method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE", path: string, body?: unknown): Promise<ActionResult<T>> {
  if (!METHODS.has(method) || !PATH.test(path) || path.includes("..")) return { ok: false, error: "Permintaan tidak valid." };
  const result = await portalCall<T>(method, path, body);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: result.data };
}
