import { ShiftPanel } from "@/components/pos/ShiftPanel";
import { portalFetch } from "@/lib/portal";
import type { PosShift } from "@/lib/posTypes";

export const dynamic = "force-dynamic";

export default async function ShiftPage() {
  const [current, history] = await Promise.all([portalFetch<PosShift | null>("/api/pos/shifts/current"), portalFetch<PosShift[]>("/api/pos/shifts")]);
  return <ShiftPanel current={current} history={history.filter((s) => s.closedAt)} />;
}
