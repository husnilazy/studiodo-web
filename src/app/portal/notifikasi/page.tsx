import { Icon } from "@/components/Icon";
import { NotificationList } from "@/components/dash/NotificationList";
import { PageHeader } from "@/components/dash/PageHeader";
import { portalFetch } from "@/lib/portal";
import type { NotificationList as NotificationData } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export default async function NotifikasiPage() {
  const initial = await portalFetch<NotificationData>("/api/portal/notifications?limit=60");
  return (
    <div className="fit-page dash-stagger pb-6 lg:pb-0">
      <PageHeader eyebrow="Ringkasan" title="Notifikasi" intro="Pesan dari tim STUDIODO, kabar penting tentang booth dan langganan Anda, dan nantinya pesan dari pelanggan." actions={<span className="inline-flex items-center gap-2 rounded-full bg-[var(--card)] px-4 py-2 text-[13px] text-muted ring-1 ring-[var(--card-edge)]"><Icon name="bell" className="h-4 w-4" />{initial.unread} belum dibaca</span>} />
      <NotificationList initial={initial} />
    </div>
  );
}
