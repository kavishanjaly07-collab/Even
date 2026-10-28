import { useState } from "react";
import { Bell } from "lucide-react";
import { portalTabs, navLinks } from "../../data/siteData";
import "./Navbar.css";


export default function Navbar() {
  // useState remembers which tab / link is currently selected.
  const [activePortal, setActivePortal] = useState(portalTabs[0]);
  const [activeLink, setActiveLink] = useState("Providers");

  return (
    <header className="navbar">
      <a href="/" className="navbar__logo" aria-label="Haute Events home">
        HE
      </a>

      <div className="navbar__portals">
        {portalTabs.map((tab) => (
          <button
            key={tab}
            className={`navbar__portal ${activePortal === tab ? "is-active" : ""}`}
            onClick={() => setActivePortal(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <nav className="navbar__links">
        {navLinks.map((link) => (
          <a
            key={link}
            href="#"
            className={`navbar__link ${activeLink === link ? "is-active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveLink(link);
            }}
          >
            {link}
          </a>
        ))}
      </nav>

      <div className="navbar__actions">
        <button className="btn btn--outline-gold">Become a Provider</button>
        <button className="btn btn--plum btn--sm">Book Services</button>
        <button className="navbar__bell" aria-label="Notifications">
          <Bell size={16} />
          <span className="navbar__dot" />
        </button>
      </div>
    </header>
  );
}
