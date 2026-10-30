import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./GooglePagination.css";

/**
 * SuradePagination - Iconic Surade "Suuuuurade" Pagination Component
 * Combines the colorful brand wordmark ("Suuuuurade") with the modern pill buttons.
 *
 * @param {number} currentPage - Currently active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when a page is selected
 * @param {number} maxVisiblePages - Maximum number of 'u' pages to show (default 10)
 * @param {string} prevLabel - Label for Previous (default "Sebelumnya")
 * @param {string} nextLabel - Label for Next (default "Selanjutnya")
 */
export default function GooglePagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  maxVisiblePages = 5,
  prevLabel = "Sebelumnya",
  nextLabel = "Selanjutnya",
}) {
  if (totalPages <= 1) return null;

  // Calculate sliding window of pages
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = [];
  for (let p = startPage; p <= endPage; p++) {
    pages.push(p);
  }

  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const handleSelectPage = (page) => {
    if (page !== currentPage && onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <nav className="surade-pagination" aria-label="Navigasi Halaman Surade">
      
      {/* ── Top Row: The Colorful "S u u u u r a d e" Wordmark ── */}
      <div className="surade-pagination__brand">
        {/* Leading 'S' (Surade Teal) */}
        <span className="surade-pagination__letter surade-pagination__letter--S">S</span>

        {/* Dynamic 'u's for each visible page */}
        <div className="surade-pagination__u-group">
          {pages.map((pageNum) => {
            const isActive = pageNum === currentPage;
            return (
              <button
                key={`surade-u-${pageNum}`}
                type="button"
                className={`surade-pagination__letter-btn ${isActive ? "is-active" : ""}`}
                onClick={() => handleSelectPage(pageNum)}
                title={`Ke Halaman ${pageNum}`}
                aria-label={`Ke Halaman ${pageNum}`}
              >
                <span
                  className={`surade-pagination__letter surade-pagination__letter--u ${
                    isActive ? "surade-pagination__letter--u-active" : "surade-pagination__letter--u-page"
                  }`}
                >
                  u
                </span>
              </button>
            );
          })}
        </div>

        {/* Ending 'rade' (Surade Palette) */}
        <div className="surade-pagination__tail-letters">
          <span className="surade-pagination__letter surade-pagination__letter--r">r</span>
          <span className="surade-pagination__letter surade-pagination__letter--a">a</span>
          <span className="surade-pagination__letter surade-pagination__letter--d">d</span>
          <span className="surade-pagination__letter surade-pagination__letter--e">e</span>
        </div>
      </div>

      {/* ── Bottom Row: Pill Controls (Matching Gambar 2) ── */}
      <div className="surade-pagination__controls">
        
        {/* Prev Button */}
        <button
          type="button"
          className="surade-pagination__nav-btn"
          onClick={handlePrev}
          disabled={currentPage === 1}
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft size={18} className="surade-pagination__nav-icon" />
          <span className="surade-pagination__nav-label">{prevLabel}</span>
        </button>

        {/* Numbered Page Pill Buttons */}
        <div className="surade-pagination__page-list">
          {startPage > 1 && (
            <>
              <button
                type="button"
                className={`surade-pagination__page-btn ${currentPage === 1 ? "is-active" : ""}`}
                onClick={() => handleSelectPage(1)}
              >
                1
              </button>
              {startPage > 2 && <span className="surade-pagination__dots">…</span>}
            </>
          )}

          {pages.map((pageNum) => {
            const isActive = pageNum === currentPage;
            return (
              <button
                key={`surade-num-${pageNum}`}
                type="button"
                className={`surade-pagination__page-btn ${isActive ? "is-active" : ""}`}
                onClick={() => handleSelectPage(pageNum)}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Halaman ${pageNum}`}
              >
                {pageNum}
              </button>
            );
          })}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="surade-pagination__dots">…</span>}
              <button
                type="button"
                className={`surade-pagination__page-btn ${currentPage === totalPages ? "is-active" : ""}`}
                onClick={() => handleSelectPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Button */}
        <button
          type="button"
          className="surade-pagination__nav-btn"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Halaman Selanjutnya"
        >
          <span className="surade-pagination__nav-label">{nextLabel}</span>
          <ChevronRight size={18} className="surade-pagination__nav-icon" />
        </button>

      </div>
    </nav>
  );
}
