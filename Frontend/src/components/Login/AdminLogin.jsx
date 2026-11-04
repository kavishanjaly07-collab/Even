import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";
import "./Login.css";
import "./AdminLogin.css";

const dashboardPaths = {
  customer: "/CustomerHome",
  provider: "/ProviderHome",
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loading, user, setSession, clearSession } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    if (user.role === "admin") {
      navigate("/AdminDashboard", { replace: true });
      return;
    }

    setMessage("This account does not have administrator access. Sign out before using another account.");
  }, [loading, navigate, user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading || submitting) return;

    const username = form.username.trim();
    if (!username || !form.password) {
      setMessage("Enter your username and password to continue.");
      return;
    }

    if (user && user.role !== "admin") {
      setMessage("This account does not have administrator access. Sign out before using another account.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const session = await authApi.login(
        { username, password: form.password },
        "admin"
      );

      if (session.user?.role !== "admin") {
        setMessage("This account does not have administrator access.");
        return;
      }

      setSession(session);
      navigate("/AdminDashboard", { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function signOutCurrentUser() {
    clearSession();
    setMessage("You have been signed out. Sign in with an administrator account.");
  }

  return (
    <div className="login-page admin-login-page">
      <form className="login-card admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-login-brand-mark" aria-hidden="true">✦</div>
        <p className="admin-login-eyebrow">EVENT CONNECT · ADMIN SUITE</p>
        <h1>Administrator Login</h1>
        <p className="admin-login-description">Sign in with your authorized administrator account.</p>

        <label htmlFor="admin-username">Username</label>
        <input
          id="admin-username"
          name="username"
          type="text"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          disabled={loading || submitting || Boolean(user)}
        />

        <label htmlFor="admin-password">Password</label>
        <div className="admin-login-password">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            disabled={loading || submitting || Boolean(user)}
          />
          <button
            type="button"
            className="admin-login-password-toggle"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {!user && (
          <button type="submit" className="pill-btn" disabled={loading || submitting}>
            {loading ? "Checking session..." : submitting ? "Signing in..." : "Login"}
          </button>
        )}

        {message && <p className="login-message admin-login-message" role="alert">{message}</p>}

        {user && user.role !== "admin" && (
          <button type="button" className="pill-btn admin-login-switch" onClick={signOutCurrentUser}>
            Sign Out & Switch Account
          </button>
        )}

        <Link to="/" className="admin-login-back">Back to Event Connect</Link>
      </form>
    </div>
  );
}
