---
title: Menghubungkan kamera: webcam dan DSLR lewat digiCamControl
category: Panduan
position: 3
author: Tim STUDIODO
excerpt: Pilih webcam untuk setup cepat, atau kamera DSLR/mirrorless untuk kualitas lebih tinggi. Termasuk mengatur countdown dan kontrol ISO, shutter, serta white balance.
---

Pengaturan kamera ada di **Admin → Kiosk → Kamera**.

## Pilihan 1: webcam

Cara paling cepat. Sambungkan webcam ke PC booth, lalu pilih kamera tersebut sebagai sumber. Cocok untuk booth sederhana atau saat Anda baru mencoba.

## Pilihan 2: kamera DSLR atau mirrorless

Untuk hasil yang lebih tajam, STUDIODO dapat memakai kamera profesional melalui **digiCamControl** (aplikasi gratis yang mengendalikan kamera dari komputer). Singkatnya, STUDIODO berbicara dengan digiCamControl, dan digiCamControl berbicara dengan kamera.

Langkahnya:

1. Pasang **digiCamControl** di PC booth dan pastikan kamera Anda terdeteksi di sana.
2. Di digiCamControl, **aktifkan webserver**. STUDIODO memerlukannya untuk berkomunikasi.
3. Jalankan digiCamControl **sebelum** membuka sesi kiosk.
4. Di STUDIODO, buka Admin → Kiosk → Kamera dan pilih **mode tether**.
5. Pastikan jembatan kamera (bridge) terhubung. Secara bawaan bridge STUDIODO memakai port **5510** dan meneruskan permintaan ke digiCamControl di port **5513**.

Live view kamera **menyala otomatis saat sesi foto dimulai dan mati saat sesi selesai**, jadi kamera tidak terus menyala seharian dan tidak cepat panas. Anda tidak perlu membuka jendela Live View di digiCamControl sendiri.

Setelah terhubung, Anda bisa melihat pratinjau live view dari halaman pengaturan. Pratinjau itu hanya memantau kamera; pengambilan foto tetap dilakukan dari sesi kiosk.

## Kontrol kamera langsung

Dengan kamera tether, Anda dapat mengubah **ISO, kecepatan rana (shutter), bukaan (aperture), dan white balance** langsung dari dashboard. Ini kontrol langsung ke kamera fisik, bukan preset, jadi perubahan terasa seketika. Tidak semua kamera mendukung semua pengaturan; opsi yang tidak tersedia akan ditandai "Tidak tersedia di kamera ini".

## Pengaturan sesi foto

Di halaman yang sama tersedia:

- **Countdown (detik)**: hitung mundur sebelum jepret.
- **Capture vibe**: gaya pengambilan foto.
- **Jepret otomatis**: kiosk lanjut sendiri ke foto berikutnya tanpa pelanggan perlu menekan tombol tiap kali. Berguna untuk paket dengan banyak foto.

## Tips pencahayaan

Pengaturan kamera sebaik apa pun tetap bergantung pada cahaya. Hindari cahaya kuat dari belakang pelanggan, dan usahakan cahaya depan yang merata. Uji dengan beberapa orang dengan warna kulit berbeda sebelum event.

## Bila kamera tidak terdeteksi

- Pastikan digiCamControl berjalan dengan webserver aktif.
- Cabut lalu pasang ulang kabel USB, atau coba port USB lain.
- Tutup aplikasi lain yang memakai kamera yang sama.
- Cek indikator **Kamera** pada daftar kiosk di dashboard: hijau berarti kamera sehat.

Berikutnya: [mengatur printer](/blog/mengatur-printer-dan-cetak-foto).
