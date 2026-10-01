import Link from "next/link";
import { Icon } from "./Icon";
import { assetUrl } from "@/lib/content";
import { categoryMeta, type BlogSummary } from "@/lib/blog";
import { formatDate } from "@/lib/format";

/** Article card: uploaded cover when there is one, otherwise a soft gradient tile with the category icon. */
export function BlogCard({ post, numbered }: { post: BlogSummary; numbered?: number }) {
  const cat = categoryMeta(post.category);
  const cover = assetUrl(post.coverUrl ?? undefined);
  return (
    <Link href={`/blog/${post.slug}`} className="glass group flex flex-col overflow-hidden transition-transform hover:-translate-y-1">
      <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${cat.tint}`}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded cover of unknown size, served by the API
          <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <Icon name={cat.icon} className="h-14 w-14 text-accent/70" />
        )}
        {numbered !== undefined && (
          <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-display text-sm font-semibold text-on-foreground">{numbered}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-7">
        <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-accent">{cat.key}</div>
        <h2 className="font-display text-xl leading-snug tracking-tight">{post.title}</h2>
        {post.excerpt && <p className="line-clamp-3 text-[15px] leading-relaxed text-muted">{post.excerpt}</p>}
        <div className="mt-auto flex items-center justify-between pt-2 text-[13px] text-muted">
          <span>
            {formatDate(post.publishedAt)}
            {post.readMinutes ? ` · ${post.readMinutes} menit baca` : ""}
          </span>
          <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}
