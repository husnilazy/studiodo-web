import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan",
  description: "Ketentuan penggunaan layanan dan langganan STUDIODO.",
};

export default function SyaratPage() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Syarat dan Ketentuan."
      updated="30 September 2026"
      intro="Dengan mengajukan akun atau memakai STUDIODO, Anda menyetujui ketentuan berikut. Harap baca dengan saksama."
      sections={[
        {
          title: "Layanan",
          body: <p>STUDIODO adalah perangkat lunak kiosk photobooth beserta dashboard web yang disediakan oleh Frameless Creative kepada pemilik booth (&ldquo;Tenant&rdquo;). Layanan mencakup aplikasi kiosk untuk Windows, pengelolaan paket dan template, pembayaran QRIS di kiosk, galeri cloud, serta dashboard pemantauan.</p>,
        },
        {
          title: "Akun dan persetujuan",
          body: (
            <ul>
              <li>Pengajuan akun ditinjau oleh tim kami dan dapat diterima atau ditolak.</li>
              <li>Anda bertanggung jawab atas kebenaran data yang diberikan dan atas keamanan kata sandi serta kunci kiosk Anda.</li>
              <li>Aktivitas yang dilakukan melalui akun Anda dianggap dilakukan oleh Anda.</li>
            </ul>
          ),
        },
        {
          title: "Masa percobaan dan langganan",
          body: (
            <ul>
              <li>Akun baru mendapat masa percobaan gratis sesuai yang tertera saat pendaftaran (saat ini 7 hari). Kami dapat mengubah durasinya untuk pendaftar berikutnya.</li>
              <li>Setelah masa percobaan, layanan memerlukan langganan berbayar sesuai paket yang tertera di halaman harga.</li>
              <li>Harga dan batas paket (misalnya jumlah kiosk) dapat berubah; perubahan tidak berlaku surut untuk periode yang sudah dibayar.</li>
              <li>Langganan berlaku per periode (bulanan atau tahunan) dan tidak diperpanjang otomatis kecuali dinyatakan lain di halaman pembayaran. Anda bebas berhenti kapan saja dengan tidak memperpanjang.</li>
            </ul>
          ),
        },
        {
          title: "Pembayaran",
          body: <p>Pembayaran langganan dapat dilakukan melalui penyedia pembayaran yang tersedia atau dicatat manual oleh tim kami. Masa aktif diperpanjang setelah pembayaran terkonfirmasi. Pembayaran yang sudah diterima untuk periode yang telah berjalan pada dasarnya tidak dapat dikembalikan, kecuali disepakati lain secara tertulis atau diwajibkan hukum.</p>,
        },
        {
          title: "Lisensi penggunaan",
          body: (
            <ul>
              <li>Kami memberi Anda lisensi terbatas, tidak eksklusif, dan tidak dapat dialihkan untuk memakai aplikasi selama langganan aktif.</li>
              <li>Setiap kunci kiosk hanya untuk satu perangkat. Dilarang membagikan, menjual kembali, atau memakai satu kunci di banyak perangkat.</li>
              <li>Dilarang membongkar, menyalin, atau merekayasa balik perangkat lunak, kecuali diizinkan hukum.</li>
            </ul>
          ),
        },
        {
          title: "Konten dan data pelanggan Anda",
          body: <p>Foto dan data sesi pelanggan booth Anda tetap menjadi milik Anda dan pelanggan Anda. Anda bertanggung jawab memperoleh persetujuan yang diperlukan dari pelanggan booth, memberi tahu mereka bagaimana foto diproses dan dibagikan, serta memastikan template dan konten yang Anda gunakan tidak melanggar hak pihak lain. Pemrosesan data pribadi diatur dalam Kebijakan Privasi kami.</p>,
        },
        {
          title: "Penggunaan yang dilarang",
          body: (
            <ul>
              <li>Melanggar hukum, hak kekayaan intelektual, atau hak privasi orang lain.</li>
              <li>Mengunggah konten yang melanggar hukum, menyesatkan, atau merugikan pihak lain.</li>
              <li>Mengganggu keamanan atau ketersediaan layanan, atau mengakses data tenant lain.</li>
            </ul>
          ),
        },
        {
          title: "Ketersediaan layanan",
          body: <p>Kami berupaya menjaga layanan tetap tersedia, tetapi tidak menjamin layanan bebas gangguan. Kiosk dirancang dapat berjalan sementara tanpa koneksi, namun fitur yang bergantung pada internet (misalnya pembayaran QRIS dan galeri cloud) akan terpengaruh saat koneksi terputus. Pemeliharaan atau pembaruan dapat dilakukan sewaktu-waktu.</p>,
        },
        {
          title: "Penangguhan dan penghentian",
          body: <p>Jika langganan berakhir dan masa tenggang terlewati, kiosk dapat dikunci sampai langganan diperpanjang. Kami dapat menangguhkan atau menghentikan akun yang melanggar ketentuan ini. Anda dapat berhenti kapan saja; data dapat dihapus atas permintaan sesuai Kebijakan Privasi.</p>,
        },
        {
          title: "Batasan tanggung jawab",
          body: <p>Sejauh diizinkan hukum, layanan disediakan &ldquo;sebagaimana adanya&rdquo;. Tanggung jawab kami atas kerugian yang timbul dari penggunaan layanan dibatasi maksimal sebesar biaya langganan yang Anda bayarkan pada tiga bulan terakhir, dan kami tidak bertanggung jawab atas kehilangan pendapatan tidak langsung, kerusakan perangkat keras, atau gangguan dari pihak ketiga (seperti penyedia internet, pembayaran, atau penyimpanan).</p>,
        },
        {
          title: "Perubahan ketentuan dan hukum yang berlaku",
          body: <p>Kami dapat memperbarui ketentuan ini dan akan menginformasikan perubahan yang material. Melanjutkan penggunaan setelah pembaruan berarti Anda menyetujuinya. Ketentuan ini tunduk pada hukum Republik Indonesia.</p>,
        },
      ]}
    />
  );
}
