import "./BusinessCardSkeleton.css";

/**
 * Kartu skeleton (placeholder abu-abu berkedip) untuk grid bisnis,
 * dipakai selagi data dari API masih dimuat. Ukurannya disamakan
 * persis dengan .biz-card asli (lihat pages/Home.css) supaya layout
 * tidak "loncat" begitu data asli muncul.
 */
export default function BusinessCardSkeleton() {
  return (
    <div className="biz-card-skeleton">
      <div className="biz-card-skeleton__img" />
      <div className="biz-card-skeleton__body">
        <div className="biz-card-skeleton__line biz-card-skeleton__line--title" />
        <div className="biz-card-skeleton__line biz-card-skeleton__line--sub" />
      </div>
    </div>
  );
}

/**
 * Grid berisi beberapa BusinessCardSkeleton sekaligus.
 * Pakai ini untuk mengganti <InlineSpinner /> di halaman yang
 * menampilkan daftar bisnis (Home, Category, dll).
 */
export function BusinessGridSkeleton({ count = 6 }) {
  return (
    <div className="biz-grid-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <BusinessCardSkeleton key={`biz-skel-${i}`} />
      ))}
    </div>
  );
}