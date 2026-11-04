import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Subscriptionmanagement.css";
import AdminSidebar from "./AdminSidebar";

const TABS = ["Membership Plans", "Provider Subscriptions", "Subscription Payments & Events"];

export default function SubscriptionManagement() {
  const { user } = useAuth();
  const [tab, setTab] = useState(TABS[0]);
  const [search, setSearch] = useState("");

  return (
    <div className="sb">
      <AdminSidebar />

      <main className="sb-main">
        <header className="sb-top">
          <input
            className="sb-search"
            placeholder="Search providers, plans, invoices…"
            aria-label="Search subscription records"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span className="env">Subscription data unavailable</span>
          <div className="sb-user">
            <span className="avatar">{user?.username?.charAt(0).toUpperCase() || "A"}</span>
            <div><strong>{user?.username || "Administrator"}</strong><small>Platform Administrator</small></div>
          </div>
        </header>

        <section className="sb-head">
          <div>
            <h1>Subscription Management</h1>
            <p className="lede">Subscription records, plans, and billing workflows are not configured in the current backend.</p>
          </div>
        </section>

        <section className="continuity panel">
          <div>
            <strong>Subscription data source unavailable</strong>
            <p>No Subscription or Plan model, MongoDB collection, API, or subscription workflow was found. No plan, status, payment, renewal, or access policy is assumed.</p>
          </div>
          <div className="fixed"><small>Platform commission</small><strong>Not available</strong></div>
        </section>

        <section className="stats">
          <article className="stat"><p>Total Subscriptions</p><strong>Not available</strong><small>No subscription records are defined</small></article>
          <article className="stat"><p>Active Subscriptions</p><strong>Not available</strong><small>No subscription status field exists</small></article>
          <article className="stat"><p>Renewals Due</p><strong>Not available</strong><small>No renewal date or workflow exists</small></article>
          <article className="stat stat--warn"><p>Expired Subscriptions</p><strong>Not available</strong><small>No expiry field exists</small></article>
          <article className="stat stat--danger"><p>Subscription Revenue</p><strong>Not available</strong><small>No subscription payment records exist</small></article>
        </section>

        <div className="tabs" role="tablist">
          {TABS.map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={tab === item}
              className={tab === item ? "tab is-on" : "tab"}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === "Membership Plans" && (
          <section className="plans">
            <div className="panel subscription-empty">
              <h2>No subscription plans found.</h2>
              <p>There is no Plan model, plans collection, or configured plan catalog in the current project.</p>
            </div>
          </section>
        )}

        {tab === "Provider Subscriptions" && (
          <div className="sb-split">
            <section className="panel">
              <h2>Provider Subscriptions</h2>
              <div className="filters">
                <input
                  className="chip subscription-search"
                  placeholder="Search subscriptions..."
                  aria-label="Search subscriptions"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="scroll">
                <table className="table">
                  <thead>
                    <tr><th scope="col">Provider</th><th scope="col">Plan</th><th scope="col">Renewal</th><th scope="col">Status</th></tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan="4">No subscriptions found.</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="pager"><span>Subscription records unavailable</span></div>
            </section>

            <aside className="panel dossier" aria-label="Subscription details">
              <small>Subscription details</small>
              <h2>Not available</h2>
              <p className="subscription-empty-copy">No subscription record is available to inspect.</p>
              <div className="alert">Renewal, cancellation, plan changes, and payment actions are unavailable because no subscription workflow is configured.</div>
            </aside>
          </div>
        )}

        {tab === "Subscription Payments & Events" && (
          <section className="panel">
            <h2>Subscription Payments &amp; Events</h2>
            <div className="invoices">
              <p className="subscription-empty-copy">No subscription plans found.</p>
              <p className="subscription-empty-copy">No subscription payment records or renewal events found.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
