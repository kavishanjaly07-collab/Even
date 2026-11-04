import { Link } from "react-router-dom";
import "./PopularServices.css";

// ---------- DATA ----------
// Put your photos in the "public/services" folder with these names,
// or change the "image" paths below.
const services = [
  {
    image: "/services/videography.jpg",
    rating: "4.98",
    reviews: 94,
    title: "Cinematic 4K Wedding Videography",
    text: "Dual master cameras, drone aerials & 8-min cinematic feature.",
    priceLabel: "Starting at",
    price: "From Rs.25000",
  },
  {
    image: "/services/floral-arch.jpg",
    rating: "4.95",
    reviews: 112,
    title: "Royal Floral Arch & Stage Décor",
    text: "Fresh botanical installations, ambient stage glow, and aisle styling.",
    priceLabel: "Starting at",
    price: "From Rs.12000",
  },
  {
    image: "/services/banquet.jpg",
    rating: "5.0",
    reviews: 68,
    title: "Gourmet Multi-Course Banquet",
    text: "Artisanal plated culinary service with custom dietary sommelier pairings.",
    priceLabel: "Per Person",
    price: "From Rs.3500",
  },
  {
    image: "/services/dj.jpg",
    rating: "4.92",
    reviews: 145,
    title: "Live Acoustic Duo & DJ Package",
    text: "Full sound staging, wireless mics, cocktail set & late night club energy.",
    priceLabel: "Starting at",
    price: "From Rs.10000",
  },
];

// ---------- SMALL COMPONENT ----------
// One service card
function ServiceCard({ image, rating, reviews, title, text, priceLabel, price }) {
  return (
    <article className="service-card">
      {/* Photo with the rating and "Verified Pro" on top */}
      <div className="service-image" style={{ backgroundImage: `url(${image})` }}>
        <span className="rating">
          <span className="star">★</span> {rating} <small>({reviews})</small>
        </span>
        <span className="verified">
          <span className="check">✔</span> Verified Pro
        </span>
      </div>

      {/* Text part */}
      <div className="service-body">
        <h3>{title}</h3>
        <p>{text}</p>

        <div className="service-footer">
          <div>
            <span className="price-label">{priceLabel}</span>
            <strong className="price">{price}</strong>
          </div>
          {/* Opens the Payment page (needs React Router) */}
          <Link to="/payment" className="book-btn">Book Now</Link>
        </div>
      </div>
    </article>
  );
}

// ---------- MAIN COMPONENT ----------
export default function PopularServices() {
  return (
    <section className="popular-section">
      <div className="popular-inner">
        <div className="popular-heading">
          <span className="eyebrow">IN HIGH DEMAND</span>
          <h2>Popular Celebration Services</h2>
          <p>
            Book top-rated, meticulously reviewed experiences configured for
            flawless milestone celebrations.
          </p>
        </div>

        <div className="service-grid">
          {services.map((item) => (
            <ServiceCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
