import { useState } from "react";
import "./Platformsettings.css";
import AdminSidebar from "./AdminSidebar";

const TABS = ["General Settings", "Business Rules", "Payment Gateways", "Regional & Security"];

const RAILS = [
  { key: "payhere", name: "PayHere Gateway", desc: "Cards, wallets and instant bank rails" },
  { key: "combank", name: "Commercial Bank IPG", desc: "Local card acquiring and settlement" },
  { key: "slips", name: "Bank Transfer (SLIPS)", desc: "Manual slip verification and reconciliation" },
];

const HISTORY = [
  ["Commission rate reviewed", "Super Admin · Nov 02"],
  ["Escrow window set to 48h", "Super Admin · Oct 30"],
  ["PayHere keys rotated", "Security bot · Oct 28"],
  ["Support hotline updated", "Admin · Oct 21"],
];

const TIERS = [
  ["Starter Vendor", "LKR 1,500"],
  ["Professional Pro", "LKR 3,500"],
  ["Elite Enterprise", "LKR 6,500"],
];

function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      className={`switch ${checked ? "switch--on" : ""}`} onClick={() => onChange(!checked)} />
  );
}

export default function PlatformSettings() {
  const [tab, setTab] = useState(TABS[0]);
  const [form, setForm] = useState({
    name: "Event Connect Sri Lanka",
    currency: "LKR",
    timezone: "Asia/Colombo (GMT+5:30)",
    support: "support@eventconnect.lk",
    hotline: "+94 11 234 5678",
    commission: 20,
    escrowHours: 48,
    minPayout: 5000,
    maintenance: false,
    rails: { payhere: true, combank: true, slips: false },
    twoFactor: true,
    ipAllow: false,
  });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => { setForm({ ...form, [k]: v }); setSaved(false); };
  const setRail = (k, v) => { setForm({ ...form, rails: { ...form.rails, [k]: v } }); setSaved(false); };
  const commissionOk = form.commission >= 5 && form.commission <= 30;

  return (
    <div className="ps">
      <AdminSidebar />

      <main className="ps-main">
        <header className="ps-top">
          <input className="ps-search" placeholder="Search settings…" aria-label="Search" />
          <span className="env">Production · Sri Lanka (GMT+5:30)</span>
          <div className="ps-user"><span className="avatar">SA</span><div><strong>Dilini</strong><small>Platform Administrator</small></div></div>
        </header>

        <section className="ps-head">
          <div>
            <h1>Platform Settings</h1>
            <p className="lede">Configure business rules, payment rails, regional identity and security policy for the entire marketplace.</p>
          </div>
          <div className="actions">
            <button className="btn btn--ghost">Settings Policy</button>
            <button className="btn btn--primary">Document Change Log</button>
          </div>
        </section>

        <section className="panel notice">
          <strong>High-Impact Marketplace Policy Gating</strong>
          <p>Changes to commission, escrow and payment rails affect every active booking. They are versioned, logged and require a second admin confirmation in production.</p>
        </section>

        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "tab is-on" : "tab"} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        <div className="ps-split">
          <div className="ps-left">
            <section className="panel">
              <h2>General Settings & Regional Identity</h2>
              <div className="grid">
                <label>Platform name<input value={form.name} onChange={(e) => set("name", e.target.value)} /></label>
                <label>Base currency
                  <select value={form.currency} onChange={(e) => set("currency", e.target.value)}><option>LKR</option><option>USD</option></select>
                </label>
                <label>Timezone
                  <select value={form.timezone} onChange={(e) => set("timezone", e.target.value)}><option>Asia/Colombo (GMT+5:30)</option><option>UTC</option></select>
                </label>
                <label>Support email<input type="email" value={form.support} onChange={(e) => set("support", e.target.value)} /></label>
                <label>Support hotline<input value={form.hotline} onChange={(e) => set("hotline", e.target.value)} /></label>
              </div>
              <div className="toggle-row">
                <div><strong>Maintenance mode</strong><small>Pause new bookings while keeping admin access.</small></div>
                <Switch checked={form.maintenance} onChange={(v) => set("maintenance", v)} label="Maintenance mode" />
              </div>
            </section>

            <section className="panel">
              <h2>Business Rules & Marketplace Economics</h2>
              <div className="econ">
                <label className="big">
                  <span>Platform commission</span>
                  <div className="num"><input type="number" min="0" max="50" value={form.commission} onChange={(e) => set("commission", +e.target.value)} aria-invalid={!commissionOk} /><em>%</em></div>
                  {!commissionOk && <small className="err">Allowed range is 5–30%.</small>}
                </label>
                <label className="big">
                  <span>Escrow hold window</span>
                  <div className="num"><input type="number" min="0" value={form.escrowHours} onChange={(e) => set("escrowHours", +e.target.value)} /><em>Hours</em></div>
                </label>
                <label className="big">
                  <span>Minimum payout</span>
                  <div className="num"><em>LKR</em><input type="number" min="0" step="500" value={form.minPayout} onChange={(e) => set("minPayout", +e.target.value)} /></div>
                </label>
              </div>
              <div className="preview">
                <small>Provider payout preview · LKR 100,000 booking</small>
                <strong>LKR {(100000 - (100000 * form.commission) / 100).toLocaleString("en-LK")}</strong>
                <small>Commission: LKR {((100000 * form.commission) / 100).toLocaleString("en-LK")}</small>
              </div>
            </section>

            <section className="panel">
              <h2>Payment & Escrow Rails</h2>
              <ul className="rails">
                {RAILS.map((r) => (
                  <li key={r.key}>
                    <div><strong>{r.name}</strong><small>{r.desc}</small></div>
                    <Switch checked={form.rails[r.key]} onChange={(v) => setRail(r.key, v)} label={r.name} />
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel savebar">
              <span>{saved ? "Changes submitted for confirmation." : "Unsaved changes require second-admin confirmation."}</span>
              <div className="actions">
                <button className="btn btn--ghost" onClick={() => setSaved(false)}>Discard</button>
                <button className="btn btn--amber" disabled={!commissionOk} onClick={() => setSaved(true)}>Submit for Approval</button>
              </div>
            </section>
          </div>

          <aside className="ps-right">
            <section className="panel">
              <h2>Security & Root Admin</h2>
              <div className="toggle-row">
                <div><strong>Two-factor for admins</strong><small>Required for all privileged roles.</small></div>
                <Switch checked={form.twoFactor} onChange={(v) => set("twoFactor", v)} label="Two-factor for admins" />
              </div>
              <div className="toggle-row">
                <div><strong>IP allow-list</strong><small>Restrict admin console by network.</small></div>
                <Switch checked={form.ipAllow} onChange={(v) => set("ipAllow", v)} label="IP allow-list" />
              </div>
            </section>

            <section className="panel">
              <h2>Vendor Membership Tiers</h2>
              <ul className="list">
                {TIERS.map(([n, p]) => <li key={n}><span>{n}</span><strong>{p}</strong></li>)}
              </ul>
            </section>

            <section className="panel">
              <h2>Recent System Changes</h2>
              <ul className="list list--stack">
                {HISTORY.map(([t, m]) => <li key={t}><strong>{t}</strong><small>{m}</small></li>)}
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}