import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { IconStore, IconSettings, IconLogOut, IconPrinter } from "./Icons";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin, isShopOperator } = useAuth();
  const [activeBookingsCount, setActiveBookingsCount] = useState<number>(0);

  useEffect(() => {
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
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", background: "#2563eb", color: "white", borderRadius: "8px" }}>
          <IconPrinter size={16} />
        </span>
        <span>LocalPickup</span>
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
          className={`nav-link ${location.pathname.startsWith("/shops") ? "active" : ""}`}
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

        {isShopOperator && (
          <Link
            to="/shop-dashboard"
            className={`nav-link ${location.pathname === "/shop-dashboard" ? "active" : ""}`}
            style={{ color: "#2563eb", background: "#eff6ff" }}
          >
            <IconStore size={15} />
            <span>Shop Counter</span>
          </Link>
        )}

        {isAdmin && (
          <Link
            to="/admin"
            className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}
            style={{ color: "#0f172a", background: "#f1f5f9" }}
          >
            <IconSettings size={15} />
            <span>Admin</span>
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
                color: "#334155",
                background: "#f1f5f9",
                padding: "5px 12px",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
              }}
            >
              {isAdmin ? "Admin" : user?.shop?.name || user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Sign Out"
            >
              <IconLogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              to="/login?role=shop"
              className="btn btn-secondary btn-sm"
            >
              Shop Login
            </Link>
            <Link
              to="/login?role=admin"
              className="btn btn-dark btn-sm"
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
