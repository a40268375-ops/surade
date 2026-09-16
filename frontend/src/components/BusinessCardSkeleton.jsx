import "./BusinessCardSkeleton.css";

/**
 * Kartu skeleton (placeholder shimmer) untuk grid bisnis,
 * dipakai selagi data dari API masih dimuat. Ukuran dan strukturnya disamakan
 * persis dengan .biz-card asli (lihat pages/Home.css) supaya layout
 * konsisten dan tidak "loncat" begitu data asli muncul.
 */
export default function BusinessCardSkeleton() {
  return (
    <div className="biz-card-skeleton">
      <div className="biz-card-skeleton__img">
        <div className="biz-card-skeleton__badge" />
        <div className="biz-card-skeleton__img-overlay">
          <div className="biz-card-skeleton__btn-save" />
          <div className="biz-card-skeleton__views" />
        </div>
      </div>
      <div className="biz-card-skeleton__body">
        <div className="biz-card-skeleton__header">
          <div className="biz-card-skeleton__line biz-card-skeleton__line--title" />
          <div className="biz-card-skeleton__vip-pill" />
        </div>
        <div className="biz-card-skeleton__cats">
          <div className="biz-card-skeleton__cat-dot" />
          <div className="biz-card-skeleton__line biz-card-skeleton__line--cat" />
          <div className="biz-card-skeleton__line biz-card-skeleton__line--subcat" />
        </div>
        <div className="biz-card-skeleton__tags">
          <div className="biz-card-skeleton__tag" style={{ width: "65px" }} />
          <div className="biz-card-skeleton__tag" style={{ width: "80px" }} />
          <div className="biz-card-skeleton__tag" style={{ width: "50px" }} />
        </div>
        <div className="biz-card-skeleton__footer">
          <div className="biz-card-skeleton__line biz-card-skeleton__line--rating" />
          <div className="biz-card-skeleton__line biz-card-skeleton__line--loc" />
          <div className="biz-card-skeleton__line biz-card-skeleton__line--cta" />
        </div>
      </div>
    </div>
  );
}

/**
 * Grid berisi beberapa BusinessCardSkeleton sekaligus.
 */
export function BusinessGridSkeleton({ count = 6, columns = 3 }) {
  return (
    <div className={`biz-grid-skeleton ${columns === 2 ? "biz-grid-skeleton--col-2" : ""}`}>
      {Array.from({ length: count }).map((_, i) => (
        <BusinessCardSkeleton key={`biz-skel-${i}`} />
      ))}
    </div>
  );
}