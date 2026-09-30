// Base URL of the STUDIODO server (studiodo-kiosk/server). Public endpoints only —
// nothing here needs auth. Override per environment in .env.local.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4050").replace(/\/$/, "");

export type PublicPlan = {
  name: string;
  slug: string;
  price: string; // numeric column → string from Postgres
  billingInterval: "monthly" | "yearly" | string;
  kioskLimit: number | null; // null = unlimited
  screenBuilderEnabled: boolean;
  gifVideoEnabled: boolean;
  description: string | null;
};

/** Active plans for the pricing section. Returns null when the API is unreachable so the page can fall back. */
export async function fetchPublicPlans(): Promise<PublicPlan[] | null> {
  try {
    const res = await fetch(`${API_URL}/api/public/plans`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = (await res.json()) as PublicPlan[];
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch {
    return null;
  }
}

export type TenantApplicationInput = {
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  ownerWhatsapp?: string;
  businessType?: string;
  city?: string;
  referralSource?: string;
  message?: string;
};

export async function submitTenantApplication(input: TenantApplicationInput): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}/api/tenant-applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: body?.error ?? "Gagal mengirim pengajuan. Coba lagi." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi." };
  }
}
