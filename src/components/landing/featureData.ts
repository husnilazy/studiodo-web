// Every capability shown on the landing page, grouped. All of these exist in the kiosk app / dashboard.
export type FeatureGroup = { icon: string; title: string; tint: string; items: string[] };

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    icon: "receipt",
    title: "Kasir & Antrian",
    tint: "from-[#ffd3e4] to-[#ffe3b8]",
    items: [
      "Kasir satu layar: paket foto, cetak tambahan, produk, dan item bebas",
      "Tunai, QRIS, atau transfer dengan kembalian otomatis",
      "Kode kiosk otomatis untuk paket yang dibayar di kasir",
      "Struk yang bisa dicetak dengan kop sendiri",
      "Antrian digital: nomor harian, panggil berikutnya, kirim ke booth",
      "Pelanggan yang masih di booth lain tidak ikut terpanggil",
      "Shift kasir: modal awal, hitung laci, selisih kas",
      "Refund per item dengan PIN supervisor",
      "Laporan penjualan harian dan item terlaris",
    ],
  },
  {
    icon: "camera",
    title: "Pengalaman Booth",
    tint: "from-[#c7ceff] to-[#edefff]",
    items: [
      "Foto, GIF, dan video dalam satu sesi",
      "Mode stop-motion",
      "Filter dan stiker bawaan",
      "Mode cermin / asli untuk hasil cetak",
      "Countdown 3-2-1 dan foto ulang",
      "Screen Builder: tampilan kiosk sesuai brand",
      "Orientasi portrait dan landscape",
    ],
  },
  {
    icon: "qr",
    title: "Pembayaran",
    tint: "from-[#b8f0e6] to-[#eafbf8]",
    items: [
      "QRIS otomatis langsung di layar kiosk",
      "Pakai payment gateway Anda sendiri: Xendit atau DOKU",
      "Voucher dan kode promo per event",
      "Paket dan harga fleksibel, termasuk gratis",
      "Cetak tambahan berbayar",
      "Saldo dan penarikan dana dari dashboard",
    ],
  },
  {
    icon: "image",
    title: "Hasil Digital",
    tint: "from-[#ffd3e4] to-[#fff0f6]",
    items: [
      "Galeri cloud dengan QR untuk pelanggan",
      "Halaman galeri bermerek",
      "Kirim hasil lewat WhatsApp dan email",
      "Unduh foto, GIF, dan video",
      "Data pelanggan untuk follow-up",
    ],
  },
  {
    icon: "chart",
    title: "Operasional",
    tint: "from-[#ffe3b8] to-[#fff6e6]",
    items: [
      "Satu akun untuk banyak kiosk",
      "Monitor status booth real-time",
      "Riwayat transaksi dan ekspor CSV",
      "Grafik omzet harian",
      "Notifikasi langsung di dashboard",
      "Tampil di direktori booth publik",
    ],
  },
  {
    icon: "printer",
    title: "Kamera & Cetak",
    tint: "from-[#bfd8ff] to-[#eaf2ff]",
    items: [
      "Webcam atau DSLR / mirrorless (digiCamControl)",
      "Atur ISO, shutter, aperture, white balance dari dashboard",
      "Live view saat sesi berjalan",
      "Printer apa saja yang punya driver Windows",
      "Cetak strip, grid, atau satu foto",
    ],
  },
  {
    icon: "shield",
    title: "Andal & Terbuka",
    tint: "from-[#d5ccff] to-[#eeeaff]",
    items: [
      "Sesi tetap tersimpan saat internet putus",
      "Update aplikasi otomatis, bisa diatur per kiosk",
      "Marketplace template dari kreator",
      "Daftar jadi kreator dan jual desain",
      "Lisensi per booth, tambah kapan saja",
      "Dukungan prioritas lewat WhatsApp",
    ],
  },
];

export const FEATURE_COUNT = FEATURE_GROUPS.reduce((n, g) => n + g.items.length, 0);
