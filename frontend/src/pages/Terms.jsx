import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import logoImg from "../assets/logo.png";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import {
  FileText,
  Shield,
  User,
  AlertCircle,
} from "lucide-react";
import "./Terms.css";

export default function Terms() {
  const pageLoading = usePageLoading();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="terms-page">
      {/* NAVBAR */}
      <header className="home-header">
        <div className="home-header__inner">
          <Link to="/" className="home-logo">
            <img src={logoImg} alt="Surade.co.id" className="home-logo__img" />
          </Link>
          <nav className="home-nav">
            <Link to="/" className="home-nav__link">Home</Link>
            <a href="#" className="home-nav__link home-nav__link--dropdown">
              <span>Informasi</span>
              <ChevronDown size={15} className="home-nav__caret" />
            </a>
            <Link to="/blog" className="home-nav__link">Blog</Link>
            <Link to="/contact" className="home-nav__link">Hubungi Kami</Link>
            <Link to="/login" className="home-nav__link home-nav__link--login">Login</Link>
            <button type="button" className="home-nav__button">
              <Plus size={15} /><span>Add Bisnis</span>
            </button>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="terms-hero">
        <div className="terms-hero__bg" />
        <div className="terms-hero__overlay" />
        <div className="terms-hero__content">
          <h1 className="terms-hero__title">Syarat & Ketentuan</h1>
          <p className="terms-hero__subtitle">
            Ketentuan penggunaan layanan Surade.co.id
          </p>
        </div>
      </section>

      {/* TERMS CONTENT */}
      <section className="terms-content">
        <div className="terms-content__inner">
          {/* Ketentuan Umum */}
          <div className="terms-section">
            <h2 className="terms-section__title">Ketentuan Umum</h2>
            <p className="terms-section__text">
              Surade.co.id sebagai sarana media informasi untuk menginformasikan kegiatan/tempat/bisnis dengan menyediakan berbagai fitur dan layanan untuk menjamin keamanan dan kenyamanan para penggunanya.
            </p>
          </div>

          {/* Media Informasi */}
          <div className="terms-section">
            <div className="terms-section__header">
              <div className="terms-section__icon">
                <FileText size={32} />
              </div>
              <h2 className="terms-section__title">Media Informasi</h2>
            </div>
            <div className="terms-section__text">
              <ol className="terms-list-numbered">
                <li>Surade.co.id merupakan media informasi untuk menyampaikan kegiatan/tempat/bisnis</li>
                <li>Pada menu Jual-Beli, Surade.co.id bukan penjual, melainkan sebagai media informasi bagi penjual</li>
                <li>Adanya biaya tambahan (Pajak dan lain sebagainya) atas segala transaksi jual-beli menjadi tanggung jawab penjual dan pembeli (disepakati) serta diurus oleh pihak-pihak bersangkutan sesuai ketentuan berlaku di Indonesia.</li>
                <li>Barang yang dipasang/diperjualbelikan di Surade.co.id merupakan barang yang tidak tercantum di daftar "Barang Terlarang".</li>
                <li>Surade.co.id tidak bertanggung jawab atas pelayanan, kualitas barang, kondisi barang, dan/atau segala bentuk perselisihan yang dapat terjadi antar Pengguna.</li>
                <li>Surade.co.id memiliki kewenangan untuk mengambil tindakan yang dianggap perlu terhadap akun yang diduga dan/atau terindikasi melakukan penyalahgunaan, memanipulasi, dan/atau melanggar Aturan Penggunaan, membatasi atau mengakhiri hak setiap Pengguna untuk menggunakan layanan, maupun menutup akun tersebut tanpa memberikan pemberitahuan atau informasi terlebih dahulu kepada pemilik akun yang bersangkutan.</li>
                <li>Surade.co.id memiliki kewenangan untuk mengambil keputusan atas permasalahan yang terjadi pada setiap pemasangan dan transaksi.</li>
                <li>Jika Pengguna gagal untuk mematuhi setiap ketentuan dalam Aturan Penggunaan ini, maka Surade.co.id berhak untuk mengambil tindakan yang dianggap perlu, namun tidak terbatas pada melakukan moderasi, menghentikan layanan "Jual Barang", menutup akun dan/atau mengambil langkah hukum selanjutnya.</li>
                <li>Surade.co.id berhak meminta data-data pribadi Pengguna jika diperlukan.</li>
                <li>Aturan Penggunaan Surade.co.id dapat berubah sewaktu-waktu dan/atau diperbaharui dari waktu ke waktu tanpa pemberitahuan terlebih dahulu. Dengan mengakses Surade.co.id, Pengguna dianggap menyetujui perubahan-perubahan dalam Aturan Penggunaan.</li>
                <li>Aturan Penggunaan pada Situs Surade.co.id berlaku mutlak untuk pengguna Surade.co.id</li>
                <li>Hati-hati terhadap penipuan yang mengatasnamakan Surade.co.id. Untuk informasi dan pengaduan, silakan hubungi: admin@Surade.co.id atau +62 811 15 20 900</li>
              </ol>
            </div>
          </div>

          {/* Pengguna */}
          <div className="terms-section">
            <div className="terms-section__header">
              <div className="terms-section__icon">
                <User size={32} />
              </div>
              <h2 className="terms-section__title">Pengguna</h2>
            </div>
            <div className="terms-section__text">
              <ol className="terms-list-numbered">
                <li>Pengguna wajib mengisi data pribadi secara lengkap dan jujur di form isian</li>
                <li>Pengguna media informasi dan pengguna jual beli akan ditampilkan alamat, nomor kontak, e-mail, situs, forum, dan media sosial di Surade.co.id, termasuk di foto profil, foto header, nama akun (username), nama dan deskripsi barang</li>
                <li>Penggunaan fasilitas apapun yang disediakan oleh Surade.co.id mengindikasikan bahwa Pengguna telah memahami dan menyetujui segala aturan yang diberlakukan.</li>
                <li>Selama berada dalam penggunaan Surade.co.id, Pengguna dilarang keras menyampaikan setiap jenis konten apapun yang menyesatkan, memfitnah, atau mencemarkan nama baik, mengandung atau bersinggungan dengan unsur SARA, diskriminasi, dan/atau menyudutkan pihak lain.</li>
                <li>Pengguna tidak diperbolehkan menggunakan Surade.co.id untuk melanggar peraturan yang ditetapkan oleh hukum di Indonesia maupun di negara lainnya.</li>
                <li>Pengguna bertanggung jawab atas segala risiko yang timbul di kemudian hari atas informasi yang diberikannya ke dalam Surade.co.id, namun tidak terbatas pada hal-hal yang berkaitan dengan hak cipta, merek, desain industri, desain tata letak industri dan hak paten atas suatu produk.</li>
                <li>Pengguna diwajibkan menghargai hak-hak Pengguna lainnya dengan tidak memberikan informasi pribadi ke pihak lain tanpa izin pihak yang bersangkutan.</li>
                <li>Pengguna tidak diperkenankan mengirimkan e-mail spam dengan merujuk ke bagian apapun dari Surade.co.id.</li>
                <li>Administrator Surade.co.id berhak menyesuaikan dan/atau menghapus informasi, dan menonaktifkan Pengguna.</li>
                <li>Surade.co.id memiliki hak untuk memblokir penggunaan sistem terhadap Pengguna yang melanggar peraturan perundang-undangan yang berlaku di wilayah Indonesia.</li>
                <li>Pengguna dilarang menggunakan kata-kata kasar yang tidak sesuai norma, baik saat berdiskusi di fitur kirim pesan atau chat maupun kolom diskusi. Jika ditemukan pelanggaran, Surade.co.id berhak memberikan sanksi pelanggaran UU ITE.</li>
                <li>Pengguna dilarang menggunakan fitur kirim pesan sebagai iklan promosi barang dagangan di Surade.co.id maupun di platform atau situs lain yang dapat mengganggu Pengguna lainnya. Jika ditemukan pelanggaran, Surade.co.id berhak memberikan sanksi.</li>
                <li>Pengguna dilarang menggunakan fitur kirim pesan atau chat sebagai sarana penelitian, kuesioner, atau survey. Jika ditemukan pelanggaran, Surade.co.id berhak memberikan sanksi untuk menggugurkan hasil riset/surveynya.</li>
                <li>Pengguna dilarang melakukan transfer atau menjual akun Pengguna ke Pengguna lain atau ke pihak lain tanpa persetujuan dari Surade.co.id.</li>
                <li>Pengguna dengan ini menyatakan bahwa Pengguna telah mengetahui seluruh peraturan perundang-undangan yang berlaku di wilayah Republik Indonesia dalam setiap transaksi di Surade.co.id, dan tidak akan melakukan tindakan apapun yang mungkin melanggar peraturan perundang-undangan yang berlaku di wilayah Republik Indonesia.</li>
                <li>Pengguna dilarang membuat salinan, modifikasi, turunan atau distribusi konten atau mempublikasikan tampilan yang berasal dari Surade.co.id yang dapat melanggar Hak Kekayaan Intelektual Surade.co.id.</li>
              </ol>
            </div>
          </div>

          {/* Jual Barang / Aset */}
          <div className="terms-section">
            <div className="terms-section__header">
              <div className="terms-section__icon">
                <FileText size={32} />
              </div>
              <h2 className="terms-section__title">Jual Barang / Aset</h2>
            </div>
            <div className="terms-section__text">
              <ol className="terms-list-numbered">
                <li>Penjual bertanggung jawab secara penuh atas segala risiko yang timbul di kemudian hari terkait dengan informasi yang dibuatnya, termasuk pada hal-hal yang berkaitan dengan hak cipta, merek, desain industri, desain tata letak sirkuit, hak paten dan/atau izin lain yang telah ditetapkan atas suatu produk menurut hukum yang berlaku di Indonesia.</li>
                <li>Penjual hanya diperbolehkan menjual barang-barang yang tidak tercantum di daftar "Barang Terlarang".</li>
                <li>Penjual wajib menempatkan barang dagangan sesuai dengan kategori dan subkategorinya.</li>
                <li>Penjual wajib mengisi nama atau judul barang dengan jelas, singkat dan padat.</li>
                <li>Penjual wajib mengisi harga yang sesuai dengan harga sebenarnya.</li>
                <li>Penjual dilarang menjual barang yang identik sama (multiple posting) dengan yang sudah ada di halamannya.</li>
                <li>Penjual dilarang melakukan duplikasi penjualan barang dengan menyalin atau menggunakan gambar dari pengguna lain.</li>
                <li>Penjual wajib memperbarui (update) ketersediaan dan status barang yang dijual.</li>
                <li>Catatan penjual diperuntukkan bagi yang ingin memberikan catatan tambahan yang tidak terkait dengan deskripsi barang kepada calon Pembeli. Catatan penjual tunduk terhadap Aturan Penggunaan Surade.co.id.</li>
                <li>Penjual wajib mengisi kolom Deskripsi Barang sesuai dengan Aturan Penggunaan di Surade.co.id.</li>
                <li>Penjual dilarang membuat transaksi fiktif atau palsu demi kepentingan personal. Surade.co.id berhak mengambil tindakan apabila ditemukan tindakan kecurangan.</li>
              </ol>
            </div>
          </div>

          {/* Transaksi */}
          <div className="terms-section">
            <div className="terms-section__header">
              <div className="terms-section__icon">
                <Shield size={32} />
              </div>
              <h2 className="terms-section__title">Transaksi</h2>
            </div>
            <div className="terms-section__text">
              <ol className="terms-list-numbered">
                <li>Surade.co.id tidak bertanggung jawab terhadap barang/aset yang menjadi konflik antara penjual dan pembeli. Penjual wajib berhati-hati dalam transaksi dan pembeli wajib berhati-hati terhadap barang.</li>
                <li>Pengecekan dan ketelitian menjadi tanggung jawab penjual dan pembeli masing-masing.</li>
                <li>Surade.co.id atas kebijakannya sendiri dapat melakukan penahanan atau pembekuan terhadap segala risiko dan kerugian yang timbul, jika Surade.co.id menyimpulkan bahwa tindakan Pengguna, baik Penjual maupun Pembeli terindikasi melakukan kecurangan-kecurangan atau penyalahgunaan dalam bertransaksi dan/atau pelanggaran terhadap Aturan Penggunaan Surade.co.id maka kami berhak melakukan tindakan.</li>
              </ol>
            </div>
          </div>

          {/* Barang Terlarang */}
          <div className="terms-section">
            <div className="terms-section__header">
              <div className="terms-section__icon">
                <AlertCircle size={32} />
              </div>
              <h2 className="terms-section__title">Barang Terlarang</h2>
            </div>
            <div className="terms-section__text">
              <ol className="terms-list-numbered">
                <li>Surade.co.id telah dan akan terus melakukan hal-hal sebagaimana dipersyaratkan oleh peraturan perundang-undangan untuk mencegah terjadinya perdagangan barang-barang yang melanggar ketentuan hukum yang berlaku dan/atau hak pribadi pihak ketiga.</li>
              </ol>
            </div>
          </div>

          {/* Sanksi */}
          <div className="terms-section">
            <div className="terms-section__header">
              <div className="terms-section__icon">
                <AlertCircle size={32} />
              </div>
              <h2 className="terms-section__title">Sanksi</h2>
            </div>
            <div className="terms-section__text">
              <p>Segala tindakan yang melanggar peraturan di Surade.co.id akan dikenakan sanksi berupa termasuk dan namun tidak terbatas pada:</p>
              <ol className="terms-list-numbered">
                <li>Sanksi sesuai dengan UU ITE</li>
                <li>Pelaporan ke pihak terkait (Kepolisian, dll).</li>
              </ol>
            </div>
          </div>

          {/* Penanggung Jawab */}
          <div className="terms-section">
            <div className="terms-section__header">
              <div className="terms-section__icon">
                <Shield size={32} />
              </div>
              <h2 className="terms-section__title">Penanggung Jawab</h2>
            </div>
            <div className="terms-section__text">
              <ol className="terms-list-numbered">
                <li>Surade.co.id tidak bertanggung jawab atas segala risiko dan kerugian yang timbul dari dan dalam kaitannya dengan informasi yang dituliskan oleh pengguna.</li>
                <li>Surade.co.id tidak bertanggung jawab atas segala pelanggaran hak cipta, merk, desain industri, desain tata letak sirkuit, hak paten atau hak-hak pribadi lain yang melekat atas suatu barang, berkenaan dengan segala informasi yang dibuat oleh Penjual. Untuk melaporkan pelanggaran hak cipta, merek, desain industri, desain tata letak sirkuit, hak paten atau hak-hak pribadi lain dapat menghubungi pihak berwenang.</li>
                <li>Surade.co.id tidak bertanggung jawab atas segala risiko dan kerugian yang timbul berkenaan dengan penggunaan barang yang dibeli melalui Surade.co.id, dalam hal terjadi pelanggaran peraturan perundang-undangan.</li>
                <li>Surade.co.id tidak bertanggung jawab atas segala risiko dan kerugian yang timbul berkenaan dengan diaksesnya akun Pengguna oleh pihak lain</li>
                <li>Surade.co.id tidak bertanggung jawab atas segala risiko dan kerugian yang timbul akibat transaksi di luar Surade.co.id.</li>
                <li>Surade.co.id tidak bertanggung jawab atas segala risiko dan kerugian yang timbul akibat kesalahan atau perbedaan nominal yang seharusnya ditransfer.</li>
                <li>Surade.co.id tidak bertanggung jawab atas segala risiko dan kerugian yang timbul akibat kehilangan barang ketika proses transaksi berjalan dan/atau selesai.</li>
                <li>Surade.co.id tidak bertanggung jawab atas segala risiko dan kerugian yang timbul akibat kesalahan Pengguna ataupun pihak lain dalam transaksi</li>
                <li>Dalam keadaan apapun, Pengguna akan membayar kerugian Surade.co.id dan/atau menghindarkan Surade.co.id (termasuk petugas, direktur, karyawan, agen, dan lainnya) dari setiap biaya kerugian apapun, kehilangan, pengeluaran atau kerusakan yang berasal dari tuntutan atau klaim Pihak ketiga yang timbul dari pelanggaran Pengguna terhadap Aturan Penggunaan, dan/atau pelanggaran terhadap hak dari pihak ketiga.</li>
              </ol>
            </div>
          </div>

          {/* Hukum yang Berlaku dan Penyelesaian Sengketa */}
          <div className="terms-section">
            <div className="terms-section__header">
              <div className="terms-section__icon">
                <Shield size={32} />
              </div>
              <h2 className="terms-section__title">Hukum yang Berlaku dan Penyelesaian Sengketa</h2>
            </div>
            <div className="terms-section__text">
              <ol className="terms-list-numbered">
                <li>Aturan Penggunaan ini dilaksanakan dan tunduk pada Peraturan Perundang-undangan Republik Indonesia.</li>
                <li>Apabila terjadi perselisihan menjadi tanggung jawab antara penjual dan pembeli.</li>
                <li>Selama perselisihan dalam proses penyelesaian, Pengguna wajib untuk tetap melaksanakan kewajiban-kewajiban lainnya menurut Aturan yang berlaku.</li>
              </ol>
            </div>
          </div>

          {/* Contact */}
          <div className="terms-section">
            <h2 className="terms-section__title">Hubungi Kami</h2>
            <p className="terms-section__text">
              Untuk informasi dan pengaduan, silakan hubungi:
            </p>
            <div className="terms-contact">
              <p><strong>Email:</strong> <a href="mailto:admin@Surade.co.id">admin@Surade.co.id</a></p>
              <p><strong>WhatsApp:</strong> +62 811 15 20 900</p>
              <p><strong>Alamat:</strong> Jalan Mercurius 16680 Dramaga West Java</p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="terms-footer">
            <p className="terms-footer__text">
              Terakhir diperbarui: Juli 2024
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-cols">
            {/* Brand/Logo Col */}
            <div className="footer-col footer-col--brand">
              <Link to="/" className="footer-logo">
                <img src={logoImg} alt="Surade.co.id" className="footer-logo__img" />
              </Link>
              <p className="footer-desc">
                Surade.co.id adalah portal informasi yang menyajikan data dan berita terpercaya dari berbagai sumber resmi di Indonesia.
              </p>
              <div className="footer-social">
                <a href="#" className="footer-social__link" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="WhatsApp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="YouTube">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </a>
              </div>
            </div>

            {/* Col 1 - Tentang Kami */}
            <div className="footer-col">
              <h4 className="footer-heading">Tentang Kami</h4>
              <ul className="footer-links">
                <li><Link to="/about">Tentang Surade.co.id</Link></li>
                <li><Link to="/vision-mission">Visi &amp; Misi</Link></li>
                <li><Link to="/partnership-career">Kerjasama &amp; Karir</Link></li>
              </ul>
            </div>

            {/* Col 2 - Bantuan */}
            <div className="footer-col">
              <h4 className="footer-heading">Bantuan</h4>
              <ul className="footer-links">
                <li><a href="#">FAQ</a></li>
                <li><Link to="/terms">Syarat &amp; Ketentuan</Link></li>
                <li><Link to="/contact">Hubungi Kami</Link></li>
              </ul>
            </div>

            {/* Col 3 - Kontak Kami */}
            <div className="footer-col">
              <h4 className="footer-heading">Kontak Kami</h4>
              <ul className="footer-links">
                <li><a href="mailto:support@Surade.co.id">support@Surade.co.id</a></li>
                <li><span className="footer-text">(021) 1234 5678</span></li>
                <li><span className="footer-text">Jalan Mercurius 16680 Dramaga West Java</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom__inner">
            <p className="footer-copyright">
              &copy; 2024 Surade.co.id. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
