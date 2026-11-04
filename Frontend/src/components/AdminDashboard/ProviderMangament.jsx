import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/api";
import "./ProviderManagement.css";
import AdminSidebar from "./AdminSidebar";

const notAvailable = "Not available";

function formatDate(value) {
  if (!value) return notAvailable;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? notAvailable
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
}

function ProviderManagement() {
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    adminApi.getProviders()
      .then((response) => {
        if (!Array.isArray(response?.providers)) {
          throw new Error("The server returned an invalid providers response.");
        }
        if (response.providers.some((provider) => !provider?._id)) {
          throw new Error("The server returned a provider without an ID.");
        }
        if (!active) return;
        setProviders(response.providers);
        setSelectedProviderId(response.providers[0]?._id || null);
      })
      .catch((requestError) => {
        if (!active) return;
        setProviders([]);
        setSelectedProviderId(null);
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const categories = useMemo(
    () => [...new Set(providers.map((provider) => provider.profile?.businessCategory).filter(Boolean))].sort(),
    [providers]
  );
  const filteredProviders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return providers.filter((provider) => {
      const profile = provider.profile;
      const searchable = [
        provider.username,
        provider.email,
        provider.phone,
        provider._id,
        profile?.businessName,
        profile?.businessCategory,
        profile?.location,
        profile?.businessAddress,
      ].filter(Boolean).join(" ").toLowerCase();
      return searchable.includes(query) &&
        (category === "All Categories" || profile?.businessCategory === category);
    });
  }, [providers, search, category]);

  const selectedProvider = providers.find(
    (provider) => String(provider._id) === String(selectedProviderId)
  ) || null;
  const totalServices = providers.reduce(
    (total, provider) => total + (Array.isArray(provider.services) ? provider.services.length : 0),
    0
  );
  const providersWithProfiles = providers.filter((provider) => provider.profile).length;

  function exportProviders() {
    const headers = [
      "Provider ID",
      "Provider Name",
      "Email",
      "Phone",
      "Registration Date",
      "Business Name",
      "Business Category",
      "Location",
      "Service Count",
    ];
    const rows = filteredProviders.map((provider) => [
      provider._id,
      provider.username || notAvailable,
      provider.email || notAvailable,
      provider.phone || notAvailable,
      formatDate(provider.createdAt),
      provider.profile?.businessName || notAvailable,
      provider.profile?.businessCategory || notAvailable,
      provider.profile?.location || provider.profile?.businessAddress || notAvailable,
      Array.isArray(provider.services) ? provider.services.length : 0,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "event-connect-providers.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setSearch("");
    setCategory("All Categories");
  }

  return (
    <div className="provider-dashboard">
      <AdminSidebar />
      <main className="provider-main">
        <header className="provider-topbar">
          <div className="provider-top-search">
            <span>⌕</span>
            <input placeholder="Search users, bookings, providers..." aria-label="Search dashboard" />
          </div>
          <div className="provider-system-status">
            <span className="provider-online-dot"></span>
            Production System
          </div>
          <button className="provider-notification" type="button" aria-label="Notifications">♧</button>
          <div className="provider-admin-profile">
            <div className="provider-admin-avatar">DS</div>
            <div><strong>Super Admin</strong><small>Platform Administrator</small></div>
          </div>
        </header>

        <section className="provider-page-heading">
          <div>
            <div className="provider-title-row">
              <h1>Provider Management</h1>
              <span className="provider-version">PROVIDER REGISTRY</span>
            </div>
            <p>View provider accounts and business information stored on the platform.</p>
          </div>
          <div className="provider-heading-actions">
            <button className="provider-export-btn" type="button" onClick={exportProviders} disabled={loading || Boolean(error)}>
              ⇧ Export Providers
            </button>
          </div>
        </section>

        <section className="provider-stats-grid">
          <div className="provider-stat-card">
            <div className="provider-stat-top"><span>TOTAL PROVIDERS</span><div className="provider-stat-icon purple-icon">♧</div></div>
            <h2>{loading || error ? notAvailable : providers.length.toLocaleString()}</h2>
            <p className="provider-stat-green">Provider accounts in MongoDB</p>
          </div>
          <div className="provider-stat-card">
            <div className="provider-stat-top"><span>BUSINESS PROFILES</span><div className="provider-stat-icon green-icon">✓</div></div>
            <h2>{loading || error ? notAvailable : providersWithProfiles.toLocaleString()}</h2>
            <p className="provider-stat-green">Profiles linked to provider accounts</p>
          </div>
          <div className="provider-stat-card">
            <div className="provider-stat-top"><span>SERVICE LISTINGS</span><div className="provider-stat-icon yellow-icon">◷</div></div>
            <h2>{loading || error ? notAvailable : totalServices.toLocaleString()}</h2>
            <p className="provider-stat-yellow">Listings linked to these providers</p>
          </div>
          <div className="provider-stat-card">
            <div className="provider-stat-top"><span>VERIFICATION STATUS</span><div className="provider-stat-icon red-icon">⚑</div></div>
            <h2 className="provider-unavailable">{notAvailable}</h2>
            <p className="provider-stat-red">Not stored for provider accounts</p>
          </div>
          <div className="provider-stat-card">
            <div className="provider-stat-top"><span>MEMBERSHIP STATUS</span><div className="provider-stat-icon orange-icon">♢</div></div>
            <h2 className="provider-unavailable">{notAvailable}</h2>
            <p className="provider-stat-yellow">Not stored in the current schema</p>
          </div>
        </section>

        <section className="provider-filter-card">
          <div className="provider-filter-row">
            <div className="provider-search-box">
              <span>⌕</span>
              <input
                placeholder="Search providers..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search providers"
              />
            </div>
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by business category">
              <option>All Categories</option>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <button className="provider-reset-btn" type="button" onClick={resetFilters} aria-label="Reset filters">↻</button>
          </div>
        </section>

        <section className="provider-content">
          <div className="provider-table-card">
            <div className="provider-table-scroll">
              <table className="provider-table">
                <thead>
                  <tr>
                    <th>PROVIDER ID</th>
                    <th>PROVIDER & BUSINESS</th>
                    <th>CATEGORY</th>
                    <th>SERVICES</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="5" className="provider-empty">Loading providers...</td></tr>}
                  {!loading && error && (
                    <tr>
                      <td colSpan="5" className="provider-empty provider-load-error">
                        <span>{error}</span>
                        <button className="provider-retry-btn" type="button" onClick={() => setReloadKey((key) => key + 1)}>Retry</button>
                      </td>
                    </tr>
                  )}
                  {!loading && !error && filteredProviders.map((provider) => {
                    const businessName = provider.profile?.businessName || notAvailable;
                    const categoryName = provider.profile?.businessCategory || notAvailable;
                    return (
                      <tr
                        key={provider._id}
                        onClick={() => setSelectedProviderId(provider._id)}
                        className={String(selectedProviderId) === String(provider._id) ? "provider-selected-row" : ""}
                      >
                        <td><span className="provider-id">#{provider._id}</span></td>
                        <td>
                          <div className="provider-business-cell">
                            <div className="provider-business-avatar">{(businessName !== notAvailable ? businessName : provider.username || "?").charAt(0).toUpperCase()}</div>
                            <div><strong>{businessName}</strong><small>{provider.username || notAvailable}</small></div>
                          </div>
                        </td>
                        <td><span className="provider-category-badge">{categoryName}</span></td>
                        <td>{Array.isArray(provider.services) ? provider.services.length : 0}</td>
                        <td><span className="provider-status provider-status-unavailable">{notAvailable}</span></td>
                      </tr>
                    );
                  })}
                  {!loading && !error && filteredProviders.length === 0 && (
                    <tr>
                      <td colSpan="5" className="provider-empty">
                        {providers.length === 0 ? "No provider records found." : "No providers match your search."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="provider-table-footer">
              <span>Showing {loading || error ? 0 : filteredProviders.length} of {loading || error ? 0 : providers.length} providers</span>
            </div>
          </div>

          {selectedProvider && !error && (
            <aside className="provider-details-card">
              <div className="provider-details-heading">
                <div className="provider-details-avatar">
                  {(selectedProvider.profile?.businessName || selectedProvider.username || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{selectedProvider.profile?.businessName || selectedProvider.username || notAvailable}</h3>
                  <span className="provider-detail-id">#{selectedProvider._id}</span>
                  <div className="provider-detail-badges">
                    <span>{selectedProvider.profile?.businessCategory || notAvailable}</span>
                    <span className="provider-status-unavailable">{notAvailable}</span>
                  </div>
                </div>
              </div>

              <div className="provider-info-box">
                <div><small>Provider Account</small><strong>{selectedProvider.username || notAvailable}</strong></div>
                <div><small>Email</small><strong>{selectedProvider.email || notAvailable}</strong></div>
                <div><small>Phone</small><strong>{selectedProvider.phone || notAvailable}</strong></div>
                <div><small>Registered</small><strong>{formatDate(selectedProvider.createdAt)}</strong></div>
                <div><small>Business Email</small><strong>{selectedProvider.profile?.businessEmail || notAvailable}</strong></div>
                <div><small>Business Phone</small><strong>{selectedProvider.profile?.businessPhone || notAvailable}</strong></div>
                <div><small>Location</small><strong>{selectedProvider.profile?.location || selectedProvider.profile?.businessAddress || notAvailable}</strong></div>
                <div><small>Website</small><strong>{selectedProvider.profile?.website || notAvailable}</strong></div>
              </div>

              <div className="provider-description">
                <h4>BUSINESS DESCRIPTION</h4>
                <p>{selectedProvider.profile?.businessDescription || notAvailable}</p>
              </div>

              <div className="provider-verification">
                <div className="provider-section-title">
                  <h4>SERVICE LISTINGS</h4>
                  <span>{Array.isArray(selectedProvider.services) ? selectedProvider.services.length : 0}</span>
                </div>
                {Array.isArray(selectedProvider.services) && selectedProvider.services.length > 0
                  ? selectedProvider.services.map((service) => (
                    <div className="provider-document" key={service._id}>
                      <span className="document-icon">•</span>
                      <div>
                        <strong>{service.title || notAvailable}</strong>
                        <small>
                          {[service.category, service.price !== undefined ? `${service.price} ${service.priceUnit || ""}`.trim() : null, service.status]
                            .filter(Boolean).join(" · ") || notAvailable}
                        </small>
                      </div>
                    </div>
                  ))
                  : <p className="provider-empty">No service listings found.</p>}
              </div>
            </aside>
          )}
        </section>
      </main>
    </div>
  );
}

export default ProviderManagement;
