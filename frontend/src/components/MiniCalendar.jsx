import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Menu, Minus, X } from "lucide-react";
import "./MiniCalendar.css";

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default function MiniCalendar({ events = [], onDateClick }) {
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

  // Check if a specific date has any events
  const hasEvent = (d) => {
    if (!d) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return events.some(e => e.date === dateStr || (e.created_at && e.created_at.startsWith(dateStr)));
  };

  const handleDateClick = (d) => {
    if (d && onDateClick) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      onDateClick(dateStr);
    }
  };

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
                onClick={() => handleDateClick(d)}
                className={`mini-cal__cell ${d === null ? "mini-cal__cell--empty" : ""} ${d && isToday(d) ? "mini-cal__cell--today" : ""} ${d && hasEvent(d) ? "mini-cal__cell--has-event" : ""} ${d ? "clickable" : ""}`}
              >
                {d || ""}
                {d && hasEvent(d) && <span className="mini-cal__event-dot"></span>}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}