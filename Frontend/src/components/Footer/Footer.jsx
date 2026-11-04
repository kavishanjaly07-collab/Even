import "./Footer.css";

// ---------- DATA ----------
// Edit the links here. The page repeats them with .map()
const serviceLinks = [
  "Fine Art Photography",
  "Floral Architecture",
  "Gastronomy & Catering",
  "Sound Design & DJ Suites",
  "Historic Estates & Venues",
];

const companyLinks = [
  "About Our Curation",
  "Direct Concierge Contact",
  "Privacy Architecture",
  "Terms & Conditions",
  "Trust & Safety Protocols",
];

const standards = [
  {
    icon: "✔",
    color: "gold",
    title: "VERIFIED GUARANTEE",
    text: "Strict multi-stage credentials vetting and portfolio audit for every partner.",
  },
  {
    icon: "🏷️",
    color: "purple",
    title: "3 FREE BOOKINGS",
    text: "Zero booking fees on your inaugural celebrations with our master concierge.",
  },
];

const socials = [
  { icon: "🔗", label: "Share" },
  { icon: "🌐", label: "Website" },
  { icon: "✉️", label: "Email" },
];

const badges = [
  "Security Certified Escrow",
  "White-Glove Guarantee",
  "Global Concierge Network",
];

// ---------- SMALL COMPONENT ----------
// A column with a title and a list of links
function LinkColumn({ title, links }) {
  return (
    <div className="footer-column">
      <h4>{title}</h4>
      <ul>
        {links.map((link) => (
          <li key={link}>
            <a href="#">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- MAIN COMPONENT ----------
export default function Footer() {
  // Gets the current year automatically (so you never have to update it)
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* TOP: 4 columns */}
        <div className="footer-top">
          {/* Column 1: brand */}
          <div className="footer-brand">
            <div className="brand-row">
              
               {/* <span className="brand-logo"></span> */}
              <span className="brand-name">Event Connect</span> 
            </div>
            <p>
              The premier marketplace orchestrating bespoke celebrations.
              Verified master cinematographers, floral designers, couture
              planners, and iconic private venues.
            </p>
            <div className="socials">
              {socials.map((item) => (
                <a href="#" key={item.label} aria-label={item.label}>
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: services links */}
          <LinkColumn title="Curation & Services" links={serviceLinks} />

          {/* Column 3: two small cards */}
          <div className="footer-column">
            <h4>Platform Standards</h4>
            {standards.map((item) => (
              <div className="standard-card" key={item.title}>
                <span className={`standard-title ${item.color}`}>
                  {item.icon} {item.title}
                </span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>

          {/* Column 4: company links */}
          <LinkColumn title="Company & Legal" links={companyLinks} />
        </div>

        {/* BOTTOM: copyright + badges */}
        <div className="footer-bottom">
          <p>© {year} Event Connect Technologies Inc. All privileges reserved.</p>
          <ul className="bottom-badges">
            {badges.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
