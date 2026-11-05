import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { serviceApi } from "../../services/api";
import "./Payment.css";

export default function Payment() {
  const { state } = useLocation();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [serviceError, setServiceError] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [subscriptionError, setSubscriptionError] = useState("");

  useEffect(() => {
    let active = true;
    if (!state?.serviceId) return undefined;

    serviceApi.getMine(state.serviceId)
      .then(({ service: currentService }) => {
        if (active) setService(currentService);
      })
      .catch((error) => {
        if (active) setServiceError(error.message);
      });

    return () => {
      active = false;
    };
  }, [state?.serviceId]);

  useEffect(() => {
    let active = true;
    serviceApi.getProviderStatus()
      .then((status) => {
        if (active) setSubscription(status.subscription);
      })
      .catch((error) => {
        if (active) setSubscriptionError(error.message);
      });

    return () => {
      active = false;
    };
  }, []);

  const isPublishing = state?.source === "publish-service";

  return (
    <div className="payment-page">
      <section className="payment-card" aria-labelledby="payment-title">
        <p className="payment-eyebrow">SERVICE PROVIDER</p>
        <h1 id="payment-title">{isPublishing ? "Subscription Required to Publish" : "Service Registration Payment"}</h1>
        <p className="payment-message">
          {isPublishing
            ? subscription?.status === "Expired"
              ? "Your subscription has expired. Renew it before publishing this service."
              : "An active subscription is required to publish this service. You can continue adding up to five services for free."
            : "No subscription payment is required to add a service. Add up to five services for free; an active subscription is required to publish them."}
        </p>
        {isPublishing && (
          <div className="payment-service-summary">
            {serviceError ? (
              <p role="alert">{serviceError}</p>
            ) : service ? (
              <>
                <strong>{service.title}</strong>
                <span>{service.category} · LKR {Number(service.price).toLocaleString("en-US")} {service.priceUnit || ""}</span>
                <p>{service.description || "No description provided."}</p>
                <small>Service ID: {service._id}</small>
              </>
            ) : (
              <span role="status">Loading selected service...</span>
            )}
          </div>
        )}
        {subscriptionError ? (
          <p className="payment-error" role="alert">{subscriptionError}</p>
        ) : subscription && (
          <dl className="payment-plan">
            <div><dt>Subscription status</dt><dd>{subscription.status}</dd></div>
            <div><dt>Plan</dt><dd>{subscription.planName || "Not configured"}</dd></div>
            <div>
              <dt>Plan amount</dt>
              <dd>
                {subscription.amount == null
                  ? "Not configured"
                  : `${subscription.currency || ""} ${Number(subscription.amount).toLocaleString("en-US")}`.trim()}
              </dd>
            </div>
          </dl>
        )}
        <div className="payment-placeholder" role="status">
          <strong>Payment gateway integration coming soon</strong>
          <span>No payment has been taken, no subscription status has been changed, and no service has been published.</span>
        </div>
        {state?.providerId || user?.id ? (
          <p className="payment-reference">Provider ID: {state?.providerId || user.id}</p>
        ) : null}
        <div className="payment-actions">
          <Link className="payment-home-link" to="/MyServices">Back to My Services</Link>
          <Link className="payment-back-link" to="/ProviderHome">Back to Dashboard</Link>
        </div>
      </section>
    </div>
  );
}
