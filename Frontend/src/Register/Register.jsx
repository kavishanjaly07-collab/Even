import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi, providerProfileApi } from "../services/api";
import BrandLogo from "../components/BrandLogo";

// 👉 Put your background photo in the "public" folder as register-bg.jpg
const BACKGROUND_IMAGE = "/bgimg.jpg"; // relative to public folder

// All the CSS for this page lives here, so this is the ONLY file you need.
const styles = `
  .register-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: var(--font-family);
    /* gradient shows if the image is missing */
    background-color: #5a2d6e;
    background-image: url("/src/assets/bgimg.jpg");
    background-size: cover;
    background-position: center;
    position: relative;
  }

  /* Soft white layer on top of the photo (like your Figma design) */
  .register-page::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.55);
  }

  .register-card {
    position: relative;      /* keeps the card above the white layer */
    width: 100%;
    max-width: 380px;
    background: #e1e1e1;
    border-radius: 28px;
    padding: 40px 32px;
  }

  .register-card h1 {
    text-align: center;
    color: #4a0e63;
    font-size: 30px;
    margin-bottom: 30px;
    letter-spacing: 1px;
  }

  .register-brand-logo {
    display: block;
    width: min(100%, 210px);
    height: auto;
    aspect-ratio: 1408 / 768;
    margin: 0 auto 18px;
    object-fit: contain;
  }

  .register-card label {
    display: block;
    font-size: 18px;
    margin-bottom: 10px;
    color: #222;
  }

  .register-card input {
    width: 100%;
    min-height: 44px;
    padding: 10px 12px;
    margin-bottom: 20px;
    border: none;
    border-radius: 8px;
    background: #d4d4d4;
    font-family: inherit;
    font-size: 15px;
    outline: none;
  }

  .register-card input:focus {
    outline: 2px solid #4a0e63;
  }

  .register-btn {
    display: inline-flex;
    margin: 0 auto;
    width: 200px;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    padding: 10px 16px;
    border: none;
    border-radius: 999px;
    background: #4a0e63;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
  }

  .register-btn:hover {
    background: #5f1580;
  }

  .register-message {
    text-align: center;
    margin-top: 16px;
    font-size: 14px;
    color: #4a0e63;
  }
    .role-selection {
  display: flex;
  align-items: center;
    flex-wrap: wrap;
    gap: 12px 25px;
  margin: 15px 0;
}

.role-selection label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  cursor: pointer;
}

.role-selection input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #650b7c;
  cursor: pointer;
}

@media (max-width: 480px) {
  .register-page {
    padding: 16px;
  }

  .register-card {
    max-width: 420px;
    padding: 32px 24px;
  }
}
`;

export default function Register() {
  const navigate = useNavigate();
  const { loading, setSession } = useAuth();
  // useState = React's "memory" for what the user types
  const [form, setForm] = useState({ role: "customer", username: "", serviceType: "", phone: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (!form.username.trim() || !form.phone.trim() || !form.email.trim() || !form.password) {
      setMessage("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const session = await authApi.register({
        username: form.username.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setSession(session);
      const registeredRole = session.user?.role;
      let profileSetupMessage = "";
      if (registeredRole === "provider" && form.serviceType.trim()) {
        try {
          await providerProfileApi.create({
            businessName: form.username.trim(),
            businessCategory: form.serviceType.trim(),
            businessPhone: form.phone.trim(),
            businessEmail: form.email.trim(),
          });
        } catch (profileError) {
          profileSetupMessage = `Account created, but provider profile setup failed: ${profileError.message}`;
        }
      }
      if (registeredRole === "customer") {
        navigate("/CustomerHome", { replace: true });
      } else if (registeredRole === "provider") {
        navigate("/ProviderHome", {
          replace: true,
          state: { profileSetupMessage },
        });
      } else {
        setMessage("The server returned an invalid account role.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{styles}</style>

      <div className="register-page">
        <form className="register-card" onSubmit={handleSubmit}>
          {/* <BrandLogo className="register-brand-logo" /> */}
          <h1>REGISTER</h1>

          <div className="role-selection">
  <label>
    <input
      type="checkbox"
      name="role"
      value="customer"
      checked={form.role === "customer"}
      onChange={handleChange}
    />
    Customer
  </label>

  <label>
    <input
      type="checkbox"
      name="role"
      value="provider"
      checked={form.role === "provider"}
      onChange={handleChange}
    />
    Vendor
  </label>
</div>

          <label htmlFor="user name">User Name</label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
          />

          <label htmlFor="serviceType">Service Type</label>
          <input
            id="serviceType"
            name="serviceType"
            type="text"
            value={form.serviceType}
            onChange={handleChange}
          />

          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="number"
            value={form.phone}
            onChange={handleChange}
          />

          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
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

          <button type="submit" className="register-btn" disabled={submitting || loading}>
            {loading ? "Checking session..." : submitting ? "Registering..." : "Register"}
          </button>

          {message && <p className="register-message">{message}</p>}
        </form>
      </div>
    </>
  );
}
