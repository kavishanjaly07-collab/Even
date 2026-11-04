import { useState } from "react";
import "./ListingPagination.css";

// Works out which buttons to show.
// Example with 8 pages: page 1 -> [1, 2, 3, "...", 8]
function getPages(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1); // [1, 2, 3 ... total]
  }
  if (current <= 3) {
    return [1, 2, 3, "...", total];
  }
  if (current >= total - 2) {
    return [1, "...", total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

// totalPages    = how many pages there are (default 8, like your design)
// onPageChange  = optional function that runs when the user picks a page
export default function ListingPagination({ totalPages = 8, onPageChange }) {
  // useState = React's "memory" for the current page
  const [current, setCurrent] = useState(1);

  function goTo(page) {
    if (page < 1 || page > totalPages || page === current) return;
    setCurrent(page);
    if (onPageChange) onPageChange(page); // tell the parent page (to load new cards)
  }

  return (
    <section className="listing-footer">
      {/* LEFT: escrow note */}
      <p className="escrow-note">
        <strong>🛡 Escrow Protected</strong>
        <span className="dot">•</span>
        <span>Funds released only upon photo delivery satisfaction</span>
      </p>

      {/* RIGHT: page buttons */}
      <nav className="pagination" aria-label="Pages">
        <button
          className="page-btn arrow"
          onClick={() => goTo(current - 1)}
          disabled={current === 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        {getPages(current, totalPages).map((page, index) =>
          page === "..." ? (
            <span key={`dots-${index}`} className="dots">...</span>
          ) : (
            <button
              key={page}
              className={`page-btn ${page === current ? "active" : ""}`}
              onClick={() => goTo(page)}
            >
              {page}
            </button>
          )
        )}

        <button
          className="page-btn arrow"
          onClick={() => goTo(current + 1)}
          disabled={current === totalPages}
          aria-label="Next page"
        >
          ›
        </button>
      </nav>
    </section>
  );
}
