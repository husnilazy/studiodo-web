"use client";

import Script from "next/script";
import { useCallback, useRef, useState } from "react";
import { googleLoginAction } from "@/app/masuk/actions";

type GoogleId = { initialize: (o: { client_id: string; callback: (r: { credential: string }) => void }) => void; renderButton: (el: HTMLElement, o: Record<string, unknown>) => void };
declare global { interface Window { google?: { accounts: { id: GoogleId } } } }

/** "Masuk dengan Google": Google's own button (Identity Services). Only the e-mail of a registered tenant admin gets in; others see the API's message. */
export function GoogleSignIn({ clientId }: { clientId: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const init = useCallback(() => {
    const id = window.google?.accounts.id;
    if (!id || !box.current) return;
    id.initialize({ client_id: clientId, callback: async (r) => { setError(null); const res = await googleLoginAction(r.credential); if (res?.error) setError(res.error); } });
    id.renderButton(box.current, { theme: "outline", size: "large", shape: "pill", text: "signin_with", width: 320, locale: "id" });
  }, [clientId]);

  return (
    <div className="grid justify-items-start gap-3">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={init} />
      <div className="flex w-full items-center gap-3 text-[12.5px] text-muted"><span className="h-px flex-1 bg-foreground/10" />atau<span className="h-px flex-1 bg-foreground/10" /></div>
      <div ref={box} className="min-h-[44px]" />
      {error && <p role="alert" className="rounded-2xl bg-[#ffe3e3] px-4 py-3 text-sm text-[#a12626]">{error}</p>}
    </div>
  );
}
