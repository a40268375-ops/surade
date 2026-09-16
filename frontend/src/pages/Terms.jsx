import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FileText,
  Shield,
  User,
  AlertCircle,
  Lock,
  ShoppingBag,
  Gavel,
  BookOpen,
  Mail,
  HelpCircle,
} from "lucide-react";
import "./Terms.css";

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="terms-hero">
        <div className="terms-hero__bg" />
        <div className="terms-hero__overlay" />
        <div className="terms-hero__content">
          <div className="terms-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span>Syarat &amp; Ketentuan</span>
          </div>
          <h1 className="terms-hero__title">Syarat &amp; Ketentuan</h1>
          <p className="terms-hero__subtitle">
            Panduan dan ketentuan resmi penggunaan seluruh layanan dan platform Surade.co.id
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="terms-content">
        <div className="terms-layout">
          {/* STICKY SIDEBAR TABLE OF CONTENTS */}
          <aside className="terms-sidebar">
            <div className="terms-sidebar__title">
              <BookOpen size={18} className="text-[#059669]" />
              <span>Daftar Isi</span>
            </div>
            <nav className="terms-nav-list">
              <a href="#ketentuan-umum" className="terms-nav-link">1. Ketentuan Umum</a>
              <a href="#media-informasi" className="terms-nav-link">2. Media Informasi</a>
              <a href="#pengguna" className="terms-nav-link">3. Aturan Pengguna</a>
              <a href="#jual-barang" className="terms-nav-link">4. Jual Barang / Bisnis</a>
              <a href="#transaksi" className="terms-nav-link">5. Transaksi</a>
              <a href="#barang-terlarang" className="terms-nav-link">6. Barang Terlarang</a>
              <a href="#privasi" className="terms-nav-link">7. Kebijakan Privasi</a>
              <a href="#sanksi" className="terms-nav-link">8. Sanksi &amp; Pelanggaran</a>
              <a href="#tanggung-jawab" className="terms-nav-link">9. Batasan Tanggung Jawab</a>
              <a href="#hukum" className="terms-nav-link">10. Hukum &amp; Sengketa</a>
              <a href="#kontak" className="terms-nav-link">11. Hubungi Kami</a>
            </nav>
          </aside>

          {/* MAIN TERMS ARTICLE */}
          <article className="terms-main">
            {/* 1. Ketentuan Umum */}
            <section id="ketentuan-umum" className="terms-section">
              <div className="terms-section__header">
                <div className="terms-section__icon">
                  <BookOpen size={24} />
                </div>
                <h2 className="terms-section__title">1. Ketentuan Umum</h2>
              </div>
              <div className="terms-section__text">
                <p>
                  Selamat datang di <strong>Surade.co.id</strong>. Syarat dan Ketentuan Penggunaan ini mengatur akses serta penggunaan Anda terhadap situs web, aplikasi, direktori bisnis, layanan iklan, dan seluruh fitur yang kami sediakan.
                </p>
                <div className="terms-callout">
                  Dengan mendaftar, mengakses, atau menggunakan Surade.co.id, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh seluruh Syarat dan Ketentuan ini serta Kebijakan Privasi kami.
                </div>
                <p>
                  Surade.co.id berfungsi sebagai sarana media direktori informasi untuk mempromosikan kegiatan, tempat, dan bisnis lokal di seluruh Indonesia guna mendukung ekosistem Smart City dan Smart Village yang aman, transparan, dan berdaya saing.
                </p>
              </div>
            </section>

            {/* 2. Media Informasi */}
            <section id="media-informasi" className="terms-section">
              <div className="terms-section__header">
                <div className="terms-section__icon">
                  <FileText size={24} />
                </div>
                <h2 className="terms-section__title">2. Media Informasi</h2>
              </div>
              <div className="terms-section__text">
                <ol className="terms-list-numbered">
                  <li>Surade.co.id merupakan platform media direktori informasi digital untuk menyampaikan info kegiatan, tempat wisata, kuliner, jasa, dan profil bisnis di Indonesia.</li>
                  <li>Pada direktori produk dan bisnis, Surade.co.id bukan merupakan pemilik atau penjual langsung, melainkan media informasi yang memfasilitasi etalase digital bagi pelaku usaha.</li>
                  <li>Segala bentuk biaya tambahan, pajak, perizinan, dan kesepakatan transaksi jual beli menjadi tanggung jawab pihak penjual dan pembeli sesuai peraturan perundang-undangan di Republik Indonesia.</li>
                  <li>Barang, jasa, dan info yang dipasang wajib merupakan konten yang legal dan tidak tercantum pada daftar "Barang Terlarang".</li>
                  <li>Surade.co.id memiliki kewenangan penuh untuk memoderasi, menyunting, membatasi, atau menonaktifkan akun dan konten yang terindikasi melanggar Aturan Penggunaan tanpa pemberitahuan sebelumnya.</li>
                  <li>Aturan Penggunaan Surade.co.id dapat diperbarui sewaktu-waktu. Perubahan akan berlaku seketika setelah dipublikasikan pada halaman ini.</li>
                </ol>
              </div>
            </section>

            {/* 3. Pengguna */}
            <section id="pengguna" className="terms-section">
              <div className="terms-section__header">
                <div className="terms-section__icon">
                  <User size={24} />
                </div>
                <h2 className="terms-section__title">3. Aturan Pengguna</h2>
              </div>
              <div className="terms-section__text">
                <ol className="terms-list-numbered">
                  <li>Pengguna wajib memberikan data yang akurat, lengkap, dan benar saat melakukan pendaftaran akun serta verifikasi OTP.</li>
                  <li>Pengguna bertanggung jawab penuh atas keamanan akun, kata sandi, dan setiap aktivitas yang terjadi dalam akun miliknya.</li>
                  <li>Pengguna dilarang keras mempublikasikan konten yang mengandung unsur fitnah, kebencian SARA, pornografi, penipuan, pelanggaran hak cipta, atau merugikan pihak manapun.</li>
                  <li>Pengguna dilarang mengirimkan pesan spam, melakukan scraping data tanpa izin, atau merusak infrastruktur keamanan sistem Surade.co.id.</li>
                  <li>Pengguna wajib menghormati privasi dan hak-hak pengguna lain serta dilarang menyebarluaskan data pribadi pihak lain tanpa persetujuan resmi.</li>
                  <li>Pengguna dilarang memperjualbelikan atau memindahtangankan akun Surade.co.id kepada pihak lain tanpa persetujuan tertulis dari manajemen Surade.co.id.</li>
                </ol>
              </div>
            </section>

            {/* 4. Jual Barang / Bisnis */}
            <section id="jual-barang" className="terms-section">
              <div className="terms-section__header">
                <div className="terms-section__icon">
                  <ShoppingBag size={24} />
                </div>
                <h2 className="terms-section__title">4. Pemasangan Usaha &amp; Jual Barang</h2>
              </div>
              <div className="terms-section__text">
                <ol className="terms-list-numbered">
                  <li>Pemilik bisnis bertanggung jawab penuh atas keabsahan legalitas, hak paten/merek, izin edar (BPOM/SNI bila ada), dan kebenaran deskripsi profil usahanya.</li>
                  <li>Setiap usaha wajib ditempatkan pada kategori dan lokasi wilayah (kota/kabupaten) yang tepat.</li>
                  <li>Dilarang membuat postingan duplikat (multiple posting) untuk barang atau bisnis yang sama secara berulang-ulang yang dapat mengganggu kenyamanan direktori.</li>
                  <li>Pemilik usaha wajib memperbarui informasi jam operasional, ketersediaan produk, dan nomor kontak yang dapat dihubungi.</li>
                  <li>Dilarang mencantumkan transaksi fiktif atau testimoni manipulatif demi keuntungan pribadi.</li>
                </ol>
              </div>
            </section>

            {/* 5. Transaksi */}
            <section id="transaksi" className="terms-section">
              <div className="terms-section__header">
                <div className="terms-section__icon">
                  <Shield size={24} />
                </div>
                <h2 className="terms-section__title">5. Ketentuan Transaksi</h2>
              </div>
              <div className="terms-section__text">
                <ol className="terms-list-numbered">
                  <li>Transaksi antar pengguna berlangsung secara langsung (direct communication) antara pembeli dan penjual. Pengguna diimbau selalu berhati-hati dan memeriksa keaslian barang sebelum melakukan pembayaran.</li>
                  <li>Untuk pembayaran paket iklan, banner promosi, atau langganan premium Surade.co.id, pembayaran hanya dilakukan melalui metode resmi yang tertera pada sistem Surade.co.id.</li>
                  <li>Surade.co.id berhak membekukan layanan dan berkoordinasi dengan pihak berwenang jika ditemukan indikasi tindak penipuan atau pencucian uang.</li>
                </ol>
              </div>
            </section>

            {/* 6. Barang Terlarang */}
            <section id="barang-terlarang" className="terms-section">
              <div className="terms-section__header">
                <div className="terms-section__icon">
                  <AlertCircle size={24} />
                </div>
                <h2 className="terms-section__title">6. Barang &amp; Konten Terlarang</h2>
              </div>
              <div className="terms-section__text">
                <p>Berikut adalah beberapa jenis barang dan konten yang DILARANG KERAS di Surade.co.id:</p>
                <ol className="terms-list-numbered">
                  <li>Narkotika, psikotropika, obat-obatan terlarang, dan zat adiktif tanpa izin medis resmi.</li>
                  <li>Senjata api, bahan peledak, senjata tajam ilegal, dan amunisi.</li>
                  <li>Konten pornografi, eksploitasi seksual, atau materi yang melanggar norma kesusilaan.</li>
                  <li>Barang curian, barang selundupan, atau barang bajakan yang melanggar Hak Kekayaan Intelektual (HAKI).</li>
                  <li>Skema cepat kaya ilegal, investasi bodong, perjudian, atau penipuan daring lainnya.</li>
                </ol>
              </div>
            </section>

            {/* 7. Kebijakan Privasi */}
            <section id="privasi" className="terms-section">
              <div className="terms-section__header">
                <div className="terms-section__icon">
                  <Lock size={24} />
                </div>
                <h2 className="terms-section__title">7. Kebijakan Privasi &amp; Data</h2>
              </div>
              <div className="terms-section__text">
                <p>
                  Kami berkomitmen melindungi privasi data pribadi Anda sesuai Undang-Undang Perlindungan Data Pribadi (UU PDP) yang berlaku di Indonesia:
                </p>
                <ol className="terms-list-numbered">
                  <li>Informasi yang kami kumpulkan (seperti nama, email, nomor kontak, foto profil) digunakan semata-mata untuk verifikasi akun, operasional platform, dan komunikasi penting.</li>
                  <li>Data login dilindungi dengan standar enkripsi modern (bcrypt, HTTPS SSL/TLS) guna mencegah akses tidak sah.</li>
                  <li>Kami tidak akan menjual atau menyewakan data pribadi pengguna kepada pihak ketiga manapun untuk kepentingan komersial tanpa persetujuan Anda.</li>
                </ol>
              </div>
            </section>

            {/* 8. Sanksi */}
            <section id="sanksi" className="terms-section">
              <div className="terms-section__header">
                <div className="terms-section__icon">
                  <Gavel size={24} />
                </div>
                <h2 className="terms-section__title">8. Sanksi &amp; Pelanggaran</h2>
              </div>
              <div className="terms-section__text">
                <p>Pelanggaran terhadap Aturan Penggunaan dapat dikenakan tindakan sebagai berikut:</p>
                <ol className="terms-list-numbered">
                  <li>Pemberian peringatan tertulis dan penurunan (take down) konten yang melanggar.</li>
                  <li>Penangguhan sementara atau penutupan permanen akun pengguna.</li>
                  <li>Pelaporan kepada pihak berwajib (Kepolisian RI / Kominfo) sesuai UU ITE jika ditemukan tindak pidana siber, pemerasan, fitnah, atau penipuan.</li>
                </ol>
              </div>
            </section>

            {/* 9. Tanggung Jawab */}
            <section id="tanggung-jawab" className="terms-section">
              <div className="terms-section__header">
                <div className="terms-section__icon">
                  <Shield size={24} />
                </div>
                <h2 className="terms-section__title">9. Batasan Tanggung Jawab</h2>
              </div>
              <div className="terms-section__text">
                <ol className="terms-list-numbered">
                  <li>Surade.co.id tidak bertanggung jawab atas segala kerugian materiil maupun immateriil yang timbul akibat transaksi langsung antara pengguna di luar pengawasan sistem resmi.</li>
                  <li>Surade.co.id tidak bertanggung jawab atas isi informasi pihak ketiga, tautan eksternal, atau kegagalan koneksi akibat gangguan jaringan internet pihak penyedia layanan.</li>
                </ol>
              </div>
            </section>

            {/* 10. Hukum */}
            <section id="hukum" className="terms-section">
              <div className="terms-section__header">
                <div className="terms-section__icon">
                  <Gavel size={24} />
                </div>
                <h2 className="terms-section__title">10. Hukum yang Berlaku &amp; Penyelesaian Sengketa</h2>
              </div>
              <div className="terms-section__text">
                <p>
                  Syarat &amp; Ketentuan ini diatur dan ditafsirkan berdasarkan hukum Negara Kesatuan Republik Indonesia. Setiap perselisihan yang timbul akan diutamakan penyelesaiannya melalui musyawarah untuk mufakat terlebih dahulu sebelum menempuh jalur hukum di Pengadilan Negeri yang berwenang.
                </p>
              </div>
            </section>

            {/* 11. Kontak */}
            <section id="kontak" className="terms-section">
              <div className="terms-section__header">
                <div className="terms-section__icon">
                  <Mail size={24} />
                </div>
                <h2 className="terms-section__title">11. Hubungi Kami &amp; Layanan Pengaduan</h2>
              </div>
              <div className="terms-section__text">
                <p>
                  Jika Anda memiliki pertanyaan, saran, atau ingin melaporkan indikasi pelanggaran aturan penggunaan di platform Surade.co.id, silakan hubungi tim kami:
                </p>
                <div className="terms-contact">
                  <p><strong>Call Center:</strong> <a href="tel:08071001500">0807 - 100 - 1500</a></p>
                  <p><strong>WhatsApp:</strong> <a href="https://wa.me/628111919711" target="_blank" rel="noopener noreferrer">+62 811-1919-711</a></p>
                  <p><strong>Email Dukungan:</strong> <a href="mailto:support@surade.co.id">support@surade.co.id</a></p>
                </div>
              </div>
            </section>

            {/* Last updated footer */}
            <div className="terms-footer">
              <p className="terms-footer__text">
                Terakhir diperbarui: 21 Agustus 2026
              </p>
              <Link to="/faq" className="text-[#059669] font-semibold text-sm flex items-center gap-1.5 hover:underline">
                <HelpCircle size={16} />
                <span>Lihat Pertanyaan Umum (FAQ)</span>
              </Link>
            </div>
          </article>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}