import { useState } from "react";
import { Link } from "react-router-dom";
import "./ProviderCards.css";

// ---------- DATA ----------
// Put your photos in the "public/providers" folder with these names,
// or change the "image" paths below.
// promoColor can be "gold" or "purple".
const providers = [
  {
    id: 1,
    image: "/providers/golden-moments.jpg",
    promo: "20% OFF Summer Special",
    promoColor: "gold",
    chips: ["Available This Weekend", "48hr Turnaround"],
    name: "Golden Moments Photography",
    rating: "4.9",
    reviews: 128,
    location: "Batticaloa • Sri Lanka • Islandwide Travel",
    text: "Specialists in candid emotional storytelling, heirloom bridal portraits, and high-speed cinematic coverage.",
    tags: ["Weddings", "Engagements", "Birthdays", "Pre-Shoots"],
    price: "LKR 35,000",
    oldPrice: "LKR 43,750",
    save: "Save LKR 8,750",
  },
  {
    id: 2,
    image: "/providers/dream-frame.jpg",
    promo: "15% OFF Milestone Deal",
    promoColor: "purple",
    chips: ["Dual Drone Team Ready", "4K HDR Cinema"],
    name: "Dream Frame Studios",
    rating: "4.8",
    reviews: 96,
    location: "Colombo • Available for Islandwide Travel",
    text: "Award-winning editorial studio with dual 4K mirrorless setups, aerial drone coverage, and rapid delivery.",
    tags: ["Luxury Weddings", "Corporate Galas", "Receptions"],
    price: "LKR 28,000",
    oldPrice: "LKR 32,950",
    save: "Save LKR 4,950",
  },
  {
    id: 3,
    image: "/providers/eternal-memories.jpg",
    promo: "10% OFF Heritage Promo",
    promoColor: "gold",
    chips: ["Traditional Specialists", "Fine Art Album Included"],
    name: "Eternal Memories Photography",
    rating: "4.7",
    reviews: 74,
    location: "Kandy • Central Province & Islandwide",
    text: "Capturing heritage traditions with warmth, authentic candid joy, and timeless heirloom albums.",
    tags: ["Kandyan Weddings", "Engagements", "Family Milestones"],
    price: "LKR 40,000",
    oldPrice: "LKR 44,400",
    save: "Save LKR 4,400",
  },
  {
    id: 4,
    image: "/providers/serendib-lens.jpg",
    promo: "25% OFF Early Bird",
    promoColor: "gold",
    chips: ["Coastal Master Studio", "Voted #1 South Coast"],
    name: "Serendib Lens & Co.",
    rating: "4.95",
    reviews: 142,
    location: "Galle & Southern Coast • Sri Lanka",
    text: "Specializing in world-class tropical destination celebrations, beachside sunset portraits, and cinematic coastal coverage.",
    tags: ["Destination Weddings", "Beach Receptions", "Sunset Portraits"],
    price: "LKR 45,000",
    oldPrice: "LKR 60,000",
    save: "Save LKR 15,000",
  },
  {
    // This card has NO promo, oldPrice or save, so those parts are hidden
    id: 5,
    image: "/providers/royal-candid.jpg",
    chips: ["Instant Date Lock", "Negombo & Airport Corridor"],
    name: "Royal Candid Collective",
    rating: "4.85",
    reviews: 88,
    location: "Negombo • Western Province",
    text: "Master craft in solemn church celebrations, elegant ballrooms, baptisms, and intimate family ceremonies.",
    tags: ["Church Weddings", "Receptions", "Baptisms"],
    price: "LKR 32,000",
  },
  {
    id: 6,
    image: "/providers/velvet-shutter.jpg",
    promo: "15% OFF Couture Pass",
    promoColor: "purple",
    chips: ["Signature Lead Artist", "Colombo 07 Atelier"],
    name: "Velvet Shutter Artisan Studio",
    rating: "4.75",
    reviews: 63,
    location: "Colombo 07 • Cinnamon Gardens",
    text: "High-fashion bridal editorials, bespoke lighting rigs, and exclusive milestone portfolios for discerning couples.",
    tags: ["Bridal Editorials", "VIP Anniversaries", "Corporate Galas"],
    price: "LKR 55,000",
    oldPrice: "LKR 64,700",
    save: "Save LKR 9,700",
  },
];

// ---------- SMALL COMPONENT ----------
// One provider card
function ProviderCard({
  image, promo, promoColor, chips, name, rating, reviews,
  location, text, tags, price, oldPrice, save,
}) {
  // Each card remembers if its heart was clicked
  const [liked, setLiked] = useState(false);

  return (
    <article className="provider-card">
      {/* ----- PHOTO PART ----- */}
      <div className="provider-image" style={{ backgroundImage: `url(${image})` }}>
        <div className="image-top">
          <div>
            <span className="verified-pill">
              <span className="check">✔</span> VERIFIED PRO
            </span>
            {/* Only shows if this provider has a promo */}
            {promo && <span className={`promo-pill ${promoColor}`}>{promo}</span>}
          </div>

          <button
            className={`heart ${liked ? "liked" : ""}`}
            onClick={() => setLiked(!liked)}
            aria-label="Save to favorites"
          >
            {liked ? "♥" : "♡"}
          </button>
        </div>

        {/* Dark strip at the bottom of the photo */}
        <div className="image-chips">
          {chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      </div>

      {/* ----- INFO PART ----- */}
      <div className="provider-info">
        <div className="name-row">
          <h3>{name}</h3>
          <span className="rating">
            <span className="star">★</span> <strong>{rating}</strong> <small>({reviews})</small>
          </span>
        </div>

        <p className="location">📍 {location}</p>
        <p className="description">{text}</p>

        <div className="tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      {/* ----- PRICE + BUTTONS PART ----- */}
      <div className="provider-footer">
        <div className="price-row">
          <span className="invest-label">STARTING INVESTMENT</span>
          {save && <span className="save-pill">{save}</span>}
        </div>

        <div className="price-line">
          <strong>{price}</strong> {oldPrice && <s>{oldPrice}</s>}
        </div>

        <div className="button-row">
          <a href="#" className="view-link">View Profile</a>
          <Link to="/BrowseServices" className="book-btn">Book Now</Link>
        </div>
      </div>
    </article>
  );
}

// ---------- MAIN COMPONENT ----------
export default function ProviderCards() {
  return (
    <section className="providers-section">
      <div className="providers-grid">
        {providers.map((item) => (
          <ProviderCard key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
}
