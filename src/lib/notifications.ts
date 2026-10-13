export type NotificationItem = {
  id: string;
  kind: "platform" | "customer_message" | "billing" | "booth" | "system" | string;
  severity: "info" | "success" | "warning" | "critical" | string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  createdAt: string;
  read: boolean;
};

export type NotificationList = { items: NotificationItem[]; unread: number };

export const KIND_LABEL: Record<string, string> = {
  platform: "Dari STUDIODO",
  customer_message: "Pesan pelanggan",
  billing: "Tagihan",
  booth: "Booth",
  system: "Sistem",
};

export const KIND_ICON: Record<string, string> = {
  platform: "bell",
  customer_message: "message",
  billing: "card",
  booth: "monitor",
  system: "info",
};

export const SEVERITY_TONE: Record<string, string> = {
  info: "bg-[#e3e6ff] text-[#3a3ad0]",
  success: "bg-[#dff7ec] text-[#0f6b45]",
  warning: "bg-[#fff3d6] text-[#7a5a00]",
  critical: "bg-[#ffe3e3] text-[#a12626]",
};

/** "baru saja", "5 mnt lalu", "3 jam lalu", "kemarin", otherwise a short date. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d === 1) return "kemarin";
  if (d < 7) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
