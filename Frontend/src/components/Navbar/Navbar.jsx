import { useState } from "react";
import { Bell } from "lucide-react";
import { portalTabs, navLinks } from "../../data/siteData";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";


export default 
function Navbar() {
  const [activePortal, setActivePortal] = useState(portalTabs[0]);
  const [activeLink, setActiveLink] = useState("Providers");
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <img src="./src/assets/logo.jpg" alt="Logo" className="navbar__logo" />

      <div className="navbar__portals">
        {portalTabs.map((tab) => (
          <button
            key={tab}
            className={`navbar__portal ${activePortal === tab ? "is-active" : ""}`}
            onClick={() => {
              setActivePortal(tab);
              if (tab === "Admin Suite") navigate("/admin/login");
            }}
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
        <button className="btn btn--outline-gold"
        onClick={()=> navigate("/login")}>Login</button>
        {/* <Link to="/login" className="btn btn--outline-gold">
          Login
        </Link>
        <Link to="/" className="btn btn--outline">
          Home
        </Link> */}
         <button className="btn btn--outline" onClick={() => navigate("/register")}>Register</button> 
        <button className="btn btn--plum btn--sm">Book Services</button>
        <button className="navbar__bell" aria-label="Notifications">
          <Bell size={16} />
          <span className="navbar__dot" />
        </button>
      </div>
    </header>
  );
}
