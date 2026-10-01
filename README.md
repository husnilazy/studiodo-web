# STUDIODO Web

Situs pemasaran + portal tenant untuk platform photobooth STUDIODO. Next.js 16 (App Router), Tailwind 4, TypeScript.
Situs ini **tidak punya database sendiri** — semua data datang dari API server STUDIODO (repo `studiodo`, folder `server/`).

## Halaman

| Rute | Isi |
|---|---|
| `/` | Landing page. Urutan, tampil/sembunyi, dan teks tiap bagian diatur dari **Superadmin → Konten Website** |
| `/template` | Katalog marketplace template (dikurasi admin di **Superadmin → Marketplace**) |
| `/blog`, `/blog/[slug]` | Artikel, ditulis di **Superadmin → Blog** (Markdown, tanpa HTML mentah) |
| `/daftar` | Form pengajuan tenant → `POST /api/tenant-applications` (ditinjau manual di Superadmin) |
| `/unduh` | Installer terbaru dari GitHub Releases + kebutuhan perangkat |
| `/kontak`, `/kreator`, `/privasi`, `/syarat` | Halaman pendukung. Nomor WhatsApp/email diatur di Konten Website → Pengaturan umum |
| `/masuk` | Login tenant (cookie `studiodo_session`, httpOnly, 12 jam) |
| `/portal`, `/portal/tagihan`, `/portal/template`, `/portal/akun` | Dashboard tenant: ringkasan, langganan + bayar Midtrans, pasang template, ganti password |

## Environment variable

Set di Vercel (Settings → Environment Variables), lalu **Redeploy** — nilai baru hanya berlaku untuk build berikutnya.

| Nama | Contoh | Fungsi |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://qr.studiodo.id` | Alamat API server STUDIODO |
| `NEXT_PUBLIC_SITE_URL` | `https://www.studiodo.id` | Alamat kanonis (sitemap, Open Graph). Harus sama dengan domain utama |
| `NEXT_PUBLIC_ADMIN_URL` | _(opsional)_ | Tautan ke dashboard admin aplikasi |

Lokal: salin ke `.env.local` (di-ignore git). Tanpa `NEXT_PUBLIC_API_URL`, default `http://localhost:4050`.

## Menjalankan lokal

```bash
npm install
node ./node_modules/next/dist/bin/next dev -p 3100
```

Kenapa bukan `npm run dev`? Folder proyek ini berada di path yang mengandung `&` (`Build Web & Apps`), yang merusak shim `.bin` npm di Windows. Script di `package.json` memanggil `node ./node_modules/...` langsung. Di path tanpa `&` (mis. Vercel) `npm run dev/build` tetap bekerja.

## Cara kerja data

- **Konten landing** — `GET /api/public/content`. Bila API mati, jatuh ke `src/lib/defaultContent.json`. File itu **dihasilkan dari** `server/lib/siteContent.ts` di repo API (sumber kebenaran skema + default); bila definisi section di server berubah, hasilkan ulang JSON-nya.
- **Harga** — `GET /api/public/plans` (paket aktif dari menu Plans Superadmin).
- **Blog / marketplace** — `GET /api/public/blog`, `GET /api/public/marketplace`. Di-cache 60 detik.
- **Portal** — server component memanggil `/api/portal/*` dengan token dari cookie. Token tidak pernah dikirim ke JavaScript browser.

## Deploy & DNS (Cloudflare + Vercel)

- Domain utama `studiodo.id` dipakai Cloudflare **R2** untuk foto pelanggan (`R2_PUBLIC_BASE_URL`) — **jangan diarahkan ke Vercel**. Website berada di `www.studiodo.id`.
- Record `www`: CNAME → nilai dari Vercel, **Proxy status = DNS only**.
- `qr.studiodo.id` adalah Cloudflare Tunnel ke server STUDIODO — jangan diubah.

## Pembayaran (Midtrans)

Checkout dan webhook ada di API server, bukan di repo ini. Aktifkan dengan mengisi `MIDTRANS_SERVER_KEY` (dan `MIDTRANS_IS_PRODUCTION=true` untuk live) di server, lalu daftarkan URL notifikasi
`https://qr.studiodo.id/api/billing/midtrans/notification` di dashboard Midtrans. Tanpa kunci, portal menampilkan fallback WhatsApp.
