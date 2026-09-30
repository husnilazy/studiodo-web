import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Bagaimana STUDIODO mengumpulkan, menggunakan, dan melindungi data Anda.",
};

export default function PrivasiPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Kebijakan Privasi."
      updated="30 September 2026"
      intro="STUDIODO adalah platform software photobooth yang dikelola Frameless Creative. Dokumen ini menjelaskan data apa yang kami proses, untuk apa, dan hak Anda atas data tersebut."
      sections={[
        {
          title: "Siapa yang kami layani",
          body: (
            <>
              <p>Ada dua kelompok pengguna, dan peran kami berbeda untuk masing-masing:</p>
              <ul>
                <li><strong>Pemilik booth (tenant)</strong> — bisnis yang berlangganan STUDIODO. Untuk data akun dan langganan mereka, kami bertindak sebagai pengendali data.</li>
                <li><strong>Pelanggan booth</strong> — orang yang berfoto di kiosk milik tenant. Untuk foto dan data sesi mereka, tenant adalah pengendali data dan STUDIODO memprosesnya atas nama tenant sebagai penyedia layanan.</li>
              </ul>
            </>
          ),
        },
        {
          title: "Data yang kami kumpulkan",
          body: (
            <>
              <p><strong>Dari pemilik booth:</strong></p>
              <ul>
                <li>Data pengajuan akun: nama bisnis, nama pemilik, email, nomor WhatsApp, jenis usaha, kota, alamat, situs/Instagram, dan sumber informasi (bila diisi).</li>
                <li>Data akun: email login dan kata sandi (disimpan dalam bentuk hash, tidak pernah dalam teks asli).</li>
                <li>Data langganan: paket, masa aktif, dan riwayat pembayaran. Pembayaran online diproses oleh Midtrans; kami tidak menyimpan nomor kartu atau kredensial pembayaran Anda.</li>
                <li>Data operasional kiosk: versi aplikasi, waktu terakhir aktif, status kamera/printer/jaringan, dan laporan kesalahan aplikasi.</li>
              </ul>
              <p><strong>Dari pelanggan booth (melalui kiosk tenant):</strong></p>
              <ul>
                <li>Foto, GIF, dan video hasil sesi, beserta pilihan paket, filter, dan bingkai.</li>
                <li>Data pembayaran sesi (status dan nominal; pemrosesan dilakukan penyedia pembayaran tenant).</li>
                <li>Nomor WhatsApp atau email, hanya jika pelanggan memasukkannya untuk menerima hasil foto.</li>
                <li>Persetujuan publikasi dan masukan (feedback), hanya jika pelanggan mengisinya.</li>
              </ul>
            </>
          ),
        },
        {
          title: "Untuk apa data digunakan",
          body: (
            <ul>
              <li>Menyediakan dan menjalankan layanan: membuat akun, menjalankan kiosk, menyimpan dan membagikan hasil foto.</li>
              <li>Menagih dan mengelola langganan, serta mengirim informasi terkait akun.</li>
              <li>Menjaga keamanan, mencegah penyalahgunaan, dan memperbaiki gangguan teknis.</li>
              <li>Memenuhi kewajiban hukum yang berlaku.</li>
            </ul>
          ),
        },
        {
          title: "Dengan siapa data dibagikan",
          body: (
            <>
              <p>Kami tidak menjual data pribadi. Data diproses oleh penyedia infrastruktur yang membantu layanan ini berjalan:</p>
              <ul>
                <li>Cloudflare — jaringan, penyimpanan objek (R2), dan tunnel akses.</li>
                <li>Vercel — hosting situs web.</li>
                <li>Neon — basis data.</li>
                <li>Midtrans — pembayaran langganan tenant.</li>
                <li>Google Drive — penyimpanan hasil foto, bila tenant memilih opsi tersebut.</li>
              </ul>
              <p>Hasil foto yang dibagikan lewat tautan galeri dapat dilihat oleh siapa pun yang memegang tautan tersebut. Tenant dan pelanggan sebaiknya tidak membagikan tautan itu di tempat umum jika tidak ingin foto dapat diakses orang lain.</p>
            </>
          ),
        },
        {
          title: "Cookie",
          body: <p>Situs ini hanya memakai satu cookie fungsional untuk menjaga sesi login dashboard (<code>studiodo_session</code>). Cookie ini bersifat httpOnly, berlaku 12 jam, dan tidak dipakai untuk pelacakan iklan.</p>,
        },
        {
          title: "Penyimpanan dan penghapusan",
          body: (
            <ul>
              <li>Data akun dan langganan disimpan selama akun aktif dan selama diperlukan untuk kewajiban pembukuan dan hukum.</li>
              <li>Foto dan data sesi disimpan sesuai pengaturan tenant. Tenant dapat meminta penghapusan data sesi tertentu.</li>
              <li>Permintaan penghapusan akun atau data dapat diajukan melalui kontak di bawah; kami akan menindaklanjutinya dalam waktu yang wajar, kecuali data tersebut wajib disimpan menurut hukum.</li>
            </ul>
          ),
        },
        {
          title: "Keamanan",
          body: <p>Kami memakai koneksi terenkripsi (HTTPS), menyimpan kata sandi dalam bentuk hash, membatasi percobaan login berulang, dan memisahkan data antar-tenant. Tidak ada sistem yang sepenuhnya kebal; bila terjadi insiden yang berdampak pada data pribadi, kami akan memberi tahu pihak terdampak sesuai ketentuan yang berlaku.</p>,
        },
        {
          title: "Hak Anda",
          body: <p>Sesuai peraturan pelindungan data pribadi yang berlaku di Indonesia, Anda berhak meminta akses, perbaikan, atau penghapusan data pribadi Anda, serta menarik persetujuan yang pernah diberikan. Untuk data foto pelanggan booth, mohon hubungi pemilik booth tempat Anda berfoto; kami akan membantu tenant menindaklanjutinya.</p>,
        },
        {
          title: "Perubahan kebijakan",
          body: <p>Kebijakan ini dapat diperbarui. Tanggal pembaruan terakhir tercantum di bagian atas halaman. Perubahan yang material akan kami informasikan kepada pemilik booth melalui email atau dashboard.</p>,
        },
      ]}
    />
  );
}
