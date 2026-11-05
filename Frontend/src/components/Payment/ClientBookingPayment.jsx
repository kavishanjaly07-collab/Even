
import { Link, useLocation, Navigate } from "react-router-dom";
import "./Payment.css";

export default function ClientBookingPayment() {
  const { state } = useLocation();

  if (state?.source !== "client-booking-limit") {
    return <Navigate to="/BrowseServices" replace />;
  }

  return (
    <div className="payment-page">
      <section className="payment-card">
        <p className="payment-eyebrow">EVENT CONNECT</p>

        <h1>Booking Payment Required</h1>

        <p className="payment-message">
          You have completed your first 5 free bookings.
          Payment is required to make additional bookings.
        </p>

        <div className="payment-service-summary">
          <strong>{state.serviceTitle}</strong>

          <span>
            Total bookings used: {state.totalBookings}
          </span>

          <p>
            This payment is required to continue booking services.
          </p>
        </div>

        <div className="payment-placeholder">
          <strong>Payment gateway integration coming soon</strong>

          <span>
            No payment has been taken. Your sixth booking has not been created.
          </span>
        </div>

        <div className="payment-actions">
          <Link className="payment-home-link" to="/BrowseServices">
            Back to Browse Services
          </Link>

          <Link className="payment-back-link" to="/CustomerHome">
            Back to Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
