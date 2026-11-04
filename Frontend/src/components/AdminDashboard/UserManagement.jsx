import React, { useState, useEffect } from "react";
import { adminApi } from "../../services/api";

import "./UserManagement.css";
import AdminSidebar from "./AdminSidebar";

const roleLabels = {
  customer: "Customer",
  provider: "Service Provider",
  admin: "Administrator",
};

function mapUser(user, index) {
  if (!user?._id) {
    throw new Error("The server returned a user without an ID.");
  }

  const createdAt = user.createdAt ? new Date(user.createdAt) : null;
  const hasValidDate = createdAt && !Number.isNaN(createdAt.getTime());

  return {
    id: String(user._id),
    avatarIndex: (index % 6) + 1,
    name: user.username || "Not available",
    email: user.email || "Not available",
    role: roleLabels[user.role] || "Not available",
    date: hasValidDate
      ? createdAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "Not available",
    createdAt: hasValidDate ? createdAt : null,
    // The current User model has no suspension field; existing accounts are active.
    status: user.status === "Suspended" ? "Suspended" : user.status === "Active" || !user.status
      ? "Active"
      : "Not available",
    phone: user.phone || "Not available",
    address: "Not available",
    bookings: "Not available",
    spending: "Not available",
  };
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    adminApi.getUsers()
      .then((response) => {
        if (!Array.isArray(response?.users)) {
          throw new Error("The server returned an invalid users response.");
        }

        const fetchedUsers = response.users.map(mapUser);
        if (!active) return;
        setUsers(fetchedUsers);
        setSelectedUser(fetchedUsers[0] || null);
        setSelectedIds([]);
      })
      .catch((requestError) => {
        if (active) {
          setUsers([]);
          setSelectedUser(null);
          setSelectedIds([]);
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  // Search and filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "All Roles" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "All Statuses" ||
      user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Select one user
  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  // Select all filtered users
  const handleSelectAll = () => {
    if (filteredUsers.every((user) => selectedIds.includes(user.id))) {
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredUsers.some((user) => user.id === id))
      );
    } else {
      setSelectedIds((prev) => [
        ...new Set([...prev, ...filteredUsers.map((user) => user.id)]),
      ]);
    }
  };

  // Export users as CSV
  const exportUsers = () => {
    const headers = ["Name", "Email", "Role", "Date", "Status"];

    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.date,
      user.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "event-connect-users.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;
  const suspendedUsers = users.filter(
    (user) => user.status === "Suspended"
  ).length;
  const now = new Date();
  const newUsersThisMonth = users.filter((user) =>
    user.createdAt &&
    user.createdAt.getFullYear() === now.getFullYear() &&
    user.createdAt.getMonth() === now.getMonth()
  ).length;

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="admin-main">

        {/* TOP NAVBAR */}
        <header className="admin-topbar">

          <div className="top-search">
            <span>⌕</span>
            <input placeholder="Search users, bookings, providers..." />
          </div>

          <div className="system-status">
            <span className="online-dot"></span>
            Production System
          </div>

          <button className="notification-btn">♧</button>

          <div className="admin-profile">
            <div className="profile-avatar">DS</div>
            <div>
              <strong>Super Admin</strong>
              <small>Platform Administrator</small>
            </div>
          </div>

        </header>

        {/* PAGE HEADER */}
        <section className="page-heading">

          <div>
            <div className="heading-title">
              <h1>User Management</h1>
              <span className="version-tag">REGISTRY V2.4</span>
            </div>

            <p>
              Manage customer, provider, and administrator identities
              across island-wide hubs.
            </p>
          </div>

          <div className="heading-actions">
            <button className="export-btn" onClick={exportUsers}>
              ⇧ Export Users
            </button>

            <button className="add-user-btn" disabled title="User creation is not available through the current API.">
              + Add User
            </button>
          </div>

        </section>

        {/* STATISTICS */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-top">
              <span>TOTAL USERS</span>
              <div className="stat-icon purple">♙</div>
            </div>
            <h2>{loading ? "—" : totalUsers.toLocaleString()}</h2>
            <p className="stat-positive">Registered users</p>
            <div className="stat-progress purple-progress"></div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>ACTIVE USERS</span>
              <div className="stat-icon green">♧</div>
            </div>
            <h2>{loading ? "—" : activeUsers.toLocaleString()}</h2>
            <p className="stat-positive">↗ Active accounts</p>
            <div className="stat-progress green-progress"></div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>NEW THIS MONTH</span>
              <div className="stat-icon yellow">♙</div>
            </div>
            <h2>{loading ? "—" : newUsersThisMonth.toLocaleString()}</h2>
            <p className="stat-positive">↗ New registrations</p>
            <div className="stat-progress yellow-progress"></div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>SUSPENDED / FLAGGED</span>
              <div className="stat-icon red">⚑</div>
            </div>
            <h2 className="red-number">{loading ? "—" : suspendedUsers.toLocaleString()}</h2>
            <p className="stat-negative">Account restrictions</p>
            <div className="stat-progress red-progress"></div>
          </div>

        </section>

        {/* SEARCH AND FILTER */}
        <section className="filter-section">

          <div className="filter-row">

            <div className="user-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option>All Roles</option>
              <option>Customer</option>
              <option>Service Provider</option>
              <option>Administrator</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Statuses</option>
              <option>Active</option>
              <option>Suspended</option>
            </select>

            <button
              className="reset-filter"
              onClick={() => {
                setSearch("");
                setRoleFilter("All Roles");
                setStatusFilter("All Statuses");
              }}
            >
              ↻
            </button>

          </div>

          <div className="bulk-action">

            <div>
              <strong>{selectedIds.length} User(s) selected</strong>
            </div>

            <button
              onClick={() => {
                const selected = users.filter((u) =>
                  selectedIds.includes(u.id)
                );
                if (selected.length) {
                  setSelectedUser(selected[0]);
                  window.alert("Selected user: " + selected[0].name);
                }
              }}
            >
              ⇩ Export CSV
            </button>

            <button
              onClick={() => window.alert("Notification feature coming soon")}
            >
              ♧ Send Notice
            </button>

            <button
              className="bulk-suspend"
              disabled
              title="Account status updates are not available through the current API."
            >
              ⊘ Bulk Suspend
            </button>

          </div>

        </section>

        {/* USERS TABLE AND DETAILS */}
        <section className="user-content">

          {/* USERS TABLE */}
          <div className="users-table-card">

            <div className="table-responsive">
              <table className="users-table">

                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          filteredUsers.length > 0 &&
                          filteredUsers.every((u) =>
                            selectedIds.includes(u.id)
                          )
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>USER ID</th>
                    <th>PROFILE & NAME</th>
                    <th>ROLE</th>
                    <th>REG DATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {!loading && !error && filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={
                        selectedUser?.id === user.id ? "selected-row" : ""
                      }
                      onClick={() => setSelectedUser(user)}
                    >

                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.id)}
                          onChange={() => handleSelect(user.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>

                      <td>
                        <span className="user-id">
                          #USR-{String(user.id).padStart(4, "0")}
                        </span>
                      </td>

                      <td>
                        <div className="user-name-cell">
                          <div className={`user-avatar avatar-${user.avatarIndex}`}>
                            {user.name.charAt(0)}
                          </div>

                          <div>
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`role-badge ${
                            user.role === "Customer"
                              ? "customer"
                              : user.role === "Service Provider"
                              ? "provider"
                              : "administrator"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="date-cell">{user.date}</td>

                      <td>
                        <span
                          className={`status-badge ${
                            user.status === "Active"
                              ? "status-active"
                              : user.status === "Suspended"
                              ? "status-suspended"
                              : ""
                          }`}
                        >
                          ● {user.status}
                        </span>
                      </td>

                    </tr>
                  ))}

                  {loading && (
                    <tr>
                      <td colSpan="6" className="empty-message">
                        Loading users...
                      </td>
                    </tr>
                  )}

                  {!loading && error && (
                    <tr>
                      <td colSpan="6" className="empty-message" role="alert">
                        {error}{" "}
                        <button
                          type="button"
                          className="reset-filter"
                          onClick={() => setReloadKey((current) => current + 1)}
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  )}

                  {!loading && !error && filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-message">
                        No users found.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>
            </div>

            <div className="table-pagination">
              <span>
                Showing {filteredUsers.length} of {totalUsers} users
              </span>

              <div>
                <button disabled>Previous</button>
                <button className="page-active">1</button>
                <button disabled>Next</button>
              </div>
            </div>

          </div>

          {/* USER DETAILS PANEL */}
          {selectedUser && (
            <aside className="user-details-card">

              <div className="details-heading">
                <div className={`details-avatar avatar-${selectedUser.avatarIndex}`}>
                  {selectedUser.name.charAt(0)}
                </div>

                <div>
                  <h3>{selectedUser.name}</h3>
                  <span className={`role-badge ${
                    selectedUser.role === "Customer"
                      ? "customer"
                      : selectedUser.role === "Service Provider"
                      ? "provider"
                      : "administrator"
                  }`}>
                    {selectedUser.role}
                  </span>

                  <span
                    className={`status-badge ${
                      selectedUser.status === "Active"
                        ? "status-active"
                        : selectedUser.status === "Suspended"
                        ? "status-suspended"
                        : ""
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="details-info">

                <div>
                  <span>Email</span>
                  <strong>{selectedUser.email}</strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>{selectedUser.phone}</strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>{selectedUser.address}</strong>
                </div>

                <div>
                  <span>User ID</span>
                  <strong>USR-{selectedUser.id}</strong>
                </div>

              </div>

              <div className="details-stats">

                <div>
                  <span>BOOKINGS</span>
                  <h2>{selectedUser.bookings}</h2>
                </div>

                <div>
                  <span>LIFETIME SPEND</span>
                  <h2>{selectedUser.spending}</h2>
                </div>

              </div>

              <h4 className="recent-heading">RECENT ACTIVITY</h4>

              <div className="activity-item">
                <span className="activity-icon">▣</span>
                <div>
                  <strong>Booking Activity</strong>
                  <small>{selectedUser.bookings}</small>
                </div>
              </div>

              <div className="activity-item">
                <span className="activity-icon green">✓</span>
                <div>
                  <strong>Account Registered</strong>
                  <small>{selectedUser.date}</small>
                </div>
              </div>

              <div className="warning-box">
                <strong>⚑ Account Information</strong>
                <p>
                  Review user activity and account information
                  before taking administrative action.
                </p>
              </div>

              <div className="detail-buttons">

                <button
                  onClick={() =>
                    window.alert("Edit details feature coming soon")
                  }
                >
                  ✎ Edit Details
                </button>

                <button
                  onClick={() =>
                    window.alert("Ledger feature coming soon")
                  }
                >
                  ▤ Full Ledger
                </button>

                <button
                  className={
                    selectedUser.status === "Active"
                      ? "suspend-account"
                      : "reactivate-account"
                  }
                  disabled
                  title="Account status updates are not available through the current API."
                >
                  {selectedUser.status === "Active"
                    ? "⊘ Suspend Account"
                    : "✓ Reactivate Account"}
                </button>

              </div>

            </aside>
          )}

        </section>

      </main>
    </div>
  );
}

export default UserManagement;
