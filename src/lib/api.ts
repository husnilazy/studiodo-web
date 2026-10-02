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
  featured?: boolean;
  features?: string[];
  discountLabel?: string | null;
  /** Ready-to-show prices (promo + yearly option), computed by the API. Missing on an older API build. */
  pricing?: {
    monthly: PublicPriceOption | null;
    yearly: PublicPriceOption | null;
    yearlySavingsPercent: number;
    activeDiscountPercent: number;
    discountEndsAt: string | null;
  };
};

export type PublicPriceOption = {
  list: number; // price before any promo
  final: number; // what is charged
  discountPercent: number;
  perMonth: number;
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

export type CreatorSubmissionInput = {
  name: string;
  email: string;
  whatsapp?: string;
  portfolioUrl: string;
  description?: string;
  company?: string; // honeypot — real visitors never see or fill it
};

export async function submitCreatorApplication(input: CreatorSubmissionInput): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}/api/public/creator-submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: body?.error ?? "Gagal mengirim pendaftaran. Coba lagi." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi." };
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
