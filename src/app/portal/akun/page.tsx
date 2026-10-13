import { PasswordForm } from "@/components/PasswordForm";
import { PageHeader } from "@/components/dash/PageHeader";
import { EmailPrefsForm } from "@/components/EmailPrefsForm";
import { getSummary, portalFetch } from "@/lib/portal";
import { saveEmailPrefsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AkunPage() {
  const [s, email] = await Promise.all([getSummary(), portalFetch<{ categories: { key: string; label: string; hint: string }[]; prefs: Record<string, boolean> }>("/api/portal/email-preferences")]);
  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader eyebrow="Akun" title="Akun &amp; keamanan" intro={<>Masuk sebagai <strong className="text-foreground">{s.email}</strong> · {s.tenant.name}</>} />
      <div className="grid gap-4 xl:grid-cols-2 lg:gap-5">
        <section className="glass self-start p-6 md:p-7">
          <h2 className="mb-5 font-display text-lg tracking-tight">Ganti password</h2>
          <PasswordForm />
        </section>
        <section className="glass self-start p-6 md:p-7">
          <h2 className="font-display text-lg tracking-tight">Preferensi email</h2>
          <p className="mb-4 mt-1 text-[13.5px] text-muted">Pilih email pengingat yang Anda terima. Email keamanan (verifikasi, kata sandi, login terkunci) selalu terkirim.</p>
          <EmailPrefsForm categories={email.categories} initial={email.prefs} save={saveEmailPrefsAction} />
        </section>
      </div>
    </div>
  );
}
