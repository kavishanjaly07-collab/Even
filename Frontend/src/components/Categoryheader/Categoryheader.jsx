import { useState } from "react";
import { Link } from "react-router-dom";
import "./CategoryHeader.css";

// ---------- DATA ----------
// Edit these lists to change the pills and dropdown options
const disciplines = [
  { icon: "📷", name: "Photography" },
  { icon: "🎥", name: "Videography" },
  { icon: "💐", name: "Floral & Decor" },
  { icon: "🍴", name: "Catering & Cuisine" },
  { icon: "🎂", name: "Couture Cakes" },
  { icon: "💄", name: "Bridal Hair & Makeup" },
];

const milestones = [
  "All Celebrations",
  "Weddings",
  "Engagements & Poruwa",
  "Birthdays & Galas",
  "Corporate Events",
  "Pre-Shoots & Albums",
];

const sortOptions = [
  "Recommended Prestige",
  "Highest Rated",
  "Price: Low to High",
  "Price: High to Low",
  "Newest",
];

const locations = [
  "Islandwide (All Sri Lanka)",
  "Colombo",
  "Kandy",
  "Galle",
  "Negombo",
  "Jaffna",
];

const budgets = [
  "Any Investment Level",
  "Under Rs.25,000",
  "Rs.25,000 - Rs.75,000",
  "Above Rs.75,000",
];

// ---------- MAIN COMPONENT ----------
export default function CategoryHeader() {
  // useState = React's "memory". Each filter value is stored here.
  const [discipline, setDiscipline] = useState("Photography");
  const [milestone, setMilestone] = useState("All Celebrations");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(sortOptions[0]);
  const [location, setLocation] = useState(locations[0]);
  const [budget, setBudget] = useState(budgets[0]);
  const [topRated, setTopRated] = useState(false);
  const [promo, setPromo] = useState(false);

  // Puts every filter back to its starting value
  function resetAll() {
    setSearch("");
    setSort(sortOptions[0]);
    setLocation(locations[0]);
    setBudget(budgets[0]);
    setTopRated(false);
    setPromo(false);
    setMilestone("All Celebrations");
  }

  // Later: use these values to filter your list of providers
  // console.log({ discipline, milestone, search, sort, location, budget, topRated, promo });

  return (
    <section className="cat-header">
      {/* 1. CURATED DISCIPLINES BAR (scrolls sideways on small screens) */}
      <div className="discipline-bar">
        <span className="discipline-label">⛰ CURATED DISCIPLINES:</span>
        <div className="pill-scroll">
          {disciplines.map((item) => (
            <button
              key={item.name}
              // adds the "active" class only to the selected pill
              className={`pill ${discipline === item.name ? "active" : ""}`}
              onClick={() => setDiscipline(item.name)}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className="cat-inner">
        {/* 2. BREADCRUMB */}
        <nav className="breadcrumb">
          <Link to="/">HOME</Link> <span>›</span> <a href="#">CATEGORIES</a>{" "}
          <span>›</span> <strong>{discipline.toUpperCase()}</strong>
        </nav>

        {/* 3. TITLE + LIVE INDEX CARD */}
        <div className="hero-row">
          <div className="hero-left">
            <span className="vetted-badge">✪ VETTED NATIONAL DIRECTORY</span>
            <h1>Find Your Perfect Photographer</h1>
            <p>
              Capture life's most precious milestones with verified elite
              cinematographers and fine art photographers across Sri Lanka.
            </p>
          </div>

          <div className="live-card">
            <span className="live-icon">📷</span>
            <div>
              <span className="live-title">
                <i className="dot"></i> LIVE PLATFORM INDEX
              </span>
              <p>Showing 48 Verified Studios</p>
              <p>Instant booking &amp; escrow coverage</p>
            </div>
          </div>
        </div>

        {/* 4. FILTER CARD */}
        <div className="filter-card">
          {/* Row 1: search + sort */}
          <div className="filter-row">
            <div className="search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search photographers by studio name, style, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <label className="sort-label" htmlFor="sort">SORT BY:</label>
            <select
              id="sort"
              className="select sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Row 2: dropdowns + toggle buttons + reset */}
          <div className="filter-row">
            <select
              className="select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {locations.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            <select
              className="select"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            >
              {budgets.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>

            {/* Toggle buttons: click to turn on / off */}
            <button
              className={`toggle ${topRated ? "on" : ""}`}
              onClick={() => setTopRated(!topRated)}
            >
              <span className="star">★</span> 4.8+ Top Rated
            </button>

            <button
              className={`toggle ${promo ? "on" : ""}`}
              onClick={() => setPromo(!promo)}
            >
              🏷 Promotional Offers (20%+ OFF)
            </button>

            <button className="reset" onClick={resetAll}>↺ RESET ALL</button>
          </div>

          {/* Row 3: milestone pills */}
          <div className="milestone-row">
            <span className="milestone-label">MILESTONE:</span>
            <div className="pill-scroll">
              {milestones.map((name) => (
                <button
                  key={name}
                  className={`pill ${milestone === name ? "active" : ""}`}
                  onClick={() => setMilestone(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
