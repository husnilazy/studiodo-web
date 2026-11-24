"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Webcam / phone camera access for the booth demo. The camera is only asked for after the visitor taps "Pakai kamera saya";
// when there is none, permission is refused, or it disconnects, the demo keeps working with the vector characters.

export type CamStatus = "off" | "asking" | "live" | "unavailable";

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CamStatus>("off");
  const [reason, setReason] = useState("");
  const live = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    live.current?.getTracks().forEach((t) => t.stop());
    live.current = null;
    setStream(null);
    setStatus("off");
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      setReason("Browser ini belum mengizinkan kamera (butuh https).");
      return false;
    }
    setStatus("asking");
    setReason("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      live.current = s;
      // If the camera is unplugged or taken by another app, fall back to the characters instead of freezing on a black frame.
      s.getVideoTracks()[0]?.addEventListener("ended", () => {
        live.current = null;
        setStream(null);
        setStatus("unavailable");
        setReason("Kamera terputus — pakai ilustrasi otomatis.");
      });
      setStream(s);
      setStatus("live");
      return true;
    } catch (e) {
      const name = (e as DOMException)?.name;
      setStatus("unavailable");
      setReason(name === "NotAllowedError" ? "Izin kamera ditolak — pakai ilustrasi otomatis." : name === "NotFoundError" ? "Tidak ada kamera yang tersambung — pakai ilustrasi otomatis." : "Kamera tidak bisa dipakai — pakai ilustrasi otomatis.");
      return false;
    }
  }, []);

  useEffect(() => () => { live.current?.getTracks().forEach((t) => t.stop()); }, []);

  return { stream, status, reason, start, stop };
}
