import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../services/api";
import "./Paymentcommission.css";
import AdminSidebar from "./AdminSidebar";

const TABS = ["Payment Records", "Commission Information"];

export default function PaymentsCommission() {
  const { user } = useAuth();
  const [tab, setTab] = useState(TABS[0]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    adminApi.getPayments()
      .then((response) => {
        if (!Array.isArray(response?.payments) || typeof response.count !== "number") {
          throw new Error("The server returned an invalid payment response.");
        }
        if (!active) return;
        setPayments(response.payments);
      })
      .catch((requestError) => {
        if (!active) return;
        setPayments([]);
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return payments.filter((payment) =>
      JSON.stringify(payment).toLowerCase().includes(query)
    );
  }, [payments, search]);

  return (
    <div className="pc">
      <AdminSidebar />
      <main className="pc-main">
        <header className="pc-top">
          <input
            className="pc-search"
            placeholder="Search payment records..."
            aria-label="Search payment records"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span className="env">MongoDB financial records</span>
          <div className="pc-user">
            <span className="avatar">{user?.username?.charAt(0).toUpperCase() || "A"}</span>
            <div><strong>{user?.username || "Administrator"}</strong><small>Platform Administrator</small></div>
          </div>
        </header>

        <section className="pc-head">
          <div>
            <h1>Payments &amp; Commission</h1>
            <p className="lede">View stored payment and commission information. No financial records or gateway integration are currently configured.</p>
          </div>
          <div className="actions">
            <button className="btn btn--ghost" type="button" disabled={loading || Boolean(error) || payments.length === 0}>
              Export CSV
            </button>
          </div>
        </section>

        <section className="rate panel">
          <div>
            <strong>Commission rules: Not available</strong>
            <p>No commission model or stored commission calculation rule exists. No commission rate or earnings are assumed.</p>
          </div>
        </section>

        <section className="kpis">
          <article className="kpi">
            <p>Payment Transactions</p>
            <strong>{loading || error ? "Not available" : payments.length.toLocaleString()}</strong>
            <small>{loading ? "Loading payment records..." : error ? "Unable to verify payment records" : payments.length === 0 ? "No payment records found" : "Stored records"}</small>
          </article>
          <article className="kpi"><p>Successful Payments</p><strong>Not available</strong><small>Payment status schema is not configured</small></article>
          <article className="kpi"><p>Collected Amount</p><strong>Not available</strong><small>No payment amount records available</small></article>
          <article className="kpi"><p>Commissions</p><strong>Not available</strong><small>No commission records or rule</small></article>
          <article className="kpi"><p>Provider Payouts</p><strong>Not available</strong><small>No payout workflow or records</small></article>
          <article className="kpi kpi--danger"><p>Refunds</p><strong>Not available</strong><small>No refund workflow or records</small></article>
        </section>

        <div className="pc-row">
          <section className="panel">
            <h2>Payment Activity</h2>
            <p className="financial-empty">
              {loading ? "Loading payment records..." : error ? "Unable to load financial data. Please try again." : "No payment records found."}
            </p>
          </section>
          <section className="panel">
            <h2>Gateway Integration</h2>
            <p className="financial-empty">No payment gateway or transaction integration is configured.</p>
          </section>
        </div>

        {error && (
          <div className="financial-feedback" role="alert">
            <span>Unable to load financial data. Please try again. {error}</span>
            <button className="btn btn--ghost" type="button" onClick={() => setReloadKey((key) => key + 1)}>Retry</button>
          </div>
        )}

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

        <div className="pc-split">
          <section className="panel">
            <h2>{tab === "Payment Records" ? "Payment Records" : "Commission Records"}</h2>
            {loading ? (
              <p className="financial-empty">Loading payment records...</p>
            ) : error ? (
              <p className="financial-empty">Unable to load financial data. Please try again.</p>
            ) : tab === "Commission Information" ? (
              <p className="financial-empty">No commission records found. Commission management is unavailable because no commission model or rule exists.</p>
            ) : filteredPayments.length === 0 ? (
              <p className="financial-empty">{payments.length === 0 ? "No payment records found." : "No payment records match your search."}</p>
            ) : (
              <p className="financial-empty">Payment records exist, but their schema is not configured for display.</p>
            )}
          </section>

          <aside className="panel dossier" aria-label="Payment details">
            <small>Financial record</small>
            <h2>Details unavailable</h2>
            <p className="financial-empty">
              {tab === "Payment Records"
                ? "No payment record is available to inspect."
                : "No commission record is available to inspect."}
            </p>
            <p className="alert">Refunds, payouts, escrow releases, and payment status updates are unavailable because no payment gateway or financial workflow is configured.</p>
          </aside>
        </div>
      </main>
    </div>
  );
}
