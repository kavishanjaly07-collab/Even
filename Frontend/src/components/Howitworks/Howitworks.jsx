import "./HowItWorks.css";

// ---------- DATA ----------
// Edit text here. "color" can be "gold" or "purple" (controls the badge color)
const steps = [
  {
    number: "01",
    color: "gold",
    title: "Search Services",
    text: "Filter verified local pros, compare portfolios, and review upfront pricing with total transparency.",
  },
  {
    number: "02",
    color: "purple",
    title: "Book Professionals",
    text: "Seamless booking system with direct messaging and secure milestone payments held safely in escrow.",
  },
  {
    number: "03",
    color: "gold",
    title: "Celebrate Your Event",
    text: "Relax and enjoy your unforgettable day with full platform support and verified satisfaction release.",
  },
];

const features = [
  {
    icon: "🛡️",
    color: "gold",
    title: "Verified Providers",
    text: "Stringent multi-tier background verification, credentials checking, and on-site portfolio validation.",
  },
  {
    icon: "🔒",
    color: "purple",
    title: "Secure Payments",
    text: "Escrow release only upon flawless service completion, ensuring your deposit is completely safe.",
  },
  {
    icon: "💬",
    color: "gold",
    title: "Direct Chat",
    text: "Real-time direct negotiation, mood board exchanges, contract sync, and day-of schedule coordination.",
  },
  {
    icon: "⭐",
    color: "purple",
    title: "Real Reviews",
    text: "100% genuine reviews submitted exclusively by verified clients upon completion of booked celebrations.",
  },
  {
    icon: "🏷️",
    color: "gold",
    title: "Best Prices",
    text: "Transparent curated packages without hidden vendor commissions or unexpected surcharge markups.",
  },
  {
    icon: "📅",
    color: "purple",
    title: "Easy Booking",
    text: "Instant booking confirmations, shared vendor schedule dashboards, and automated Google Calendar sync.",
  },
];

// ---------- SMALL COMPONENTS ----------
// One card in "How Event Connect Works"
function StepCard({ number, color, title, text }) {
  return (
    <div className="step-card">
      {/* `badge ${color}` becomes "badge gold" or "badge purple" */}
      <span className={`badge badge-big ${color}`}>{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

// One card in "Why Choose Event Connect"
function FeatureCard({ icon, color, title, text }) {
  return (
    <div className="feature-card">
      <span className={`badge ${color}`}>{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

// ---------- MAIN COMPONENT ----------
export default function HowItWorks() {
  return (
    <>
      {/* SECTION 1: How it works (centered) */}
      <section className="steps-section">
        <div className="container">
          <div className="heading center">
            <span className="eyebrow">EFFORTLESS COORDINATION</span>
            <h2>How Event Connect Works</h2>
            <p>
              From first inspiration to the final toast, our three-step
              concierge pipeline safeguards your vision.
            </p>
          </div>

          <div className="card-grid">
            {steps.map((item) => (
              <StepCard key={item.number} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: Why choose us (left aligned, darker background) */}
      <section className="features-section">
        <div className="container">
          <div className="heading">
            <span className="eyebrow">UNCOMPROMISING QUALITY</span>
            <h2>Why Choose Event Connect</h2>
            <p>
              Engineered for high-stakes celebrations where perfection is the
              only acceptable baseline.
            </p>
          </div>

          <div className="card-grid">
            {features.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
