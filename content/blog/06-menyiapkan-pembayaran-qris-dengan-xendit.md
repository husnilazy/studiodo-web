---
title: Menyiapkan pembayaran QRIS dengan Xendit (jangan lewatkan webhook)
category: Panduan
position: 6
author: Tim STUDIODO
excerpt: Hubungkan akun Xendit Anda supaya pelanggan bisa bayar QRIS di kiosk. Langkah webhook adalah yang paling sering terlewat dan membuat kiosk "menunggu selamanya".
---

Pembayaran QRIS di kiosk diproses lewat **akun Xendit milik Anda sendiri**. Artinya uang pelanggan mengikuti ketentuan dan jadwal pencairan Xendit ke rekening Anda; STUDIODO tidak menahan dana tersebut.

Pengaturannya ada di **Admin → Finance → Paket & QRIS**, bagian *Pembayaran QRIS Xendit*.

## Yang Anda butuhkan

- Akun Xendit yang sudah aktif dan terverifikasi untuk menerima pembayaran.
- **Secret Key** dari Xendit.
- **Webhook Token** dari Xendit.

Jangan membagikan Secret Key kepada siapa pun, termasuk lewat chat.

## Langkah 1: isi kunci di STUDIODO

Tempel **Xendit Secret Key** dan **Webhook Token** di kolom yang tersedia, lalu simpan. Setelah tersimpan, tampil keterangan bahwa kunci sudah ada. Untuk menggantinya, isi ulang dengan nilai baru.

Selama Secret Key belum diisi, tampil peringatan *"Belum ada Secret Key; pembayaran belum siap."*

## Langkah 2: atur webhook di Xendit (wajib)

Ini langkah yang paling sering terlewat.

Di STUDIODO tersedia sebuah **URL webhook**. Salin URL itu, lalu di Xendit buka **Settings → Webhooks** dan tempel di kolom untuk event pembayaran yang disebutkan di halaman pengaturan STUDIODO.

Mengapa wajib? Karena webhook adalah cara Xendit memberi tahu kiosk bahwa pelanggan sudah membayar. **Tanpa webhook, pembayaran QRIS asli tidak akan pernah otomatis lanjut ke langkah berikutnya, dan kiosk akan menunggu selamanya**, walaupun uang sudah masuk.

## Langkah 3: uji dengan uang sungguhan

1. Buat satu paket murah untuk uji, atau gunakan paket yang ada.
2. Jalankan sesi di kiosk sampai layar QRIS muncul.
3. Bayar dengan aplikasi e-wallet atau mobile banking Anda.
4. Pastikan kiosk otomatis lanjut ke sesi foto dalam beberapa detik.

Bila kiosk tidak lanjut, periksa kembali URL dan token webhook di Xendit.

## Mode demo

Untuk latihan tanpa uang sungguhan, tersedia mode demo yang diaktifkan dari pengaturan server. Mode ini hanya untuk uji coba; jangan dipakai saat melayani pelanggan.

## Opsi pembayaran lain

QRIS bukan satu-satunya cara. Anda dapat menerima **voucher** dan **cash** (lihat [membuat voucher dan menerima pembayaran cash](/blog/voucher-promo-dan-pembayaran-cash)). Alur pembayaran di kiosk mendukung ketiganya.

## Keamanan

Hanya orang yang memegang akun admin tenant yang bisa melihat atau mengubah pengaturan ini. Gunakan kata sandi yang kuat dan ganti secara berkala lewat [halaman Akun di portal](/portal/akun).
