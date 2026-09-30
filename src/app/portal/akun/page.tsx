import { PasswordForm } from "@/components/PasswordForm";
import { getSummary } from "@/lib/portal";

export const dynamic = "force-dynamic";

export default async function AkunPage() {
  const s = await getSummary();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="eyebrow">Akun</div>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Akun &amp; keamanan</h1>
        <p className="mt-2 text-[15px] text-muted">Masuk sebagai <strong className="text-foreground">{s.email}</strong> · {s.tenant.name}</p>
      </div>
      <section className="glass p-8">
        <h2 className="mb-5 font-display text-xl tracking-tight">Ganti password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
