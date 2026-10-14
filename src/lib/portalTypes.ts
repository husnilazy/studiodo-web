// Shapes shared by the tenant portal's server pages and client components (no server-only imports here).

export type LicenseType = "trial" | "paid" | "unpaid";
export type LockReason = "suspended" | "unpaid" | "trial_expired" | "expired";

export type LicenseSummary = {
  activeKeys: number;
  paid: number;
  trial: number;
  unpaid: number;
  locked: number;
  expiringSoon: number;
  nearestEndsAt: string | null;
};

export type PortalBooth = {
  id: string;
  label: string | null;
  appVersion: string | null;
  paired: boolean;
  lastUsedAt: string | null;
  online: boolean;
  licenseType: LicenseType;
  licenseEndsAt: string | null;
  locked: boolean;
  lockReason: LockReason | null;
  daysRemaining: number | null;
  graceDaysRemaining: number | null;
};

export type VolumeTier = { minBooths: number; percent: number };

export type BoothQuote = {
  boothCount: number;
  interval: "monthly" | "yearly";
  periodDays: number;
  unitList: number;
  unitBase: number;
  discountPercent: number;
  discountSource: "volume" | "tenant" | "none";
  unitFinal: number;
  subtotal: number;
  discountAmount: number;
  total: number;
};

/** What a server action returns to a client component. */
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export type KioskKeyRow = {
  id: string;
  label: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  appVersion: string | null;
  boundDeviceId: string | null;
  boundAt: string | null;
  autoUpdateEnabled: boolean;
  licenseType: LicenseType;
  licenseEndsAt: string | null;
  licensePlanSlug: string | null;
  locked: boolean;
  lockReason: LockReason | null;
  daysRemaining: number | null;
  graceDaysRemaining: number | null;
};

export type PaymentConfig = {
  hasSecretKey: boolean;
  hasWebhookToken: boolean;
  xenditKeyTail: string | null;
  xenditMode: "production" | "sandbox" | null;
  demoMode: boolean;
  cashPaymentEnabled: boolean;
  qrisEnabled: boolean;
  qrisSettlement: "direct" | "platform";
  paymentProvider: "xendit" | "doku";
  dokuClientId: string;
  hasDokuSecret: boolean;
  dokuEnvironment: "sandbox" | "production";
  webhookUrls: { xendit: string; doku: string };
};

export type PackageRow = {
  id: string;
  name: string;
  price: string;
  photoCount: number;
  hasGif: boolean;
  hasVideo: boolean;
  hasStopMotion: boolean;
  extraPrints?: { id: string; name: string; price: number }[];
  active: boolean;
  sortOrder: number;
  description: string | null;
  thumbnailUrl: string | null;
};

export type VoucherRow = {
  id: string;
  code: string;
  discountType: "percent" | "fixed" | "free";
  discountValue: string;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  voucherType: "discount" | "cash";
  cashAmount: string | null;
};

export type FrameRow = {
  id: string;
  kind: "template" | "overlay";
  name: string;
  orientation: string;
  category: string;
  style: string;
  outputPreset: string;
  active: boolean;
  slotCount: number;
  imageUrl: string | null;
  stopMotion: boolean;
  price?: string | null;
  customerName?: string | null;
};

export type WithdrawalsData = {
  balance: {
    settlement: "direct" | "platform";
    since: string | null;
    grossIncome: number;
    platformFee: number;
    netIncome: number;
    withdrawn: number;
    pending: number;
    available: number;
    paymentCount: number;
    rules: { minAmount: number; flatFee: number; feePercent: number };
  };
  items: {
    id: string; amount: string; feeAmount: string; netAmount: string; status: "pending" | "processing" | "paid" | "rejected";
    bankName: string; accountNumber: string; accountName: string; adminNote: string | null; transferReference: string | null;
    requestedAt: string; processedAt: string | null;
  }[];
  lastAccount: { bankName: string; accountNumber: string; accountName: string } | null;
};

export type PrintingConfig = { enabled: boolean; label: string; price: number; max: number };

export type TenantConfig = {
  brandName?: string; tagline?: string | null; logoUrl?: string | null; contactWhatsapp?: string | null;
  socialInstagram?: string | null; socialTiktok?: string | null; socialFacebook?: string | null; socialYoutube?: string | null; hashtag?: string | null; websiteUrl?: string | null;
  address?: string | null; accentColor?: string; countdownSeconds?: number; beepEnabled?: boolean; sessionTimerMinutes?: number;
  kioskConfig?: Record<string, unknown> | null;
};

// --- CRM ---
export type CrmCustomer = {
  key: string; name: string | null; whatsapp: string | null; email: string | null; sessions: number; paidSessions: number; totalSpend: number;
  firstSeen: string; lastSeen: string; consent: boolean; lastFeedback: string | null; lastShareUrl: string | null;
  notes: string | null; tags: string[]; marketingOptOut: boolean;
};
export type CrmSummary = { customers: number; withWhatsapp: number; consent: number; returning: number; new30d: number; lifetimeSpend: number };
export type CrmList = { items: CrmCustomer[]; total: number; limit: number; offset: number; summary: CrmSummary; tags: string[] };
export type CrmQuery = { q?: string; filter?: string; tag?: string; sort?: string; limit?: number; offset?: number };
export type CrmSession = {
  id: string; createdAt: string; completedAt: string | null; paymentStatus: string; paymentMethod: string; totalAmount: number; voucherCode: string | null;
  shareUrl: string | null; feedback: string | null; publishConsent: boolean; packageName: string | null; boothLabel: string | null; photoCount: number;
};

// --- Live monitor ---
export type LiveBooth = {
  id: string; label: string; state: "locked" | "offline" | "payment" | "capture" | "review" | "idle"; paired: boolean; lastUsedAt: string | null;
  appVersion: string | null; diagnostics: { cameraOk: boolean; printerOk: boolean; networkOk: boolean; checkedAt: string } | null;
  licenseType: LicenseType; lockReason: string | null; daysRemaining: number | null;
  current: { sessionId: string; stage: "payment" | "capture" | "review"; packageName: string | null; photoCount: number; photoTarget: number | null; amount: number; startedAt: string } | null;
  waiting: number; today: { sessions: number; paid: number; revenue: number; photos: number }; lastSessionAt: string | null;
};
export type LiveData = {
  now: string;
  summary: { booths: number; online: number; inSession: number; waitingPayment: number; offline: number; locked: number; sessionsToday: number; paidToday: number; revenueToday: number };
  booths: LiveBooth[];
  recent: { id: string; at: string; booth: string; packageName: string | null; amount: number; paymentStatus: string; done: boolean; hasContact: boolean }[];
};
