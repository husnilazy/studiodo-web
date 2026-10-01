import { PasswordForm } from "@/components/PasswordForm";
import { creatorGet, type CreatorMe } from "@/lib/creator";
import { creatorPasswordAction } from "@/app/kreator/masuk/actions";

export const dynamic = "force-dynamic";

export default async function CreatorAccountPage() {
  const me = await creatorGet<CreatorMe>("/me");
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Akun</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Akun &amp; keamanan</h1>
        <p className="mt-2 text-[15px] text-muted">Masuk sebagai <strong className="text-foreground">{me?.email}</strong> · kredit di marketplace: <strong className="text-foreground">{me?.name}</strong></p>
      </div>
      <section className="glass p-8">
        <h2 className="mb-5 font-display text-xl tracking-tight">Ganti password</h2>
        <PasswordForm submit={creatorPasswordAction} />
      </section>
    </div>
  );
}
