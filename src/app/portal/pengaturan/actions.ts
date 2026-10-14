"use server";

import { revalidatePath } from "next/cache";
import { portalCall } from "@/lib/portal";
import type { ActionResult } from "@/lib/portalTypes";

const HEX = /^#[0-9a-fA-F]{6}$/;
const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export type ProfileInput = {
  brandName: string; tagline: string; contactWhatsapp: string; socialInstagram: string; socialTiktok: string;
  socialFacebook: string; socialYoutube: string; hashtag: string; websiteUrl: string; address: string;
};

/**
 * Brand profile. Written to BOTH places the kiosk reads from — the dedicated columns (public gallery page) and the
 * customizer config the kiosks load at boot — so one never silently overrides the other with an older value.
 */
export async function saveProfileAction(input: ProfileInput): Promise<ActionResult> {
  const profile = {
    brandName: text(input.brandName, 80) || "STUDIODO",
    tagline: text(input.tagline, 160),
    contactWhatsapp: text(input.contactWhatsapp, 40),
    socialInstagram: text(input.socialInstagram, 160),
    socialTiktok: text(input.socialTiktok, 160),
    socialFacebook: text(input.socialFacebook, 160),
    socialYoutube: text(input.socialYoutube, 160),
    hashtag: text(input.hashtag, 60),
    websiteUrl: text(input.websiteUrl, 160),
    address: text(input.address, 200),
  };
  const columns = await portalCall("PATCH", "/api/config/gallery-profile", profile);
  if (!columns.ok) return { ok: false, error: columns.error };
  const config = await portalCall("PATCH", "/api/config/kiosk-config", { config: profile });
  if (!config.ok) return { ok: false, error: config.error };
  revalidatePath("/portal/pengaturan");
  return { ok: true, data: undefined };
}

export type KioskSettingsInput = {
  accentColor: string;
  idleHeadline: string; idleSubheadline: string; promoText: string;
  packageHeadline: string; paymentHeadline: string; captureHeadline: string; resultHeadline: string;
  countdownSeconds: number; sessionTimerMinutes: number; printCopies: number; maxPhotosPerSession: number;
  beepEnabled: boolean; autoCaptureEnabled: boolean; autoPrintEnabled: boolean;
  eventEnabled: boolean; eventName: string; eventFreeEntry: boolean;
};

export async function saveKioskSettingsAction(input: KioskSettingsInput): Promise<ActionResult> {
  if (!HEX.test(input.accentColor)) return { ok: false, error: "Warna aksen harus berformat #RRGGBB." };
  const num = (v: unknown, min: number, max: number) => Math.max(min, Math.min(max, Math.round(Number(v) || 0)));
  const config = {
    accentColor: input.accentColor,
    idleHeadline: text(input.idleHeadline, 120), idleSubheadline: text(input.idleSubheadline, 200), promoText: text(input.promoText, 200),
    packageHeadline: text(input.packageHeadline, 120), paymentHeadline: text(input.paymentHeadline, 120),
    captureHeadline: text(input.captureHeadline, 120), resultHeadline: text(input.resultHeadline, 120),
    countdownSeconds: num(input.countdownSeconds, 1, 10), sessionTimerMinutes: num(input.sessionTimerMinutes, 1, 60),
    printCopies: num(input.printCopies, 1, 10), maxPhotosPerSession: num(input.maxPhotosPerSession, 1, 20),
    beepEnabled: Boolean(input.beepEnabled), autoCaptureEnabled: Boolean(input.autoCaptureEnabled), autoPrintEnabled: Boolean(input.autoPrintEnabled),
    eventEnabled: Boolean(input.eventEnabled), eventName: text(input.eventName, 120), eventFreeEntry: Boolean(input.eventFreeEntry),
  };
  const result = await portalCall("PATCH", "/api/config/kiosk-config", { config });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/pengaturan");
  return { ok: true, data: undefined };
}

export async function saveLogoAction(dataUrl: string | null): Promise<ActionResult<{ logoUrl: string | null }>> {
  if (dataUrl !== null && !/^data:image\/(png|jpeg|webp);base64,/.test(dataUrl)) return { ok: false, error: "Format gambar tidak didukung (gunakan PNG, JPG, atau WebP)." };
  const result = await portalCall<{ images: Record<string, string | null> }>("PATCH", "/api/config/kiosk-config", { config: { logoUrl: dataUrl ?? "" } });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/pengaturan");
  return { ok: true, data: { logoUrl: result.data.images?.logoUrl ?? null } };
}

export async function savePrintingAction(input: { enabled: boolean; label: string; price: number; max: number }): Promise<ActionResult> {
  const result = await portalCall("PATCH", "/api/config/printing", {
    enabled: Boolean(input.enabled), label: text(input.label, 80) || "Tambah print 4R",
    price: Math.max(0, Math.round(Number(input.price) || 0)), max: Math.max(1, Math.min(20, Math.round(Number(input.max) || 5))),
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/pengaturan");
  return { ok: true, data: undefined };
}
