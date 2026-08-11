import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Menu, Minus, X } from "lucide-react";
import "./MiniCalendar.css";

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// Widget kalender kecil buat halaman Dasbor - murni dekoratif (menampilkan
// bulan berjalan & menyorot hari ini), tidak baca/tulis data booking apa
// pun, jadi aman dipakai di halaman mana saja tanpa butuh API tambahan.
export default function MiniCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayIndex; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="mini-cal">
      <div className="mini-cal__header">
        <CalendarDays size={16} />
        <span>Kalender</span>
        <span className="mini-cal__header-actions">
          <button type="button" title="Menu"><Menu size={13} /></button>
          <button type="button" title={collapsed ? "Perbesar" : "Perkecil"} onClick={() => setCollapsed((v) => !v)}>
            <Minus size={13} />
          </button>
          <button type="button" title="Tutup" onClick={() => setHidden(true)}><X size={13} /></button>
        </span>
      </div>
      {!collapsed && (
        <>
          <div className="mini-cal__nav">
            <button type="button" onClick={goPrevMonth} aria-label="Bulan sebelumnya">
              <ChevronLeft size={16} />
            </button>
            <strong>{BULAN[month]} {year}</strong>
            <button type="button" onClick={goNextMonth} aria-label="Bulan berikutnya">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="mini-cal__grid">
            {HARI.map((h) => (
              <span key={h} className="mini-cal__day-label">{h}</span>
            ))}
            {cells.map((d, idx) => (
              <span
                key={idx}
                className={`mini-cal__cell ${d === null ? "mini-cal__cell--empty" : ""} ${d && isToday(d) ? "mini-cal__cell--today" : ""}`}
              >
                {d || ""}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}