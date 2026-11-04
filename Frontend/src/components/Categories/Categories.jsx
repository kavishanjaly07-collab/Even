import "./Categories.css";

// ---------- DATA ----------
// Change numbers / names here. The page below repeats them with .map()
const stats = [
  { icon: "😊", number: "3000+", label: "Happy Customers" },
  { icon: "🎉", number: "500+", label: "Successful Events" },
  { icon: "🏅", number: "150+", label: "Service Providers" },
  { icon: "⭐", number: "4.9", label: "Average Rating" },
];

const categories = [
  { icon: "📷", name: "Photography", count: "38 Providers Available" },
  { icon: "🎥", name: "Videography", count: "24 Providers Available" },
  { icon: "🎈", name: "Decoration", count: "42 Providers Available" },
  { icon: "🍴", name: "Catering", count: "31 Providers Available" },
  { icon: "🎂", name: "Cake Design", count: "19 Providers Available" },
  { icon: "💄", name: "Makeup Artist", count: "27 Providers Available" },
  { icon: "🎧", name: "DJ Services", count: "33 Providers Available" },
  { icon: "💃", name: "Dance Groups", count: "16 Providers Available" },
  { icon: "🪄", name: "Magicians", count: "11 Providers Available" },
  { icon: "🎁", name: "Surprise Gift Services", count: "14 Providers Available" },
  { icon: "🏛️", name: "Event Venues", count: "41 Venues Available" },
  { icon: "💍", name: "Wedding Planning", count: "29 Planners Available" },
];

// ---------- SMALL COMPONENTS ----------
// One stat box (top row)
function StatCard({ icon, number, label }) {
  return (
    <div className="stat-card">
      <span className="icon-box">{icon}</span>
      <div>
        <strong>{number}</strong>
        <p>{label}</p>
      </div>
    </div>
  );
}

// One category card
function CategoryCard({ icon, name, count }) {
  return (
    <a href="#" className="category-card">
      <div className="category-top">
        <span className="icon-box">{icon}</span>
        <span className="arrow">↗</span>
      </div>
      <h3>{name}</h3>
      <small>{count}</small>
    </a>
  );
}

// ---------- MAIN COMPONENT ----------
export default function Categories() {
  return (
    <section className="categories-section">
      {/* Stats row */}
      <div className="stats-row">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      {/* Heading */}
      <div className="section-header">
        <div>
          <span className="eyebrow">SIGNATURE COLLECTIONS</span>
          <h2>Curated Event Categories</h2>
          <p>
            Explore premier artisans, specialists, and iconic venues,
            hand-selected to elevate your celebration.
          </p>
        </div>
        <a href="#" className="view-all">View all categories →</a>
      </div>

      {/* Category grid */}
      <div className="category-grid">
        {categories.map((item) => (
          <CategoryCard key={item.name} {...item} />
        ))}
      </div>
    </section>
  );
}
