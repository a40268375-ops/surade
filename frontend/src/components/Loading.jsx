import "./Loading.css";
import logo from "../assets/logo-color.png";

/**
 * Loading.jsx
 * -----------------------------------------------------------------------
 * <Loading />          -> full page loader: logo di tengah dengan cincin
 *                         gradasi warna brand yang berputar halus di
 *                         sekelilingnya, plus efek "napas" pelan-pelan dan
 *                         titik-titik kecil di bawah teks.
 * <Loading inline />   -> spinner kecil untuk dipakai di dalam section
 *                         (dipakai kalau butuh loading di dalam card, bukan
 *                         menutup seluruh layar)
 *
 * Props:
 * - inline (boolean) default false
 * - text   (string)  teks di bawah logo, default "" (tidak ada teks)
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
        <div className="loading-screen__orbit">
          <span className="loading-screen__ring" />
          <img src={logo} alt="Surade" className="loading-screen__logo" />
        </div>
        {text && <p className="loading-screen__text">{text}</p>}
        <span className="loading-screen__dots">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  );
}

export default Loading;