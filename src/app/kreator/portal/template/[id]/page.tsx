import Link from "next/link";
import { notFound } from "next/navigation";
import { TemplateEditor } from "@/components/TemplateEditor";
import { creatorGet, type CreatorTemplate } from "@/lib/creator";
import { API_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function TemplateEditorPage({ params }: PageProps<"/kreator/portal/template/[id]">) {
  const { id } = await params;
  const template = await creatorGet<CreatorTemplate>(`/templates/${id}`);
  if (!template) notFound();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/kreator/portal" className="text-sm text-muted underline underline-offset-4">← Semua template</Link>
        <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.035em]">Editor template</h1>
      </div>
      <TemplateEditor initial={template} apiUrl={API_URL} />
    </div>
  );
}
