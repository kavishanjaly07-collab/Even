import { useEffect, useState } from "react";
import { adminApi } from "../../services/api";
import AdminSidebar from "./AdminSidebar";
import "./Platformsettings.css";

const SETTING_GROUPS = [
  {
    title: "General & Regional Settings",
    items: ["Platform identity and support contacts", "Currency and timezone", "Maintenance mode"],
  },
  {
    title: "Business Rules",
    items: ["Commission and platform fees", "Escrow and payout rules", "Vendor subscriptions"],
  },
  {
    title: "Payments & Security",
    items: ["Payment gateway configuration", "Admin security policies"],
  },
];

export default function PlatformSettings() {
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadState("loading");
    setError("");

    adminApi.getPlatformSettings()
      .then((response) => {
        if (!response.success || typeof response.available !== "boolean") {
          throw new Error("The platform settings response was invalid.");
        }
        if (active) setLoadState(response.available ? "available" : "empty");
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message);
        setLoadState("error");
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  return (
    <div className="ps">
      <AdminSidebar />

      <main className="ps-main">
        <header className="ps-top">
          <h1>Platform Settings</h1>
        </header>

        <section className="ps-head">
          <div>
            <p className="lede">
              Values are shown only when they are saved in the platform settings store. Protected environment credentials are never displayed here.
            </p>
          </div>
        </section>

        {loadState === "loading" && (
          <section className="panel" role="status">Loading platform settings…</section>
        )}

        {loadState === "error" && (
          <section className="panel notice" role="alert">
            <strong>Platform settings could not be loaded.</strong>
            <p>{error}</p>
            <button className="btn btn--primary" onClick={() => setRetryCount((count) => count + 1)}>
              Retry
            </button>
          </section>
        )}

        {loadState === "empty" && (
          <>
            <section className="panel notice" role="status">
              <strong>Settings status loaded from the admin API.</strong>
              <p>No database-backed platform settings are configured. Values and update controls are unavailable until the application has a persisted settings model.</p>
            </section>
            <div className="ps-left">
              {SETTING_GROUPS.map(({ title, items }) => (
                <section className="panel" key={title}>
                  <h2>{title}</h2>
                  <ul className="list list--stack">
                    {items.map((item) => (
                      <li key={item}>
                        <strong>{item}</strong>
                        <small>{title === "Payments & Security" && item.startsWith("Payment gateway") ? "Not Available" : "Not Configured"}</small>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}

        {loadState === "available" && (
          <section className="panel notice" role="status">
            <strong>Settings are available but cannot be edited.</strong>
            <p>The backend reported configured platform settings, but does not support safe reading or updates for them.</p>
          </section>
        )}
      </main>
    </div>
  );
}
