import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
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
      </nav>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <Link
          to="/shop-dashboard"
          className={`nav-link ${location.pathname === "/shop-dashboard" ? "active" : ""}`}
          style={{ background: "#f0ebff", color: "#6d4aff" }}
          title="Shop Operator Counter Dashboard"
        >
          <span>🏪</span> Shop Portal
        </Link>

        <Link
          to="/admin"
          className="admin-badge-btn"
          title="Campus Platform Admin Dashboard"
        >
          <span>⚙️</span> Admin
        </Link>
      </div>
    </header>
  );
}
