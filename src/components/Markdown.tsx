import type { ReactNode } from "react";

// A deliberately small Markdown renderer for blog bodies. It builds React nodes directly and never
// uses dangerouslySetInnerHTML, so raw HTML in an article is shown as text, not executed. Links are
// limited to http(s), mailto and site-relative paths.
// Supported: # ## ### headings, paragraphs, - / * / 1. lists, > quotes, ``` code fences, ---, and
// inline **bold**, *italic*, `code`, [text](url).

const SAFE_URL = /^(https?:\/\/|mailto:|\/(?!\/)|#)/i;
const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\))/g;

function inline(text: string, keyBase: string): ReactNode[] {
  return text.split(INLINE).filter((p) => p !== "").map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={key} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return <code key={key} className="rounded-md bg-foreground/[0.06] px-1.5 py-0.5 text-[0.9em]">{part.slice(1, -1)}</code>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={key}>{part.slice(1, -1)}</em>;
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, url] = link;
      if (!SAFE_URL.test(url)) return <span key={key}>{label}</span>;
      const external = /^https?:\/\//i.test(url);
      return (
        <a key={key} href={url} className="font-semibold text-accent underline underline-offset-4" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {label}
        </a>
      );
    }
    return part;
  });
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { i++; continue; }

    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i++]);
      i++;
      out.push(<pre key={k++} className="overflow-x-auto rounded-2xl bg-foreground/[0.06] p-4 text-[14px] leading-relaxed"><code>{code.join("\n")}</code></pre>);
      continue;
    }

    // Table: a header row of | cells |, then a |---|---| separator row, then body rows.
    if (line.includes("|") && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(lines[i + 1])) {
      const cells = (row: string) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") body.push(cells(lines[i++]));
      out.push(
        <div key={k++} className="overflow-x-auto rounded-2xl border border-foreground/10">
          <table className="w-full min-w-[480px] border-collapse text-left text-[15px] leading-relaxed">
            <thead className="bg-foreground/[0.04] text-foreground">
              <tr>{head.map((c, n) => <th key={n} className="px-4 py-3 font-semibold">{inline(c, `th${k}-${n}`)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((r, n) => (
                <tr key={n} className="border-t border-foreground/10 align-top">
                  {r.map((c, m) => <td key={m} className="px-4 py-3">{inline(c, `td${k}-${n}-${m}`)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const cls = level === 1 ? "mt-4 font-display text-3xl tracking-tight text-foreground" : level === 2 ? "mt-4 font-display text-2xl tracking-tight text-foreground" : "mt-2 font-display text-xl tracking-tight text-foreground";
      const Tag = (level === 1 ? "h2" : level === 2 ? "h3" : "h4") as "h2" | "h3" | "h4"; // the page title is the only h1
      out.push(<Tag key={k++} className={cls}>{inline(h[2], `h${k}`)}</Tag>);
      i++;
      continue;
    }

    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) { out.push(<hr key={k++} className="border-foreground/10" />); i++; continue; }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ""));
      out.push(<blockquote key={k++} className="border-l-4 border-accent/40 pl-4 italic">{inline(quote.join(" "), `q${k}`)}</blockquote>);
      continue;
    }

    const ul = /^\s*[-*]\s+/.test(line);
    const ol = /^\s*\d+[.)]\s+/.test(line);
    if (ul || ol) {
      const items: string[] = [];
      const re = ul ? /^\s*[-*]\s+(.*)$/ : /^\s*\d+[.)]\s+(.*)$/;
      while (i < lines.length && re.test(lines[i])) items.push(re.exec(lines[i++])![1]);
      const List = ul ? "ul" : "ol";
      out.push(
        <List key={k++} className={`flex flex-col gap-1.5 pl-6 marker:text-accent ${ul ? "list-disc" : "list-decimal"}`}>
          {items.map((it, n) => <li key={n}>{inline(it, `li${k}-${n}`)}</li>)}
        </List>,
      );
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,3}\s|>|\s*[-*]\s|\s*\d+[.)]\s|```)/.test(lines[i])) para.push(lines[i++]);
    out.push(<p key={k++}>{inline(para.join(" "), `p${k}`)}</p>);
  }

  return <div className="flex flex-col gap-5 text-[17px] leading-[1.75] text-muted">{out}</div>;
}
