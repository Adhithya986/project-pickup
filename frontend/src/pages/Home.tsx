import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

interface Shop {
  id: number;
  name: number;
  category: string;
  tagline: string;
  distance: string;
  startingPrice: string;
  rating: number;
  icon: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackId, setTrackId] = useState("");
  const [trackError, setTrackError] = useState("");

  useEffect(() => {
    fetch("/api/shops")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShops(data.data.slice(0, 3));
        }
      })
      .catch((err) => console.error("Error loading shops:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shops?q=${encodeURIComponent(search.trim())}`);
    } else {
      navigate("/shops");
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError("");
    if (!trackId.trim()) return;

    fetch(`/api/bookings/${encodeURIComponent(trackId.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          navigate("/booking-success", { state: data.data });
        } else {
          setTrackError("Booking not found. Please verify your Booking ID.");
        }
      })
      .catch(() => setTrackError("Error finding booking. Please try again."));
  };

  return (
    <div className="app">
      <Navbar />

      <main>
        <section className="hero">
          <p className="eyebrow">SMART CAMPUS & LOCAL SERVICES</p>

          <h1>
            Book before you go.
            <br />
            Pick up when you arrive.
          </h1>

          <p className="hero-description">
            Pre-book document printing, photocopying, and local services. Skip the counter lines,
            and collect your order when it's freshly printed.
          </p>

          <form onSubmit={handleSearch} className="search-box">
            <span>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search print shops, photocopying, services..."
            />
            <button
              type="submit"
              style={{
                background: "#6d4aff",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "8px 16px",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Search
            </button>
          </form>
        </section>

        {/* Quick Actions */}
        <section className="section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>

          <div className="quick-actions">
            <Link to="/shops" className="action-card">
              <div className="action-icon">🖨️</div>
              <div>
                <h3>Print a Document</h3>
                <p>Choose a local shop and upload your file</p>
              </div>
            </Link>

            <Link to="/shops" className="action-card">
              <div className="action-icon">🏪</div>
              <div>
                <h3>Browse Local Shops</h3>
                <p>Compare prices, ratings, and turnaround times</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Track Order Section */}
        <section className="section">
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e8e8ed",
              borderRadius: "18px",
              padding: "24px 28px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.03)",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: "18px" }}>
                🎯 Have a Booking ID?
              </h3>
              <p style={{ margin: 0, color: "#71717a", fontSize: "14px" }}>
                Enter your Booking ID (e.g. <code>LP-20261012-001</code>) to track status or view pickup QR code.
              </p>
              {trackError && (
                <p style={{ margin: "8px 0 0", color: "#e11d48", fontSize: "13px", fontWeight: 600 }}>
                  {trackError}
                </p>
              )}
            </div>

            <form onSubmit={handleTrack} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="LP-YYYYMMDD-XXX"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e4e4e7",
                  fontSize: "14px",
                  minWidth: "200px",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#18181b",
                  color: "white",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Track Status
              </button>
            </form>
          </div>
        </section>

        {/* Nearby Shops */}
        <section className="section">
          <div className="section-header">
            <h2>Featured Local Shops</h2>
            <Link to="/shops" className="view-all">
              View all shops →
            </Link>
          </div>

          {loading ? (
            <p style={{ color: "#71717a" }}>Loading shops from database...</p>
          ) : (
            shops.map((shop: any) => (
              <div className="shop-card" key={shop.id}>
                <div className="shop-icon">{shop.icon || "🖨️"}</div>

                <div className="shop-info">
                  <h3>{shop.name}</h3>
                  <p>{shop.tagline || shop.description}</p>
                  <div className="shop-meta">
                    <span>⭐ {shop.rating}</span>
                    <span>📍 {shop.distance}</span>
                    <span>💰 {shop.startingPrice}</span>
                  </div>
                </div>

                <Link to={`/shops/${shop.id}`} className="shop-button">
                  View Shop
                </Link>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}