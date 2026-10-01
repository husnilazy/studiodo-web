---
title: Memantau bisnis booth dari dashboard aplikasi dan portal web
category: Panduan
position: 10
author: Tim STUDIODO
excerpt: Lihat sesi, pendapatan, status kiosk, dan langganan Anda. Kenali apa yang ada di dashboard Admin dan apa yang ada di portal web.
---

Ada dua tempat untuk memantau booth: **dashboard Admin** di dalam aplikasi, dan **portal web** yang bisa dibuka dari mana saja.

## Dashboard Admin (di aplikasi)

Menu utamanya:

- **Control Center**: ringkasan kondisi booth dan metrik utama, termasuk berapa sesi yang berhasil bayar, menunggu, dan gagal atau kedaluwarsa.
- **Profil Gallery**: informasi merek yang tampil di halaman pelanggan.
- **Kiosk**: kunci (API Key), kamera, dan printer.
- **Flow Kiosk**: urutan langkah di kiosk.
- **Finance**: paket, pembayaran QRIS, dan promosi (voucher dan cash).
- **Database / CRM**: data pelanggan yang bersedia memberikan kontak (nomor WhatsApp atau email) saat menerima hasil.
- **Traffic**: pola kunjungan, untuk mengetahui jam dan hari ramai. Banyak tampilan di Admin bisa difilter per periode (hari ini, 7, 30, atau 90 hari).
- **Database Foto & Video**: arsip hasil sesi.

Di bagian bawah sidebar ada **versi aplikasi** dan status pembaruan, dengan tombol untuk memeriksa pembaruan manual.

## Portal web

Buka [Masuk](/masuk) dengan email dan kata sandi tenant Anda. Portal menampilkan:

- **Ringkasan**: paket yang aktif, tanggal berlaku, jumlah sesi dan pendapatan 30 hari terakhir, daftar kunci kiosk beserta status online atau offline, dan pembayaran langganan terakhir.
- **Langganan & tagihan**: perpanjang atau ganti paket, dan lihat riwayat pembayaran.
- **Template**: pasang frame dari marketplace.
- **Direktori**: tampilkan booth Anda di halaman [Cari Booth](/booth) agar calon pelanggan menemukan Anda.
- **Akun**: ganti kata sandi.

Portal web cocok untuk mengecek cepat dari ponsel, misalnya memastikan kiosk di lokasi event masih online.

## Membaca status kiosk

Di daftar kiosk, setiap kiosk menampilkan indikator **Kamera**, **Printer**, dan **Jaringan** (hijau = sehat, merah = ada masalah), serta kapan terakhir aktif. Kiosk disebut **online** bila baru saja menghubungi server.

Saran kebiasaan: sebelum event, cek bahwa ketiga indikator hijau dan versi aplikasi sudah terbaru.

## Membaca angka dengan bijak

- **Pendapatan** menunjukkan total dari sesi yang berhasil dibayar.
- Bandingkan jumlah sesi dengan jam ramai di Traffic untuk memutuskan kapan menambah petugas atau menyiapkan kertas lebih banyak.
- Perhatikan rasio **gagal atau kedaluwarsa**. Bila tinggi, periksa pengaturan [pembayaran QRIS dan webhook](/blog/menyiapkan-pembayaran-qris-dengan-xendit).

Berikutnya: [mengatasi masalah umum](/blog/mengatasi-masalah-umum-di-kiosk).
