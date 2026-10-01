---
title: Mengatasi masalah umum di kiosk: dari pembayaran macet sampai kamera hilang
category: Panduan
position: 11
author: Tim STUDIODO
excerpt: Daftar gejala yang paling sering muncul beserta penyebab dan cara memperbaikinya, termasuk kiosk yang terkunci karena langganan.
---

Sebagian besar masalah di booth berulang dan mudah diperbaiki bila tahu penyebabnya. Berikut yang paling umum.

## Pelanggan sudah bayar QRIS tetapi kiosk tidak lanjut

**Penyebab paling mungkin:** webhook Xendit belum diatur, atau URL/tokennya salah.
**Perbaikan:** buka Admin → Finance → Paket & QRIS, salin URL webhook, dan pastikan sudah terpasang di Xendit (Settings → Webhooks). Lihat [panduan QRIS](/blog/menyiapkan-pembayaran-qris-dengan-xendit).

## "Belum ada Secret Key; pembayaran belum siap"

Secret Key Xendit belum diisi. Isi di Admin → Finance → Paket & QRIS.

## Layar "Setup kiosk ini" menolak kunci

| Pesan | Perbaikan |
|---|---|
| Server tidak bisa dijangkau | Periksa URL server dan koneksi internet PC |
| API key salah atau sudah dicabut | Cek kunci di Admin → Kiosk → API Key |
| API key sudah dipakai di device lain | Pakai **Reset device** pada kunci itu, lalu pasang lagi |

Detail lengkap ada di [panduan menghubungkan kiosk](/blog/memasang-aplikasi-dan-menghubungkan-kiosk).

## Kamera tidak muncul atau live view kosong

- Untuk kamera DSLR: pastikan digiCamControl berjalan dan webserver-nya aktif sebelum membuka kiosk.
- Cabut dan pasang ulang kabel USB, atau coba port lain.
- Pastikan tidak ada aplikasi lain yang sedang memakai kamera.
- Periksa indikator Kamera di dashboard. Detail ada di [panduan kamera](/blog/menghubungkan-kamera-webcam-dan-dslr).

## Foto tidak tercetak

- Pastikan printer menyala, terhubung, dan punya kertas serta tinta/ribbon.
- Coba cetak halaman uji dari Windows. Bila gagal, masalahnya di printer atau driver, bukan di STUDIODO.
- Hapus antrean cetak Windows yang macet.
- Pastikan printer yang dipilih di Admin → Kiosk → Printer sudah benar.

## Kiosk terkunci karena langganan

Bila masa aktif habis dan **masa tenggang** terlewati, kiosk terkunci sampai langganan diperpanjang. Perpanjang dari [portal web](/portal/tagihan) atau hubungi tim kami. Setelah pembayaran terkonfirmasi, masa aktif diperbarui otomatis. Bila langganan akan berakhir, dashboard menampilkan pengingat beberapa hari sebelumnya, jadi jadwalkan perpanjangan sebelum event penting.

## Batas jumlah kiosk tercapai

Setiap paket membatasi jumlah kunci kiosk. Cabut kunci kiosk yang tidak terpakai (misalnya kunci uji coba) atau upgrade paket.

## Internet mati di tengah event

Bila Offline Mode diaktifkan, kiosk tetap dapat melayani dengan paket terakhir, pembayaran manual, serta foto dan cetak lokal. Sesi tersimpan di perangkat dan dikirim otomatis begitu koneksi kembali. Pembayaran QRIS dan galeri cloud tetap memerlukan internet.

## Masih belum teratasi?

Hubungi kami lewat halaman [Kontak](/kontak) dengan menyertakan: nama booth, versi aplikasi (tampil di sidebar Admin), dan apa yang terjadi. Semakin jelas gejalanya, semakin cepat kami membantu.
