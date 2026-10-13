import { CreatorProfileForm } from "@/components/CreatorProfileForm";
import { PageHeader } from "@/components/dash/PageHeader";
import { PasswordForm } from "@/components/PasswordForm";
import { EmailPrefsForm } from "@/components/EmailPrefsForm";
import { creatorGet, type CreatorMe } from "@/lib/creator";
import { creatorPasswordAction, saveCreatorEmailPrefsAction } from "@/app/kreator/masuk/actions";

export const dynamic = "force-dynamic";

export default async function CreatorAccountPage() {
  const [me, email] = await Promise.all([creatorGet<CreatorMe>("/me"), creatorGet<{ categories: { key: string; label: string; hint: string }[]; prefs: Record<string, boolean> }>("/email-preferences")]);
  return (
    <div className="dash-stagger flex flex-col gap-4 pb-6 lg:gap-5">
      <PageHeader eyebrow="Akun" title="Profil & keamanan" intro={<>Masuk sebagai <strong className="text-foreground">{me?.email}</strong>. Profil ini tampil di halaman publik Anda dan di setiap template yang terbit.</>} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-5">
        <section className="glass p-6 md:p-7">
          <h2 className="mb-5 font-display text-lg tracking-tight">Profil publik</h2>
          {me && <CreatorProfileForm me={me} />}
        </section>
        <div className="flex flex-col gap-4 lg:gap-5">
          <section className="glass p-6 md:p-7">
            <h2 className="mb-5 font-display text-lg tracking-tight">Ganti password</h2>
            <PasswordForm submit={creatorPasswordAction} />
          </section>
          {email && (
            <section className="glass p-6 md:p-7">
              <h2 className="font-display text-lg tracking-tight">Preferensi email</h2>
              <p className="mb-4 mt-1 text-[13.5px] text-muted">Hasil tinjauan template dan email keamanan selalu terkirim.</p>
              <EmailPrefsForm categories={email.categories} initial={email.prefs} save={saveCreatorEmailPrefsAction} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
