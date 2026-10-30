import { Component } from "react";
import "../pages/NotFound.css";

/**
 * Menangkap error JavaScript yang tidak sengaja terjadi di halaman mana pun
 * (misalnya data dari API bentuknya tidak terduga, atau ada bug lain),
 * supaya yang muncul ke pengguna bukan layar putih kosong, tapi halaman
 * ramah pengguna senada dengan desain 404 (lihat pages/NotFound.jsx).
 *
 * Cara pakai: bungkus <AppRouter /> di App.jsx dengan <ErrorBoundary>.
 * React error boundary WAJIB pakai class component (belum ada versi hook-nya).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Tetap dicatat di console supaya gampang di-debug saat development.
    console.error("ErrorBoundary menangkap error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

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
              TERJADI KESALAHAN
            </div>

            <div className="nf-code" style={{ fontSize: "clamp(90px, 14vw, 160px)" }}>
              :(
            </div>

            <div className="nf-underline" />

            <h1>Ada yang tidak beres.</h1>

            <p>
              Halaman ini mengalami kendala teknis. Coba muat ulang, atau
              kembali ke beranda dan coba lagi beberapa saat.
            </p>

            <div className="nf-button-wrapper">
              <button onClick={this.handleReload} className="nf-home-button" style={{ border: "none", cursor: "pointer" }}>
                ← Kembali ke Beranda
              </button>
            </div>

            <div className="nf-bottom-text">Surade.com</div>
          </div>
        </main>
      </div>
    );
  }
}