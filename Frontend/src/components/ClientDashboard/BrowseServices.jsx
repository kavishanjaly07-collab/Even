import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { bookingApi, serviceApi } from "../../services/api";
import "./BrowseServices.css";
import "./EventConnectBookings.css";
import ClientSidebar from "./ClientSidebar";

const categoryIcon = (category) => {
  const value = category.toLowerCase();
  if (value.includes("photo")) return "📸";
  if (value.includes("decor") || value.includes("flower")) return "💐";
  if (value.includes("cater")) return "🍽️";
  if (value.includes("cake") || value.includes("sweet")) return "🎂";
  if (value.includes("makeup")) return "💄";
  if (value.includes("music") || value.includes("dance")) return "🎭";
  return "✦";
};

export default function BrowseServices() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Recommended");
  const [favorites, setFavorites] = useState([]);
  const [notice, setNotice] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    eventDate: "",
    location: "",
    additionalRequirements: "",
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");

    serviceApi.getPublicServices()
      .then(({ services: currentServices }) => {
        if (!Array.isArray(currentServices)) {
          throw new Error("The service directory returned an invalid response.");
        }
        if (active) setServices(currentServices);
      })
      .catch((requestError) => {
        if (active) setLoadError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const filteredServices = useMemo(() => {
    let result = services.filter((service) => {
      const inCategory = activeCategory === "All" || activeCategory === service.category;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        service.title.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        (service.description || "").toLowerCase().includes(query) ||
        (service.provider?.businessName || "").toLowerCase().includes(query);
      return inCategory && matchesSearch;
    });

    if (sortBy === "Price: low to high") result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "Price: high to low") result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [services, activeCategory, search, sortBy]);
  const categories = useMemo(
    () => [...new Set(services.map((service) => service.category).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right))
      .map((name) => ({ name, icon: categoryIcon(name) })),
    [services]
  );

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleAction = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  function openBookingForm(service) {
    setSelectedService(service);
    setBookingForm({ eventDate: "", location: "", additionalRequirements: "" });
    setBookingError("");
  }

  async function submitBooking(event) {
    event.preventDefault();
    if (!selectedService) return;

    setBookingSubmitting(true);
    setBookingError("");
    try {
      await bookingApi.create({
        serviceId: selectedService._id,
        ...bookingForm,
      });
      setSelectedService(null);
      setBookingForm({ eventDate: "", location: "", additionalRequirements: "" });
      handleAction("Booking request submitted successfully.");
    } catch (requestError) {
      setBookingError(requestError.message);
    } finally {
      setBookingSubmitting(false);
    }
  }

  return (
    <div className="bs-app">
      <ClientSidebar
        onHelp={() => handleAction("Support requests are not available through the current backend.")}
        onLogout={() => {
          clearSession();
          navigate("/login", { replace: true });
        }}
      />

      <main className="bs-main">
        <header className="topbar">
          <div className="top-search">
            <span>⌕</span>
            <input
              aria-label="Search services"
              placeholder="Search services, verified vendors, cakes, catering..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <kbd>⌘ K</kbd>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications" onClick={() => handleAction("Notifications are not configured in the backend.")}>♧<i /></button>
            <button className="icon-button" aria-label="Messages" onClick={() => navigate("/Messages")}>▤</button>
            <div className="profile-mini">
              <div className="avatar">{user?.username?.charAt(0).toUpperCase() || "A"}</div>
              <div><strong>{user?.username || "Customer"}</strong><small>Customer</small></div>
              <span className="chevron">⌄</span>
            </div>
          </div>
        </header>

        <section className="intro-panel">
          <div className="intro-copy">
            <div className="eyebrow"><span>CURATED EXPERIENCES</span> Artisan Collective / Where Moments Become</div>
            <h1>Curated Event Artisans &amp; Services</h1>
            <p>Find exceptional professionals to make your next event unforgettable.</p>
          </div>
          <div className="intro-right">
            <span className="online-count">
              {loading ? "Loading available services..." : loadError ? "Service directory unavailable" : `${services.length} active services`}
            </span>
          </div>
          <div className="discovery-search">
            <span className="search-symbol">⌕</span>
            <input
              placeholder="Search by vendor name, service, or keyword (e.g. Vintage Photobooth, Vegan Catering, Silk...)"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button onClick={() => document.querySelector(".services-grid")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Discover <span>→</span></button>
          </div>
          <div className="filter-row">
            <select className="filter-chip" value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)} aria-label="Filter by service category">
              <option value="All">All Categories</option>
              {categories.map((category) => <option key={category.name} value={category.name}>{category.name}</option>)}
            </select>
            <select className="filter-chip" value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort services">
              <option>Recommended</option>
              <option>Price: low to high</option>
              <option>Price: high to low</option>
            </select>
          </div>
          <div className="filter-footnote"><span>Reset</span><span>Sorted by: <b>{sortBy}</b></span></div>
        </section>

        <section className="category-section">
          <div className="section-heading">
            <h2><span className="purple-dot" /> Artisan Specialties</h2>
            <button onClick={() => setActiveCategory("All")}>View directory map ↗</button>
          </div>
          <div className="category-list">
            {categories.map((category) => (
              <button
                key={category.name}
                className={`category-card ${activeCategory === category.name ? "chosen" : ""}`}
                onClick={() => setActiveCategory(activeCategory === category.name ? "All" : category.name)}
              >
                <span className="category-icon">{category.icon}</span>
                <strong>{category.name}</strong>
                <small>{services.filter((service) => service.category === category.name).length} Services</small>
              </button>
            ))}
          </div>
        </section>

        <section className="services-section">
          <div className="section-heading service-heading">
            <div>
              <h2><span className="purple-dot" /> Available Services</h2>
              <p>Showing <b>{filteredServices.length}</b> available services</p>
            </div>
            <div className="view-buttons">
              <button className="view-button selected" aria-label="Grid view">▦</button>
              <button className="view-button" aria-label="List view" onClick={() => handleAction("Grid view is currently selected.")}>☷</button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state" role="status">
              <span>⌕</span>
              <h3>Loading available services</h3>
              <p>Please wait while we load services from our providers.</p>
            </div>
          ) : loadError ? (
            <div className="empty-state" role="alert">
              <span>⌕</span>
              <h3>Unable to load services</h3>
              <p>{loadError}</p>
              <button className="primary-button" onClick={() => setRefreshKey((key) => key + 1)}>Try again</button>
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="services-grid">
              {filteredServices.map((service) => (
                <article className="service-card" key={service._id}>
                  <div className="service-image-wrap">
                    <img src={service.image || undefined} alt={service.title} className="service-image" />
                    <button
                      className={`favorite-button ${favorites.includes(service._id) ? "is-favorite" : ""}`}
                      aria-label={favorites.includes(service._id) ? "Remove from favorites" : "Add to favorites"}
                      onClick={() => toggleFavorite(service._id)}
                    >{favorites.includes(service._id) ? "♥" : "♡"}</button>
                    <div className="image-category">{service.category.toUpperCase()}</div>
                  </div>
                  <div className="service-info">
                    <div className="service-title-row">
                      <h3>{service.title}</h3>
                      <span className="rating">Rating not available</span>
                    </div>
                    {service.provider?.businessName && <p className="service-description">By {service.provider.businessName}</p>}
                    <p className="service-description">{service.description || "No description provided."}</p>
                    <div className="service-price-row">
                      <div><small>{service.priceUnit || "Unit not specified"}</small><strong>{service.price === undefined ? "Price not available" : `LKR ${Number(service.price).toLocaleString()}`}</strong></div>
                      <div className="availability">Availability not configured</div>
                    </div>
                    <div className="service-actions">
                      <button className="primary-button" onClick={() => openBookingForm(service)}>Book Now</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>⌕</span>
              <h3>{services.length ? "No services match your filters" : "No active services are available"}</h3>
              <p>{services.length ? "Try changing your search or filters to find available services." : "Check back soon as providers add services to the directory."}</p>
              <button className="primary-button" onClick={() => { setSearch(""); setActiveCategory("All"); setSortBy("Recommended"); }}>Clear filters</button>
            </div>
          )}
          <div className="pagination">
            <span>Showing <b>{filteredServices.length ? `1–${filteredServices.length}` : "0"}</b> of {services.length} services</span>
            <div>
              <button disabled aria-label="Previous page">‹</button>
              <button className="current-page">1</button>
              <button disabled aria-label="Next page">›</button>
            </div>
          </div>
        </section>
      </main>
      {selectedService && (
        <div className="eb-modal-backdrop" onClick={() => setSelectedService(null)} role="presentation">
          <form className="eb-modal" onSubmit={submitBooking} onClick={(event) => event.stopPropagation()}>
            <button className="eb-modal-close" type="button" onClick={() => setSelectedService(null)} aria-label="Close booking form">×</button>
            <div className="eb-eyebrow">BOOKING REQUEST</div>
            <h2>{selectedService.title}</h2>
            <p>{selectedService.category} · LKR {Number(selectedService.price).toLocaleString()} {selectedService.priceUnit || ""}</p>
            <label>
              Event date
              <input
                type="date"
                value={bookingForm.eventDate}
                onChange={(event) => setBookingForm((current) => ({ ...current, eventDate: event.target.value }))}
                required
              />
            </label>
            <label>
              Event location
              <input
                value={bookingForm.location}
                onChange={(event) => setBookingForm((current) => ({ ...current, location: event.target.value }))}
                required
              />
            </label>
            <label>
              Additional requirements
              <textarea
                rows="3"
                value={bookingForm.additionalRequirements}
                onChange={(event) => setBookingForm((current) => ({ ...current, additionalRequirements: event.target.value }))}
                placeholder="Tell the provider about your event..."
              />
            </label>
            {bookingError && <p role="alert">{bookingError}</p>}
            <button type="submit" className="eb-new-booking" disabled={bookingSubmitting}>
              {bookingSubmitting ? "Submitting..." : "Submit Booking Request"}
            </button>
          </form>
        </div>
      )}
      {notice && <div className="ec-toast" role="status">{notice}</div>}
    </div>
  );
}
