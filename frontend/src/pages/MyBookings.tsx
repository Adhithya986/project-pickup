import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedBookingForQR, setSelectedBookingForQR] = useState<any | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    let url = "/api/bookings";
    const params = new URLSearchParams();
    if (filter !== "all") {
      params.set("status", filter);
    }
    if (searchPhone.trim()) {
      params.set("phone", searchPhone.trim());
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBookings(data.data);
        }
      })
      .catch((err) => console.error("Error fetching bookings:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "printing":
        return "status-printing";
      case "ready":
        return "status-ready";
      case "completed":
        return "status-completed";
      default:
        return "status-pending";
    }
  };

  return (
    <div className="app">
      <Navbar />

      <main>
        <section className="shops-header">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <p className="eyebrow">ORDER TRACKING</p>
          <h1>My Print Bookings</h1>
          <p className="hero-description">
            Track your pre-booked print orders in real-time, view pickup QR codes, and collect without waiting.
          </p>

          <form onSubmit={handleSearchSubmit} className="search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Filter by phone number (e.g. 9876543210)..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
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
              Filter
            </button>
          </form>
        </section>

        {/* Filter Tabs */}
        <section className="section">
          <div className="filter-tabs">
            {[
              { id: "all", label: "All Orders" },
              { id: "pending", label: "⏳ Pending" },
              { id: "printing", label: "🖨️ Printing Now" },
              { id: "ready", label: "✅ Ready for Pickup" },
              { id: "completed", label: "📦 Completed" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`filter-tab ${filter === tab.id ? "active" : ""}`}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#71717a" }}>
              Loading bookings from database...
            </div>
          ) : bookings.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e8e8ed",
              }}
            >
              <h3>No bookings found</h3>
              <p style={{ color: "#71717a" }}>
                You have no print orders matching this status yet.
              </p>
              <Link to="/shops" className="shop-button" style={{ display: "inline-block", marginTop: "12px" }}>
                Browse Shops & Pre-Book →
              </Link>
            </div>
          ) : (
            <div className="orders-grid">
              {bookings.map((booking) => (
                <div className="order-card" key={booking.id}>
                  <div className="order-card-info">
                    <div className="order-card-icon">🖨️</div>
                    <div className="order-card-details">
                      <h4>
                        {booking.id}
                        <span className={`status-pill ${getStatusClass(booking.status)}`}>
                          ● {booking.status}
                        </span>
                      </h4>
                      <p>
                        <strong>{booking.shopName}</strong> • {booking.documentName}
                      </p>
                      <div className="order-meta-chips">
                        <span>🕒 Slot: {booking.pickupDate}, {booking.pickupSlot}</span>
                        <span>📄 {booking.copies} copy ({booking.paperSize}, {booking.colour})</span>
                        <span>💰 ₹{booking.totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="order-actions">
                    {booking.documentPath && (
                      <a
                        href={booking.documentPath}
                        target="_blank"
                        rel="noreferrer"
                        className="shop-button secondary-button"
                        style={{ padding: "8px 14px", textDecoration: "none", fontSize: "13px" }}
                        title="Download document"
                      >
                        📥 Document
                      </a>
                    )}
                    <button
                      className="shop-button"
                      style={{ padding: "8px 16px", fontSize: "13px" }}
                      onClick={() => setSelectedBookingForQR(booking)}
                    >
                      📱 Show QR Code
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modal for QR Code Display */}
        {selectedBookingForQR && (
          <div className="modal-overlay" onClick={() => setSelectedBookingForQR(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="close-modal-btn"
                onClick={() => setSelectedBookingForQR(null)}
              >
                ✕
              </button>

              <p className="eyebrow">COUNTER PICKUP PASS</p>
              <h2 style={{ margin: "4px 0 12px" }}>{selectedBookingForQR.id}</h2>

              <div
                style={{
                  background: "#f0ebff",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  marginBottom: "18px",
                  fontSize: "14px",
                }}
              >
                <strong>{selectedBookingForQR.shopName}</strong>
                <br />
                <span style={{ color: "#6d4aff" }}>
                  Pickup: {selectedBookingForQR.pickupDate}, {selectedBookingForQR.pickupSlot}
                </span>
              </div>

              <div className="qr-wrapper">
                <QRCodeSVG
                  value={selectedBookingForQR.qrToken || selectedBookingForQR.id}
                  size={190}
                  level="M"
                />
              </div>

              <p style={{ color: "#71717a", fontSize: "13px", marginTop: "12px" }}>
                Show this QR code to the counter operator at pickup.
              </p>

              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "#f4f4f5",
                  borderRadius: "10px",
                  fontSize: "13px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Status:</span>
                <strong className={`status-pill ${getStatusClass(selectedBookingForQR.status)}`}>
                  {selectedBookingForQR.status}
                </strong>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
