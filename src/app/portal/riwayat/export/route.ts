import { getSessionHistory } from "@/lib/portal";

export const dynamic = "force-dynamic";

const cell = (v: string | number | null) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

// GET /portal/riwayat/export?status=&from=&to= — CSV of every matching transaction (up to 40 pages × 25 rows).
export async function GET(req: Request) {
  const src = new URL(req.url).searchParams;
  const rows: string[] = ["Waktu,Paket,Metode,Voucher,Status,Nominal"];
  for (let page = 1; page <= 40; page += 1) {
    const q = new URLSearchParams({ page: String(page) });
    for (const k of ["status", "from", "to"]) if (src.get(k)) q.set(k, src.get(k)!);
    const h = await getSessionHistory(q);
    for (const s of h.items) {
      rows.push([new Date(s.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }), s.packageName ?? "", s.paymentMethod, s.voucherCode ?? "", s.paymentStatus, s.totalAmount].map(cell).join(","));
    }
    if (page >= h.totalPages) break;
  }
  return new Response("﻿" + rows.join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="riwayat-transaksi.csv"', "Cache-Control": "no-store" },
  });
}
