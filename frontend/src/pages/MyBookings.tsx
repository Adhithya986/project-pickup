import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";
import {
  IconSearch,
  IconClock,
  IconQrCode,
  IconDownload,
  IconPrinter,
  IconX,
} from "../components/Icons";

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
      .catch((err) => console.error(err))
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
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <Link to="/" style={{ fontSize: "13px", color: "#64748b", textDecoration: "none", display: "inline-block", marginBottom: "8px" }}>
                ← Back to Home
              </Link>
              <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em" }}>My Print Orders</h1>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                Track print jobs, view pickup time slots, and show your QR code at the counter.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="search-container" style={{ width: "300px" }}>
              <IconSearch size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Filter by phone (e.g. 9876543210)..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: "4px 8px" }}>
                Filter
              </button>
            </form>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="filter-tabs">
          {[
            { id: "all", label: "All Orders" },
            { id: "pending", label: "Pending" },
            { id: "printing", label: "Printing" },
            { id: "ready", label: "Ready for Pickup" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`filter-tab ${filter === tab.id ? "active" : ""}`}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: "13px", color: "#64748b", alignSelf: "center" }}>
            {bookings.length} {bookings.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {/* Orders List */}
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
            Loading your bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              background: "white",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>No orders found</h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", marginBottom: "16px" }}>
              You don't have any print jobs under this status.
            </p>
            <Link to="/shops" className="btn btn-primary btn-sm">
              Browse Shops & Order
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {bookings.map((b) => (
              <div
                key={b.id}
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "18px 22px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "#eff6ff",
                      color: "#2563eb",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <IconPrinter size={20} />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "3px" }}>
                      <strong style={{ fontSize: "15px", color: "#0f172a" }}>{b.id}</strong>
                      <span className={`status-pill ${getStatusClass(b.status)}`}>
                        {b.status}
                      </span>
                    </div>

                    <p style={{ fontSize: "13.5px", color: "#334155", margin: 0 }}>
                      <strong>{b.shopName}</strong> • {b.documentName}
                    </p>

                    <div style={{ display: "flex", gap: "14px", fontSize: "12.5px", color: "#64748b", marginTop: "4px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <IconClock size={13} />
                        <span>{b.pickupDate}, {b.pickupSlot}</span>
                      </span>
                      <span>{b.copies} copies ({b.paperSize}, {b.colour})</span>
                      <strong style={{ color: "#0f172a" }}>₹{b.totalPrice}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {b.documentPath && (
                    <a
                      href={b.documentPath}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      title="Download document file"
                    >
                      <IconDownload size={14} />
                      <span>File</span>
                    </a>
                  )}

                  <button
                    onClick={() => setSelectedBookingForQR(b)}
                    className="btn btn-primary btn-sm"
                  >
                    <IconQrCode size={14} />
                    <span>Show Pickup Pass</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pickup QR Pass Modal */}
        {selectedBookingForQR && (
          <div className="modal-overlay" onClick={() => setSelectedBookingForQR(null)}>
            <div className="modal-clean" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
              <button className="modal-close-btn" onClick={() => setSelectedBookingForQR(null)}>
                <IconX size={18} />
              </button>

              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                COUNTER PICKUP PASS
              </span>
              <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "4px 0 2px" }}>
                {selectedBookingForQR.id}
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
                {selectedBookingForQR.shopName} • Scheduled: {selectedBookingForQR.pickupDate}, {selectedBookingForQR.pickupSlot}
              </p>

              <div
                style={{
                  background: "white",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  display: "inline-block",
                  boxShadow: "var(--shadow-sm)",
                  marginBottom: "16px",
                }}
              >
                <QRCodeSVG
                  value={selectedBookingForQR.qrToken || selectedBookingForQR.id}
                  size={180}
                  level="M"
                />
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                  display: "flex",
                  justifyContent: "space-between",
                  textAlign: "left",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <span style={{ color: "#64748b", fontSize: "11.5px" }}>Status</span>
                  <div>
                    <span className={`status-pill ${getStatusClass(selectedBookingForQR.status)}`}>
                      {selectedBookingForQR.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ color: "#64748b", fontSize: "11.5px" }}>Total Amount</span>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>₹{selectedBookingForQR.totalPrice}</div>
                </div>
              </div>

              <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0 }}>
                Show this barcode to the counter clerk when collecting your order.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
