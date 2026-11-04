import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api";
import "./Login.css";

const dashboardPaths = {
  customer: "/CustomerHome",
  provider: "/ProviderHome",
  admin: "/AdminDashboard",
};

export default function Login() {
  const navigate = useNavigate();
  const { authError, loading, setSession } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authError) setMessage(authError);
  }, [authError]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    const username = form.username.trim();

    if (!username || !form.password.trim()) {
      setMessage("Please enter your user name and password.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const session = await authApi.login({ username, password: form.password });
      const destination = dashboardPaths[session.user?.role];
      if (!destination) {
        throw new Error("The server returned an invalid account role.");
      }

      setSession(session);
      navigate(destination, { replace: true });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>LOGIN</h1>

        <label htmlFor="username">User Name</label>
        <input
          id="username"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit" className="pill-btn" disabled={submitting || loading}>
          {loading ? "Checking session..." : submitting ? "Signing in..." : "Login"}
        </button>

        {message && <p className="login-message" role="status">{message}</p>}

        <p className="no-account">If you don't have an account</p>

        <Link to="/register" className="pill-btn">Register</Link>
      </form>
    </div>
  );
}
