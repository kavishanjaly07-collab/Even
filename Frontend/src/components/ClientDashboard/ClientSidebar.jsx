import { NavLink } from "react-router-dom";
import {
  CalendarDays,
  Home,
  LogOut,
  MessageCircle,
  Search,
  Star,
  UserRound,
  WalletCards,
} from "lucide-react";
import BrandLogo from "../BrandLogo";
import "./ClientSidebar.css";

const links = [
  { label: "Overview", to: "/CustomerHome", icon: Home, end: true },
  { label: "Browse Services", to: "/BrowseServices", icon: Search },
  { label: "My Bookings", to: "/MyBookings", icon: CalendarDays },
  { label: "Payments & Budget", to: "/PaymentsBudget", icon: WalletCards },
  { label: "Messages", to: "/Messages", icon: MessageCircle },
  { label: "My Reviews", to: "/MyReviews", icon: Star },
  { label: "My Profile", to: "/MyProfile", icon: UserRound },
];

export default function ClientSidebar({ onHelp, onLogout }) {
  return (
    <aside className="client-sidebar">
      <div className="client-sidebar-brand">
        <BrandLogo className="client-sidebar-brand-mark" />
        <span className="client-sidebar-brand-copy">
          <strong>Event Connect</strong>
          <small>PREMIER ATELIER</small>
        </span>
      </div>

      <nav className="client-sidebar-nav" aria-label="Client dashboard navigation">
        {links.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `client-sidebar-link${isActive ? " is-active" : ""}`
            }
          >
            <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="client-sidebar-bottom">
        <section className="client-sidebar-help">
          <strong><span aria-hidden="true">✺</span> Concierge Help</strong>
          <p>Need private styling or vendor coordination assistance?</p>
          <button type="button" onClick={onHelp}>Connect Live</button>
        </section>
        <button className="client-sidebar-logout" type="button" onClick={onLogout}>
          <LogOut size={15} aria-hidden="true" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
