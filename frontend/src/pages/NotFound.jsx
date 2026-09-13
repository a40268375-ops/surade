import "./NotFound.css";

/**
 * Halaman 404 — muncul otomatis kalau URL yang diketik/diklik
 * tidak cocok dengan halaman mana pun (lihat router/index.jsx,
 * route path="*" paling bawah).
 */
export default function NotFound() {
  return (
    <div className="nf-body">
      <div className="nf-background">
        <div className="nf-blob nf-blob-1" />
        <div className="nf-blob nf-blob-2" />
        <div className="nf-line nf-line-1" />
        <div className="nf-line nf-line-2" />
      </div>

      <main className="nf-main">
        <div className="nf-container">
          <div className="nf-label">
            <span className="nf-dot" />
            HALAMAN TIDAK DITEMUKAN
          </div>

          <div className="nf-code">404</div>

          <div className="nf-underline" />

          <h1>Sepertinya kamu tersesat.</h1>

          <p>
            Halaman yang kamu cari mungkin sudah tidak tersedia, dipindahkan,
            atau alamat yang kamu masukkan tidak ditemukan.
          </p>

          <div className="nf-button-wrapper">
            <a href="/" className="nf-home-button">
              ← Kembali ke Beranda
            </a>
          </div>

          <div className="nf-bottom-text">Surade.co.id</div>
        </div>
      </main>
    </div>
  );
}