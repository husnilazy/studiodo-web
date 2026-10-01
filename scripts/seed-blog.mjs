#!/usr/bin/env node
// Loads content/blog/*.md into the STUDIODO API through the Superadmin blog endpoints.
// Idempotent: a post whose slug already exists is updated in place, otherwise it is created.
//
//   API_URL=https://qr.studiodo.id SUPERADMIN_TOKEN=<jwt> node scripts/seed-blog.mjs [--draft] [--dry-run]
//
// File format:  NN-slug-words.md  (the NN- prefix only orders files; the slug is what follows)
//   ---
//   title: ...
//   category: Panduan | Tips Bisnis | Informasi | Rilis
//   position: 3              (optional; guide order)
//   author: ...              (optional)
//   excerpt: ...
//   ---
//   Markdown body…

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const API_URL = (process.env.API_URL ?? "").replace(/\/$/, "");
const TOKEN = process.env.SUPERADMIN_TOKEN ?? "";
const DRAFT = process.argv.includes("--draft");
const DRY = process.argv.includes("--dry-run");
if (!DRY && (!API_URL || !TOKEN)) {
  console.error("Set API_URL and SUPERADMIN_TOKEN (or use --dry-run).");
  process.exit(1);
}

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "content", "blog");

function parse(file, raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([a-zA-Z]+):\s*(.*)$/.exec(line);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  const slug = file.replace(/^\d+-/, "").replace(/\.md$/, "");
  return {
    slug,
    title: meta.title,
    excerpt: meta.excerpt ?? "",
    category: meta.category ?? "Informasi",
    author: meta.author || null,
    position: meta.position ? Number(meta.position) : null,
    body: m[2].trim() + "\n",
    status: DRAFT ? "draft" : "published",
    coverUrl: null,
  };
}

async function api(method, p, body) {
  const res = await fetch(`${API_URL}/api/superadmin/blog${p}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${p} → ${res.status}: ${json.error ?? "error"}`);
  return json;
}

const files = (await readdir(dir)).filter((f) => f.endsWith(".md")).sort();
const posts = await Promise.all(files.map(async (f) => parse(f, await readFile(path.join(dir, f), "utf8"))));
const slugs = new Set();
for (const p of posts) {
  if (slugs.has(p.slug)) throw new Error(`duplicate slug: ${p.slug}`);
  slugs.add(p.slug);
}

if (DRY) {
  for (const p of posts) console.log(`${p.category.padEnd(12)} #${String(p.position ?? "-").padEnd(3)} ${p.slug}  (${p.body.length} chars)`);
  console.log(`${posts.length} posts parsed OK (dry run, nothing sent)`);
  process.exit(0);
}

const existing = new Map((await api("GET", "")).map((r) => [r.slug, r.id]));
let created = 0;
let updated = 0;
for (const p of posts) {
  const id = existing.get(p.slug);
  if (id) { await api("PUT", `/${id}`, p); updated++; } else { await api("POST", "", p); created++; }
  console.log(`${id ? "updated" : "created"}  ${p.category} · ${p.slug}`);
}
console.log(`done: ${created} created, ${updated} updated${DRAFT ? " (as drafts)" : ""}`);
