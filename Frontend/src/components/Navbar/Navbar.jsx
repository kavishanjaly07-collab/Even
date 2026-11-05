import { Bell } from "lucide-react";
import { useState } from "react";
import { navLinks } from "../../data/siteData";
import BrandLogo from "../BrandLogo";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";


export default 
function Navbar() {
  const [activeLink, setActiveLink] = useState("Services");
  const navigate = useNavigate();
  const destinations = {
    Services: { sectionId: "popular-services" },
    "How It Works": { sectionId: "how-it-works" },
    Categories: { sectionId: "categories" },
  };

  return (
    <header className="navbar">
      <BrandLogo className="navbar__logo" />

      <nav className="navbar__links">
        {navLinks.map((link) => (
          <a
            key={link}
            href={destinations[link].path || `#${destinations[link].sectionId}`}
            className={`navbar__link ${activeLink === link ? "is-active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveLink(link);
              const destination = destinations[link];
              if (destination.path) {
                navigate(destination.path);
                return;
              }

              document
                .getElementById(destination.sectionId)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
              window.history.replaceState(null, "", `#${destination.sectionId}`);
            }}
          >
            {link}
          </a>
        ))}
      </nav>

      <div className="navbar__actions">
        <button className="btn btn--outline-gold"
        onClick={()=> navigate("/login")}>Login</button>
        {/* <Link to="/login" className="btn btn--outline-gold">
          Login
        </Link>
        <Link to="/" className="btn btn--outline">
          Home
        </Link> */}
         <button className="btn btn--outline" onClick={() => navigate("/register")}>Register</button> 
        {/* <button className="btn btn--plum btn--sm">Book Services</button> */}
        <button className="navbar__bell" aria-label="Notifications">
          <Bell size={16} />
          <span className="navbar__dot" />
        </button>
      </div>
    </header>
  );
}
