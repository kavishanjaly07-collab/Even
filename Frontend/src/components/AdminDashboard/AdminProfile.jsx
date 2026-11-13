
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import "./AdminProfile.css";

export default function AdminProfile() {
  const { user } = useAuth();

  const username = user?.username || "Administrator";
  const email = user?.email || "Email not available";

  return (
    <div className="admin-profile-layout">
      <AdminSidebar />

      <main className="admin-profile-main">
        <header className="admin-profile-header">
          <h1>My Profile</h1>
          <p>Manage your administrator account information.</p>
        </header>

        <section className="admin-profile-card">
          <div className="admin-profile-avatar">
            {username.charAt(0).toUpperCase()}
          </div>

          <h2>{username}</h2>
          <p>Platform Administrator</p>

          <div className="admin-profile-details">
            <div>
              <span>Username</span>
              <strong>{username}</strong>
            </div>

            <div>
              <span>Email Address</span>
              <strong>{email}</strong>
            </div>

            <div>
              <span>Account Role</span>
              <strong>Administrator</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
