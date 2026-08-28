import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import logoImg from "../assets/logo.png";
import Loading from "../components/Loading";
import { usePageLoading } from "../hooks/usePageLoading";
import { HelpCircle, ChevronDown, ChevronUp, Search } from "lucide-react";
import "./FAQ.css";

const FAQ_DATA = [
  {
    category: "Umum",
    items: [
      {
        q: "Apa itu Surade.co.id?",
        a: "Surade.co.id adalah portal informasi yang menyajikan data dan berita terpercaya dari berbagai sumber resmi di Indonesia. Platform kami membantu usaha lokal agar lebih mudah ditemukan oleh masyarakat.",
      },
      {
        q: "Apakah Surade.co.id gratis digunakan?",
        a: "Ya, Surade.co.id menyediakan layanan dasar secara gratis untuk semua pengguna. Namun, tersedia juga paket Premium dengan fitur-fitur tambahan seperti tampilan produk, galeri foto, dan lain-lain.",
      },
      {
        q: "Bagaimana cara mendaftar di Surade.co.id?",
        a: "Kamu bisa mendaftar dengan mengklik tombol '+ Usaha' di pojok kanan atas halaman utama, lalu ikuti langkah-langkah pendaftaran yang tersedia.",
      },
    ],
  },
  {
    category: "Akun & Profil",
    items: [
      {
        q: "Bagaimana cara mengubah foto profil saya?",
        a: "Masuk ke Dashboard, lalu buka menu Profil. Di sana kamu bisa mengubah foto profil dengan mengklik ikon kamera pada avatar profil kamu.",
      },
      {
        q: "Saya lupa kata sandi, bagaimana cara mengatasinya?",
        a: "Kamu dapat mengklik tautan 'Lupa Password?' pada halaman login, lalu masukkan email yang terdaftar. Sistem akan mengirimkan link reset kata sandi ke email kamu.",
      },
      {
        q: "Apakah saya bisa memiliki lebih dari satu profil usaha?",
        a: "Saat ini setiap akun hanya dapat mendaftarkan satu profil usaha. Jika kamu memiliki beberapa usaha, silakan hubungi tim kami untuk solusi lebih lanjut.",
      },
    ],
  },
  {
    category: "Usaha & Produk",
    items: [
      {
        q: "Bagaimana cara mendaftarkan usaha saya?",
        a: "Klik tombol '+ Usaha' di navbar, lengkapi informasi usaha seperti nama, kategori, alamat, dan deskripsi. Setelah diverifikasi oleh tim kami, usaha kamu akan tampil di platform.",
      },
      {
        q: "Berapa lama proses verifikasi usaha?",
        a: "Proses verifikasi usaha biasanya memakan waktu 1-3 hari kerja. Kamu akan mendapatkan notifikasi melalui email setelah verifikasi selesai.",
      },
      {
        q: "Apa perbedaan akun Gratis dan Premium?",
        a: "Akun Gratis memungkinkan kamu mendaftarkan usaha dengan fitur dasar. Akun Premium memberikan akses ke fitur tambahan seperti daftar harga produk, galeri foto hingga 20 gambar, FAQ bisnis, dan tampilan yang lebih menarik.",
      },
      {
        q: "Bagaimana cara menambahkan produk ke profil usaha?",
        a: "Di Dashboard, masuk ke menu 'Produk', lalu klik 'Tambah Produk'. Isi nama, harga, dan upload gambar produk kamu. Fitur ini tersedia untuk pengguna Premium.",
      },
    ],
  },
  {
    category: "Pembayaran & Premium",
    items: [
      {
        q: "Metode pembayaran apa saja yang tersedia?",
        a: "Kami menerima pembayaran melalui transfer bank, kartu kredit/debit, dan dompet digital seperti GoPay, OVO, dan Dana.",
      },
      {
        q: "Apakah ada masa uji coba gratis untuk paket Premium?",
        a: "Saat ini kami tidak menyediakan masa uji coba gratis. Namun, kamu bisa menggunakan akun Gratis terlebih dahulu untuk merasakan platform kami sebelum berlangganan Premium.",
      },
      {
        q: "Bagaimana cara membatalkan langganan Premium?",
        a: "Kamu bisa membatalkan langganan kapan saja melalui menu Pengaturan di Dashboard. Fitur Premium akan tetap aktif hingga akhir periode berlangganan yang sudah dibayar.",
      },
    ],
  },
  {
    category: "Teknis & Keamanan",
    items: [
      {
        q: "Bagaimana Surade.co.id melindungi data saya?",
        a: "Kami menggunakan enkripsi SSL untuk semua komunikasi data dan menyimpan informasi sensitif secara aman. Baca Kebijakan Privasi kami untuk informasi lebih lengkap.",
      },
      {
        q: "Apa yang harus dilakukan jika menemukan konten yang tidak pantas?",
        a: "Kamu bisa melaporkan konten yang melanggar aturan dengan mengklik tombol 'Laporkan' yang tersedia di setiap halaman usaha atau blog. Tim kami akan meninjau laporan dalam 1x24 jam.",
      },
    ],
  },
];

export default function FAQ() {
  const pageLoading = usePageLoading();
  const [openItems, setOpenItems] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleItem = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filtered = FAQ_DATA.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  if (pageLoading) return <Loading />;

  return (
    <div className="faq-page">
      <Navbar />

      {/* Hero */}
      <section className="faq-hero">
        <div className="faq-hero__bg" />
        <div className="faq-hero__overlay" />
        <div className="faq-hero__content">
          <div className="faq-hero__icon">
            <HelpCircle size={48} />
          </div>
          <h1 className="faq-hero__title">Pertanyaan yang Sering Diajukan</h1>
          <p className="faq-hero__subtitle">
            Temukan jawaban atas pertanyaan umum seputar Surade.co.id
          </p>
          <div className="faq-search-wrap">
            <Search size={18} className="faq-search-icon" />
            <input
              className="faq-search"
              type="text"
              placeholder="Cari pertanyaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="faq-content">
        <div className="faq-content__inner">
          {filtered.length === 0 ? (
            <div className="faq-empty">
              <HelpCircle size={48} />
              <p>Tidak ada hasil untuk &quot;<strong>{search}</strong>&quot;</p>
            </div>
          ) : (
            filtered.map((cat, catIdx) => (
              <div key={catIdx} className="faq-category">
                <h2 className="faq-category__title">{cat.category}</h2>
                <div className="faq-list">
                  {cat.items.map((item, itemIdx) => {
                    const key = `${catIdx}-${itemIdx}`;
                    const isOpen = !!openItems[key];
                    return (
                      <div
                        key={itemIdx}
                        className={`faq-item ${isOpen ? "faq-item--open" : ""}`}
                      >
                        <button
                          className="faq-item__question"
                          onClick={() => toggleItem(catIdx, itemIdx)}
                          aria-expanded={isOpen}
                        >
                          <span>{item.q}</span>
                          {isOpen ? (
                            <ChevronUp size={20} className="faq-item__icon" />
                          ) : (
                            <ChevronDown size={20} className="faq-item__icon" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="faq-item__answer">
                            <p>{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Kontak CTA */}
          <div className="faq-cta">
            <h3>Tidak menemukan jawaban yang kamu cari?</h3>
            <p>Tim kami siap membantu kamu 24/7</p>
            <Link to="/contact" className="faq-cta__btn">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-cols">
            {/* Brand/Logo Col */}
            <div className="footer-col footer-col--brand">
              <Link to="/" className="footer-logo">
                <img src={logoImg} alt="Surade.co.id" className="footer-logo__img" />
              </Link>
              <p className="footer-desc">
                Surade.co.id adalah portal informasi yang menyajikan data dan
                berita terpercaya dari berbagai sumber resmi di Indonesia.
              </p>
              <div className="footer-social">
                <a href="#" className="footer-social__link" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="WhatsApp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </a>
                <a href="#" className="footer-social__link" aria-label="YouTube">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
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
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/terms">Syarat &amp; Ketentuan</Link></li>
                <li><Link to="/contact">Hubungi Kami</Link></li>
              </ul>
            </div>

            {/* Col 3 - Kontak Kami */}
            <div className="footer-col">
              <h4 className="footer-heading">Kontak Kami</h4>
              <ul className="footer-links">
                <li><a href="mailto:admin@Surade.co.id">admin@Surade.co.id</a></li>
                <li><span className="footer-text">Call Center 0807 - 100 - 1500</span></li>
                  <li><span className="footer-text">WhatsApp: +62 811-1919-711</span></li>
                
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom__inner">
            <p className="footer-copyright">&copy; 2026 Surade.co.id. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}