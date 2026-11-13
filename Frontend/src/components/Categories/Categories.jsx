import "./Categories.css";

// ---------- DATA ----------
// Change numbers / names here. The page below repeats them with .map()
const stats = [
  { icon: "😊",label: "Happy Customers" },
  { icon: "🎉",  label: "Successful Events" },
  { icon: "🏅", label: "Service Providers" },
  { icon: "⭐",  label: "Average Rating" },
];

const categories = [
  { icon: "📷", name: "Photography" },
  { icon: "🎥", name: "Videography" },
  { icon: "🎈", name: "Decoration" },
  { icon: "🍴", name: "Catering" },
  { icon: "🎂", name: "Cake Design" },
  { icon: "💄", name: "Makeup Artist" },
  { icon: "🎧", name: "DJ Services" },
  { icon: "💃", name: "Dance Groups" },
  { icon: "🪄", name: "Magicians" },
  { icon: "🎁", name: "Surprise Gift Services"},
  { icon: "🏛️", name: "Event Venues" },
  { icon: "💍", name: "Wedding Planning" },
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
    <section id="categories" className="categories-section">
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
