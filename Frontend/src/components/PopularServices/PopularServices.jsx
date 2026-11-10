
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { serviceApi } from "../../services/api";
import "./PopularServices.css";

function ServiceCard({ service }) {
  const price = Number(service.price);

  return (
    <article className="service-card">
      <div
        className="service-image"
        style={
          service.image
            ? { backgroundImage: `url(${service.image})` }
            : undefined
        }
      >
        <span className="verified">
          <span className="check">✔</span> Active Service
        </span>
      </div>

      <div className="service-body">
        <h3>{service.title}</h3>

        <p>
          {service.description || "No description available."}
        </p>

        <div className="service-footer">
          <div>
            <span className="price-label">
              {service.priceUnit || "Starting Price"}
            </span>

            <strong className="price">
              {Number.isFinite(price)
                ? `LKR ${price.toLocaleString()}`
                : "Price not available"}
            </strong>
          </div>

          <Link to="/BrowseServices" className="book-btn">
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function PopularServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        setLoading(true);
        setError("");

        const response = await serviceApi.getPublicServices();

        if (!Array.isArray(response.services)) {
          throw new Error("Invalid services response from backend.");
        }

        if (active) {
          setServices(response.services.slice(0, 4));
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load services.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="popular-services" className="popular-section">
      <div className="popular-inner">

        <div className="popular-heading">
          <span className="eyebrow">IN HIGH DEMAND</span>

          <h2>Popular Celebration Services</h2>

          <p>
            Book top-rated, meticulously reviewed experiences configured for
            flawless milestone celebrations.
          </p>
        </div>

        {loading ? (
          <p>Loading services...</p>
        ) : error ? (
          <div role="alert">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        ) : services.length > 0 ? (
          <div className="service-grid">
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
              />
            ))}
          </div>
        ) : (
          <p>No active services available yet.</p>
        )}

      </div>
    </section>
  );
}
