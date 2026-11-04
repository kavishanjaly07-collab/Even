import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { clientApi } from "../../services/api";
import ClientSidebar from "./ClientSidebar";
import "./Profilesettings.css";

const EMPTY_FORM = { username: "", email: "", phone: "" };

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || "?";
}

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, clearSession, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { user: currentProfile } = await clientApi.getProfile();
      setProfile(currentProfile);
      setForm({
        username: currentProfile.username || "",
        email: currentProfile.email || "",
        phone: currentProfile.phone || "",
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to load your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function logout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage("");
    setError("");
  }

  async function saveProfile(event) {
    event.preventDefault();
    const updates = {
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
    };

    if (!updates.username) {
      setError("Username cannot be empty.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!updates.phone) {
      setError("Phone number cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await clientApi.updateProfile(updates);
      setProfile(response.user);
      setForm({
        username: response.user.username,
        email: response.user.email,
        phone: response.user.phone,
      });
      updateUser(response.user);
      setMessage(response.message || "Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const displayName = profile?.username || user?.username || "Client";

  return (
    <div className="pf">
      <ClientSidebar onHelp={() => navigate("/Messages")} onLogout={logout} />

      <main className="pf-main">
        <header className="pf-top">
          <div className="pf-user">
            <span className="avatar">{getInitial(displayName)}</span>
            <div><strong>{displayName}</strong><small>{profile?.email || user?.email || "Email not available"}</small></div>
          </div>
        </header>

        <section className="pf-head">
          <small className="eyebrow">Client account</small>
          <h1>My Profile</h1>
          <p className="lede">View and update the contact information saved on your account.</p>
        </section>

        {error && (
          <div className="pf-feedback error" role="alert">
            <span>{error}</span>
            <button className="link" type="button" onClick={loadProfile} disabled={loading}>Retry</button>
          </div>
        )}
        {message && <div className="pf-feedback success" role="status">{message}</div>}

        {loading ? (
          <section className="panel pf-loading" role="status">Loading your profile...</section>
        ) : !profile ? (
          <section className="panel pf-loading">
            <p>Your profile could not be loaded.</p>
            <button className="btn btn--ghost" type="button" onClick={loadProfile}>Retry</button>
          </section>
        ) : (
          <>
            <div className="hero-row">
              <section className="panel hero">
                <div className="photo" aria-hidden="true">{getInitial(displayName)}</div>
                <div className="hero-body">
                  <div className="name-row">
                    <h2>{displayName}</h2>
                    <span className="badge">Customer account</span>
                  </div>
                  <small>Member since {formatDate(profile?.createdAt)}</small>
                </div>
              </section>

              <section className="panel account-panel">
                <h2>Account Information</h2>
                <p><strong>Role</strong><span>{profile?.role || "Not available"}</span></p>
                <p><strong>Account created</strong><span>{formatDate(profile?.createdAt)}</span></p>
              </section>
            </div>

            <form onSubmit={saveProfile}>
              <div className="split profile-edit">
                <section className="panel">
                  <h2>Contact Information</h2>
                  <div className="fields">
                    <label>
                      Username
                      <input
                        name="username"
                        autoComplete="username"
                        maxLength={80}
                        value={form.username}
                        onChange={updateField}
                        required
                      />
                    </label>
                    <label>
                      Email address
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        maxLength={254}
                        value={form.email}
                        onChange={updateField}
                        required
                      />
                    </label>
                    <label>
                      Phone number
                      <input
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        maxLength={40}
                        value={form.phone}
                        onChange={updateField}
                        required
                      />
                    </label>
                  </div>
                </section>

                <section className="panel account-note">
                  <h2>Profile Data</h2>
                  <p>Your profile uses the contact details stored on your account.</p>
                  <p>Address and profile image are not available in the current account schema.</p>
                  <p>Password, role, and account creation date cannot be changed here.</p>
                </section>
              </div>

              <div className="savebar">
                <small>Changes are saved to your authenticated account.</small>
                <div className="actions">
                  <button className="btn btn--primary" type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
