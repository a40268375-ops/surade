/**
 * Grafik tren sederhana (SVG murni, tanpa library tambahan).
 * Menampilkan satu atau beberapa garis, dengan label nilai di titik-titik
 * utama, panah di ujung garis, dan area terisi tipis di bawah garis untuk
 * tampilan yang lebih profesional (mirip dashboard KPI).
 *
 * Props:
 * - labels: array label sumbu-X, mis. ["Sen","Sel","Rab",...]
 * - series: array of { name, color, values: number[] } (panjang sama dengan labels)
 * - unit:   satuan opsional yang ditambahkan di belakang tiap label nilai,
 *           mis. " kunjungan". Kosongkan untuk menampilkan angka polos saja
 *           (skala grafik SEKARANG otomatis menyesuaikan data asli, bukan
 *           dipaksa 0-100 seperti sebelumnya).
 */
export default function DashboardChart({ labels, series, unit = "" }) {
  const width = 640;
  const height = 220;
  const padding = { top: 28, right: 40, bottom: 28, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // Skala otomatis mengikuti nilai data yang sesungguhnya (bukan lagi
  // dipaksa 0-100), dibulatkan ke atas ke angka "bulat" terdekat supaya
  // garis bantu tetap enak dibaca (mis. 0/5/10/15/20).
  const rawMax = Math.max(1, ...series.flatMap((s) => s.values));
  const niceStep = (() => {
    const rough = rawMax / 4;
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(rough, 1))));
    const normalized = rough / magnitude;
    const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return Math.max(1, step * magnitude);
  })();
  const maxVal = niceStep * 4;
  const gridValues = [0, niceStep, niceStep * 2, niceStep * 3, maxVal];

  const stepX = innerW / (labels.length - 1 || 1);

  const toPoint = (i, v) => ({
    x: padding.left + i * stepX,
    y: padding.top + innerH - (v / maxVal) * innerH,
  });

  return (
    <div className="db-chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="db-chart__svg" preserveAspectRatio="xMidYMid meet">
        {/* Garis bantu horizontal, mengikuti skala data asli */}
        {gridValues.map((g) => {
          const y = padding.top + innerH - (g / maxVal) * innerH;
          return (
            <g key={g}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} className="db-chart__grid" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="db-chart__axis-label">
                {Math.round(g)}
              </text>
            </g>
          );
        })}

        {/* Label sumbu-X */}
        {labels.map((label, i) => {
          const { x } = toPoint(i, 0);
          return (
            <text key={label} x={x} y={height - 6} textAnchor="middle" className="db-chart__axis-label">
              {label}
            </text>
          );
        })}

        {/* Garis + area data */}
        {series.map((s) => {
          const points = s.values.map((v, i) => toPoint(i, v));
          const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
          const baseline = padding.top + innerH;
          const areaPath = `${path} L${points[points.length - 1].x},${baseline} L${points[0].x},${baseline} Z`;
          const last = points[points.length - 1];
          const secondLast = points[points.length - 2] || last;
          const angle = Math.atan2(last.y - secondLast.y, last.x - secondLast.x);
          const arrowLen = 14;
          const arrowX = last.x + Math.cos(angle) * arrowLen;
          const arrowY = last.y + Math.sin(angle) * arrowLen;
          const gradientId = `dbchart-area-${s.name.replace(/\s+/g, "")}`;

          return (
            <g key={s.name}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
              <path d={path} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="4" fill={s.color} />
                  <text x={p.x} y={p.y - 10} textAnchor="middle" className="db-chart__value-label" style={{ fill: s.color }}>
                    {s.values[i]}{unit}
                  </text>
                </g>
              ))}
              {/* Panah kecil di ujung garis */}
              <line
                x1={last.x} y1={last.y} x2={arrowX} y2={arrowY}
                stroke={s.color} strokeWidth="2.5" strokeLinecap="round"
                markerEnd={`url(#arrow-${s.name.replace(/\s+/g, "")})`}
              />
              <defs>
                <marker
                  id={`arrow-${s.name.replace(/\s+/g, "")}`}
                  markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"
                >
                  <path d="M0,0 L8,4 L0,8 Z" fill={s.color} />
                </marker>
              </defs>
            </g>
          );
        })}
      </svg>

      <div className="db-chart__legend">
        {series.map((s) => (
          <span key={s.name} className="db-chart__legend-item">
            <span className="db-chart__legend-dot" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}