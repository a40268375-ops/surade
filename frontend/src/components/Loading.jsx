import "./Loading.css";
import logo from "../assets/logo-color.png";

/**
 * Loading.jsx
 * -----------------------------------------------------------------------
 * <Loading />          -> full page loader (background gelap + logo pudar
 *                         di tengah, efek "napas" pelan-pelan)
 * <Loading inline />   -> spinner kecil untuk dipakai di dalam section
 *                         (dipakai kalau butuh loading di dalam card, bukan
 *                         menutup seluruh layar)
 *
 * Props:
 * - inline (boolean) default false
 * - text   (string)  teks di bawah logo, default "" (tidak ada teks,
 *                     sesuai referensi yang cuma logo doang)
 */
function Loading({ inline = false, text = "" }) {
  if (inline) {
    return (
      <div className="loading-inline">
        <span className="loading-ring loading-ring--sm" />
        {text && <span className="loading-inline__text">{text}</span>}
      </div>
    );
  }

  return (
    <div className="loading-screen">
      <div className="loading-screen__box">
        <img src={logo} alt="Surade" className="loading-screen__logo" />
        {text && <p className="loading-screen__text">{text}</p>}
      </div>
    </div>
  );
}

export default Loading;