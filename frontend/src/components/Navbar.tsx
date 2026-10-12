import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin, isShopOperator } = useAuth();
  const [activeBookingsCount, setActiveBookingsCount] = useState<number>(0);

  useEffect(() => {
    // Check active bookings count from backend
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const active = data.data.filter(
            (b: any) => b.status === "pending" || b.status === "printing" || b.status === "ready"
          );
          setActiveBookingsCount(active.length);
        }
      })
      .catch(() => {});
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        Local<span>Pickup</span>
      </Link>

      <nav className="nav-links">
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/shops"
          className={`nav-link ${location.pathname === "/shops" ? "active" : ""}`}
        >
          Browse Shops
        </Link>
        <Link
          to="/bookings"
          className={`nav-link ${location.pathname === "/bookings" ? "active" : ""}`}
        >
          My Bookings
          {activeBookingsCount > 0 && (
            <span className="nav-badge">{activeBookingsCount}</span>
          )}
        </Link>

        {/* Dashboard links based on role */}
        {isShopOperator && (
          <Link
            to="/shop-dashboard"
            className={`nav-link ${location.pathname === "/shop-dashboard" ? "active" : ""}`}
            style={{ background: "#f0ebff", color: "#6d4aff" }}
          >
            <span>🏪</span> Shop Portal
          </Link>
        )}

        {isAdmin && (
          <Link
            to="/admin"
            className="admin-badge-btn"
          >
            <span>⚙️</span> Admin
          </Link>
        )}
      </nav>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {isAuthenticated ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#3f3f46",
                background: "#f4f4f5",
                padding: "6px 12px",
                borderRadius: "20px",
              }}
            >
              {isAdmin ? "👑 Admin" : `🏪 ${user?.shop?.name || user?.name}`}
            </span>
            <button
              onClick={handleLogout}
              className="shop-button secondary-button"
              style={{ padding: "6px 12px", fontSize: "12px" }}
              title="Sign Out"
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              to="/login?role=shop"
              className="nav-link"
              style={{ fontSize: "13px", color: "#6d4aff" }}
            >
              Shop Login
            </Link>
            <Link
              to="/login?role=admin"
              className="admin-badge-btn"
              style={{ fontSize: "12px", padding: "6px 12px" }}
            >
              Admin Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
