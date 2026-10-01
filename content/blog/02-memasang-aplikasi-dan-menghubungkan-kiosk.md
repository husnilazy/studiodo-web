---
title: Memasang aplikasi dan menghubungkan kiosk ke akun Anda
category: Panduan
position: 2
author: Tim STUDIODO
excerpt: Cara memasang STUDIODO di PC booth, membuat kunci kiosk, dan memasangkannya. Plus apa yang dilakukan bila ganti komputer.
---

Satu PC booth = satu **kunci kiosk**. Kunci inilah yang membuat aplikasi di PC itu "tahu" bahwa ia milik akun Anda.

## 1. Pasang aplikasi

Unduh installer terbaru dari halaman [Unduh](/unduh), jalankan di PC booth, lalu buka aplikasi STUDIODO. Pada pemakaian pertama, aplikasi menampilkan layar **Setup kiosk ini**.

## 2. Buat kunci kiosk

Di komputer mana pun (boleh laptop pribadi Anda), buka aplikasi atau dashboard Admin dan login dengan akun tenant Anda. Lalu buka **Admin → Kiosk → API Key** dan buat kunci baru. Beri label yang mudah dikenali, misalnya *Booth depan* atau *Booth event Sabtu*.

Catatan penting:

- Salin dan simpan kunci tepat setelah dibuat.
- Jumlah kunci aktif dibatasi sesuai **paket langganan** Anda. Bila sudah mencapai batas, cabut kunci yang tidak terpakai atau upgrade paket.

## 3. Pasangkan di PC booth

Di layar **Setup kiosk ini**, isi dua kolom:

- **URL server**: alamat server STUDIODO yang diberikan tim kami.
- **Kiosk API key**: kunci yang tadi dibuat.

Setelah berhasil, kiosk menampilkan layar awal dan siap dipakai.

## Satu kunci, satu komputer

Setiap kunci otomatis terkunci ke komputer pertama yang memakainya. Itu mencegah kunci yang sama dipakai di banyak booth. Konsekuensinya:

- **Ganti komputer booth?** Buka daftar kunci di Admin → Kiosk → API Key, lalu pilih **Reset device** pada kunci tersebut. Komputer lama langsung ditolak, dan kunci bisa dipasang di komputer baru.
- **Install ulang Windows?** Perangkat dianggap baru. Lakukan Reset device dengan cara yang sama.
- **Booth sudah tidak dipakai?** **Cabut** kuncinya. Kiosk yang memakainya langsung berhenti bisa mengakses server.

## Pesan error yang umum

| Pesan | Artinya | Yang dilakukan |
|---|---|---|
| Server tidak bisa dijangkau | URL salah atau tidak ada internet | Periksa URL server dan koneksi |
| API key salah atau sudah dicabut | Kunci tidak valid | Cek kunci di Admin → Kiosk |
| API key sudah dipakai di device lain | Kunci terkunci ke komputer lain | Reset device di dashboard Admin |

## Pembaruan otomatis

Setiap kiosk bisa memperbarui aplikasinya sendiri. Anda dapat mematikan pembaruan otomatis per kunci bila ingin menahan satu booth di versi tertentu, misalnya saat ada event besar.

Berikutnya: [menghubungkan kamera](/blog/menghubungkan-kamera-webcam-dan-dslr).
