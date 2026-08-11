import "./NavbarWindLeaves.css";

// Bentuk daun realistis (oval meruncing + urat tengah), dipakai berulang
// dengan warna/ukuran/kecepatan berbeda supaya terasa alami, bukan animasi
// yang keliatan "copy-paste" identik.
const LEAF_PATH =
  "M9 0C9 0 18 6 18 15C18 20 13.5 24 9 24C4.5 24 0 20 0 15C0 6 9 0 9 0Z";

// 9 daun kecil, pas untuk ruang setinggi navbar (~78px). Posisi awal
// sengaja disebar dari tengah sampai jauh ke luar sisi kanan layar
// (sampai 170%), dan jarak geser horizontalnya pakai satuan "vw" (persen
// lebar layar) yang BESAR - supaya pergerakan kanan-ke-kirinya benar-benar
// kelihatan menyapu navbar, bukan cuma bergeser beberapa piksel saja.
const LEAVES = Array.from({ length: 9 }, (_, i) => ({
  id: i,
  left: `${30 + i * 16}%`,
  size: 10 + ((i * 3) % 8),
  duration: 3.6 + (i % 4) * 0.8,
  delay: -(i * 0.9),
  sway: 42 + (i % 3) * 12, // dalam vw
  rotate: 160 + (i % 3) * 90,
  color: ["#6b8f3f", "#8fae52", "#4f7942", "#a3823f", "#5c7a3a"][i % 5],
}));

export default function NavbarWindLeaves({ active }) {
  return (
    <div className={`navbar-leaves ${active ? "navbar-leaves--active" : ""}`} aria-hidden="true">
      {LEAVES.map((leaf) => (
        <svg
          key={leaf.id}
          className="navbar-leaves__leaf"
          viewBox="0 0 18 24"
          style={{
            left: leaf.left,
            width: leaf.size,
            height: leaf.size * 1.33,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.delay}s`,
            "--sway": `${leaf.sway}vw`,
            "--rot": `${leaf.rotate}deg`,
          }}
        >
          <path d={LEAF_PATH} fill={leaf.color} />
          <path d="M9 1.5V22.5" stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" />
        </svg>
      ))}
    </div>
  );
}