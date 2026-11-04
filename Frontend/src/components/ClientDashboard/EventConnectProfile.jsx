import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./EventConnectProfile.css";
import ClientSidebar from "./ClientSidebar";

const initialPreferences = {
  bookingUpdates: true,
  vendorMessages: true,
  milestoneReminders: true,
  conciergeRecommendations: false,
};

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`ep-toggle ${checked ? "is-on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

function Field({ label, children, className = "" }) {
  return <label className={`ep-field ${className}`}><span className="ep-field-label">{label}</span>{children}</label>;
}

export default function EventConnectProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    fullName: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: "",
    password: "",
    newPassword: "",
  });
  const [preferences, setPreferences] = useState(initialPreferences);
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [twoFactor, setTwoFactor] = useState(true);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  function updateProfile(key, value) {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function notify(text) {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function saveChanges(event) {
    event.preventDefault();
    setSaved(false);
    notify("Account profile updates are not supported by the current backend API.");
  }

  return (
    <div className="ep-page">
      <div className="ep-app">
        <ClientSidebar
          onHelp={() => notify("Connecting you with the concierge team…")}
          onLogout={() => setShowSignOut(true)}
        />

        <main className="ep-main">
          <header className="ep-topbar">
            <label className="ep-global-search"><span>⌕</span><input placeholder="Search services, verified vendors, cakes, catering..." /><kbd>⌘ K</kbd></label>
            <div className="ep-top-actions">
              <button type="button" className="ep-top-icon" aria-label="Notifications">♧<i /></button>
              <button type="button" className="ep-top-icon" aria-label="Bookings">▣<i /></button>
              <div className="ep-user"><span className="ep-user-avatar">{user?.username?.charAt(0).toUpperCase() || "C"}</span><span className="ep-user-copy"><strong>{user?.username || "Customer"}</strong><small>Private Host</small></span><span className="ep-vip">VIP</span></div>
            </div>
          </header>

          <form className="ep-content" onSubmit={saveChanges}>
            <div className="ep-breadcrumb"><span>PERSONAL ATELIER ACCOUNT</span><i>•</i> Tier: VIP Private Patron</div>
            <section className="ep-page-heading">
              <div><h1>My Profile &amp; Account Settings</h1><p>Manage your personal details, bespoke event curation preferences, security credentials,<br className="ep-desktop-break" /> and priority communication channels.</p></div>
            </section>

            <section className="ep-overview-grid">
              <article className="ep-profile-card">
                <div className="ep-profile-main">
                  <div className="ep-profile-photo" role="img" aria-label="Profile portrait">AJ</div>
                  <div className="ep-profile-identity">
                    <h2>{profile.fullName || user?.username || "Customer"} <span className="ep-private-badge">✦ PRIVATE VIP HOST</span> <span className="ep-verified">✓ Verified</span></h2>
                    <p>♧ Member since 2023 <span>•</span> San Francisco Bay Area</p>
                    <p>▣ VIP Concierge Client</p>
                    <div className="ep-profile-badges"><span>✦ KYC</span><span>✓ Curated Global Status</span><span>●</span></div>
                  </div>
                </div>
                <div className="ep-profile-stats">
                  <div><small>ACHIEVEMENTS</small><strong>03</strong></div>
                  <div><small>FAVORITE ARTISANS</small><strong>28</strong></div>
                  <div><small>PRIORITY STATUS</small><strong className="ep-gold-text">Royal Tier</strong></div>
                </div>
              </article>

              <article className="ep-completeness-card">
                <div className="ep-completeness-top">
                  <div className="ep-completeness-avatar">♙</div>
                  <div><strong>Private Atelier</strong><small>DEDICATED SERVICE</small></div>
                  <span className="ep-active-pill">Active</span>
                </div>
                <div className="ep-completeness-body">
                  <div className="ep-progress-ring"><span>92%</span></div>
                  <div><strong>Profile Completeness</strong><p>Detailed event styling preferences and contact details to ensure a seamless bespoke experience.</p></div>
                </div>
                <div className="ep-assigned"><span>✧</span><div><strong>Assigned Host:</strong><small>Alexandre L. <button type="button" onClick={() => notify("Opening concierge message…")}>Message</button></small></div></div>
              </article>
            </section>

            <section className="ep-settings-grid">
              <article className="ep-panel ep-personal-panel">
                <header className="ep-panel-header"><h2><span>▤</span> Personal Information</h2><small>PATCH ID: EC-84902</small></header>
                <div className="ep-panel-body">
                  <Field label="Full Legal Name"><input value={profile.fullName} onChange={(e) => updateProfile("fullName", e.target.value)} /></Field>
                  <Field label="Email Address"><div className="ep-input-with-action"><input type="email" value={profile.email} onChange={(e) => updateProfile("email", e.target.value)} /><span className="ep-inline-status">✓ Verified Primary</span><button type="button" onClick={() => notify("Email change flow opened.")}>Change</button></div></Field>
                  <Field label="Direct Contact Phone"><input value={profile.phone} onChange={(e) => updateProfile("phone", e.target.value)} /></Field>
                  <p className="ep-field-help">Used for time-critical event dispatch &amp; concierge notifications.</p>
                  <Field label="Preferred City / Primary Region"><input value={profile.location} onChange={(e) => updateProfile("location", e.target.value)} /></Field>
                  <Field label="Primary Event Type"><div className="ep-choice-chips"><button type="button" onClick={(e) => e.currentTarget.classList.toggle("selected")}>♧ Gala</button><button type="button" onClick={(e) => e.currentTarget.classList.toggle("selected")}>♜ Executive Summit</button></div></Field>
                  <Field label="Private Banquet Types"><div className="ep-choice-chips"><button type="button" onClick={(e) => e.currentTarget.classList.toggle("selected")}>▣ Private Banquets</button><button type="button" onClick={(e) => e.currentTarget.classList.toggle("selected")}>+ Add Type</button></div></Field>
                </div>
              </article>

              <article className="ep-panel ep-preferences-panel">
                <header className="ep-panel-header"><h2><span>♜</span> Event Planning Preferences</h2><small className="ep-purple-text">Testing Profile</small></header>
                <div className="ep-panel-body">
                  <Field label="Dietary & Seasonal Requirements"><div className="ep-preference-box">♧ &nbsp; Plant-forward, Gluten-free options for all guest<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;pantries. Strict peanut allergy protocol.</div></Field>
                  <Field label="Tiered Budget Preference"><div className="ep-preference-box">♜ &nbsp; Luxury / Premium ($10,000 – $50,000+ per milestone)</div></Field>
                  <Field label="Preferred Vendor Contact Method"><div className="ep-contact-methods"><button type="button" className="selected" onClick={(e) => e.currentTarget.classList.toggle("selected")}><span>▣</span><strong>In-App Chat &amp; SMS</strong><small>Short messages &amp; mobile dispatch</small></button><button type="button" onClick={(e) => e.currentTarget.classList.toggle("selected")}><span>✉</span><strong>Email Digest Only</strong><small>Comprehensive end-of-day brief</small></button></div></Field>
                  <div className="ep-recent-event"><span className="ep-event-thumb">🥂</span><div><strong>ACTIVE LOOKBOOK OF THE YEAR</strong><p>Grand Pavilion Gala &amp; Dinner</p><small>3 Profiles &amp; 2 Orchestra Quartets shortlisted</small></div></div>
                </div>
              </article>
            </section>

            <div className="ep-save-strip"><span>◉ Update synchronously across your active event production teams.</span><div><button type="button" className="ep-cancel-button" onClick={() => { setProfile({ fullName: user?.username || "", email: user?.email || "", phone: user?.phone || "", location: "", password: "", newPassword: "" }); setSaved(false); }}>Cancel</button><button type="submit" className="ep-save-button">{saved ? "✓ Saved Changes" : "✓ Save Changes"}</button></div></div>

            <section className="ep-panel ep-security-panel">
              <header className="ep-panel-header"><div><h2><span>▣</span> Security &amp; Credentials</h2><p>Guard your account's integrity with secure password practices &amp; tiered access safeguards.</p></div><span className="ep-encrypted">♙ End-to-End Encrypted Vault</span></header>
              <div className="ep-security-grid">
                <div className="ep-password-area">
                  <h3>Update Passcode</h3>
                  <Field label="Current Password"><div className="ep-password-input"><input type={showPassword ? "text" : "password"} value={profile.password} onChange={(e) => updateProfile("password", e.target.value)} placeholder="••••••••••••••" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? "Hide" : "◉"}</button></div></Field>
                  <div className="ep-two-fields"><Field label="New Password"><input type="password" value={profile.newPassword} onChange={(e) => updateProfile("newPassword", e.target.value)} placeholder="Min. 10 chars" /></Field><Field label="Confirm New Password"><input type="password" placeholder="Re-type new password" /></Field></div>
                  <div className="ep-password-strength"><span>Complexity Rating</span><strong>Strong (14 characters + symbols)</strong><div><i /></div></div>
                  <button className="ep-update-password" type="button" onClick={() => notify("Password update is a demo action.")}>Update Password</button>
                </div>
                <div className="ep-security-side">
                  <div className="ep-twofactor">
                    <div className="ep-twofactor-heading"><div><strong>♜ Two-Factor Authentication</strong><p>Enabled via Authenticator App (TOTP). Requires a digital hardware verification before triggering booking confirmations.</p></div><Toggle checked={twoFactor} onChange={setTwoFactor} label="Two-factor authentication" /></div>
                    <div className="ep-device"><span>▣</span><div><strong>iPhone 15 Pro • Password</strong><small>Last trusted sign-in: 09:42 AM</small></div><button type="button" onClick={() => notify("Device configuration opened.")}>Configure</button></div>
                  </div>
                  <div className="ep-session-footer"><span>Active Sessions: 2 Devices</span><button type="button" onClick={() => notify("Other sessions signed out in this demo.")}>Revoke Other Sessions</button></div>
                </div>
              </div>
            </section>

            <section className="ep-panel ep-notifications-panel">
              <header className="ep-panel-header"><div><h2><span>▧</span> Notification &amp; Dispatch Preferences</h2><p>Control the cadence of luxury alerts, artisan milestone handoffs, and recommendations.</p></div><button className="ep-reset" type="button" onClick={() => setPreferences(initialPreferences)}>Reset to Default</button></header>
              <div className="ep-notification-grid">
                {[
                  ["bookingUpdates", "▣", "Booking Updates", "Status confirmations, schedule alterations, and vendor service updates."],
                  ["vendorMessages", "▤", "Vendor Direct Messages", "Direct dispatch from trusted vendors, event professionals, and artisans."],
                  ["milestoneReminders", "◷", "Milestone Reminders", "Time-sensitive payment, tasting, integrations, and gifting dispatches."],
                  ["conciergeRecommendations", "‹", "Concierge Recommendations", "Curated experiences, artisan shortlists, Michelin-starred spots, and seasonal finds."],
                ].map(([key, icon, title, description]) => (
                  <div className="ep-notification-option" key={key}><span className="ep-notification-icon">{icon}</span><div><strong>{title}</strong><p>{description}</p></div><Toggle checked={preferences[key]} onChange={(value) => setPreferences((current) => ({ ...current, [key]: value }))} label={title} /></div>
                ))}
              </div>
            </section>

            <section className="ep-account-danger">
              <div className="ep-danger-icon">!</div><div className="ep-danger-copy"><strong>Account Lifecycle &amp; Departure</strong><p>Temporarily freeze your atelier profile or terminate account credentials. Active booking<br className="ep-desktop-break" /> reservations remain securely reserved across agreements.</p></div>
              <div className="ep-danger-actions"><button type="button" onClick={() => setShowSignOut(true)}>↪<span>Log<br />Out</span></button><button type="button" className="ep-deactivate" onClick={() => setShowDeactivate(true)}>♙<span>Deactivate<br />Account</span></button></div>
            </section>
          </form>
        </main>

        {(showDeactivate || showSignOut) && <div className="ep-modal-backdrop" onClick={() => { setShowDeactivate(false); setShowSignOut(false); }} role="presentation"><div className="ep-modal" onClick={(event) => event.stopPropagation()}><button className="ep-modal-close" type="button" onClick={() => { setShowDeactivate(false); setShowSignOut(false); }}>×</button><div className="ep-modal-symbol">{showDeactivate ? "!" : "↪"}</div><h2>{showDeactivate ? "Deactivate account?" : "Log out of Event Connect?"}</h2><p>{showDeactivate ? "This demo will not delete your account or booking data." : "You can sign back in whenever you need to manage your events."}</p><div className="ep-modal-actions"><button type="button" onClick={() => { setShowDeactivate(false); setShowSignOut(false); }}>Cancel</button><button type="button" onClick={() => { setShowDeactivate(false); setShowSignOut(false); notify(showDeactivate ? "Account deactivation is a demo action." : "Log out is a demo action."); }}>{showDeactivate ? "Confirm" : "Log Out"}</button></div></div></div>}
        {notice && <div className="ep-toast" role="status">{notice}<button type="button" onClick={() => setNotice("")}>×</button></div>}
      </div>
    </div>
  );
}