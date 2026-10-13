import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  IconSearch,
  IconPrinter,
  IconStore,
  IconMapPin,
  IconStar,
  IconClock,
  IconArrowRight,
  IconCheckCircle,
} from "../components/Icons";

interface Shop {
  id: number;
  name: string;
  category: string;
  tagline: string;
  distance: string;
  startingPrice: string;
  rating: number;
  reviewCount: number;
  openHours: string;
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
      .catch((err) => console.error(err))
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
          setTrackError("No active booking found with this ID.");
        }
      })
      .catch(() => setTrackError("Error finding booking. Please try again."));
  };

  return (
    <div className="app">
      <Navbar />

      <main>
        {/* Clean Hero */}
        <section className="hero-clean">
          <div className="hero-pill">
            <IconCheckCircle size={14} />
            <span>Campus & Local Print Network</span>
          </div>

          <h1>Book before you go.<br />Pick up when you arrive.</h1>

          <p>
            Upload your documents, configure paper and finish options, and collect your order at your designated time without standing in lines.
          </p>

          <form onSubmit={handleSearch} className="search-container">
            <span style={{ color: "#64748b", display: "grid", placeItems: "center" }}>
              <IconSearch size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by shop name, service, or campus block..."
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>
        </section>

        {/* Quick Action Cards */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "16px", marginBottom: "40px" }}>
          <Link
            to="/shops"
            className="config-card"
            style={{
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 0,
              textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <IconPrinter size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Print a Document</h3>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Configure print jobs & choose a shop</p>
              </div>
            </div>
            <IconArrowRight size={18} color="#94a3b8" />
          </Link>

          <Link
            to="/shops"
            className="config-card"
            style={{
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 0,
              textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "#f8fafc",
                  color: "#334155",
                  border: "1px solid #e2e8f0",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <IconStore size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Browse Verified Shops</h3>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Compare ratings, turnaround times & rates</p>
              </div>
            </div>
            <IconArrowRight size={18} color="#94a3b8" />
          </Link>
        </section>

        {/* Featured Shops */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 750, letterSpacing: "-0.01em" }}>Featured Print Shops</h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Verified local counters ready for pickup</p>
            </div>
            <Link to="/shops" style={{ fontSize: "14px", fontWeight: 600, color: "#2563eb", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span>View all shops</span>
              <IconArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading verified shops...</div>
          ) : (
            <div className="shop-card-grid">
              {shops.map((shop) => (
                <div className="shop-card-clean" key={shop.id}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span className="shop-badge">{shop.category}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 650, color: "#0f172a" }}>
                        <IconStar size={14} color="#f59e0b" />
                        <span>{shop.rating}</span>
                        <span style={{ color: "#94a3b8", fontWeight: 400 }}>({shop.reviewCount})</span>
                      </span>
                    </div>

                    <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "4px" }}>{shop.name}</h3>
                    <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.45 }}>{shop.tagline}</p>

                    <div className="meta-row">
                      <span className="meta-item">
                        <IconMapPin size={14} />
                        <span>{shop.distance}</span>
                      </span>
                      <span className="meta-item">
                        <IconClock size={14} />
                        <span>{shop.openHours}</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{shop.startingPrice}</span>
                    <Link to={`/shops/${shop.id}`} className="btn btn-secondary btn-sm">
                      View Menu & Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Track Booking Quick Banner */}
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>Have an existing order?</h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
              Enter your Booking ID (e.g. <code>LP-20261012-001</code>) to view status or open your counter pickup QR code.
            </p>
            {trackError && (
              <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: 600, marginTop: "6px" }}>
                {trackError}
              </p>
            )}
          </div>

          <form onSubmit={handleTrack} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Booking ID..."
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                outline: "none",
                minWidth: "180px",
              }}
            />
            <button type="submit" className="btn btn-dark btn-sm">
              Track
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}