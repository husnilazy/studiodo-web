// Shared by server pages and the client-side editor (creator.ts is server-only).
export type CreatorSlot = { x: number; y: number; w: number; h: number; rotation?: number };

export type CreatorTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  orientation: "portrait" | "landscape";
  outputPreset: string;
  canvasWidth: number;
  canvasHeight: number;
  slots: CreatorSlot[];
  frameUrl: string | null;
  frameAssetId: string | null;
  status: "draft" | "pending" | "approved" | "rejected";
  reviewNote: string | null;
  submittedAt: string | null;
  updatedAt: string;
  installCount: number;
};

export const CATEGORIES = [
  { key: "minimal", label: "Minimal" },
  { key: "wedding", label: "Wedding" },
  { key: "birthday", label: "Birthday" },
  { key: "corporate", label: "Corporate" },
  { key: "seasonal", label: "Seasonal" },
  { key: "custom", label: "Custom" },
];

export const PRESETS = [
  { key: "4r", label: "4R (10,2 × 15,2 cm)" },
  { key: "2r", label: "2R (6 × 9 cm)" },
  { key: "a4", label: "A4" },
  { key: "square", label: "Persegi" },
  { key: "custom", label: "Kustom" },
];
