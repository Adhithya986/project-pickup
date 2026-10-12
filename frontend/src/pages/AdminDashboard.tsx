import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({
    totalOrders: 0,
    pendingOrders: 0,
    printingOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Counter QR Verifier state
  const [verifierInput, setVerifierInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [verifierError, setVerifierError] = useState("");

  const fetchData = () => {
    // Fetch stats
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch((err) => console.error("Error fetching stats:", err));

    // Fetch bookings
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());

    fetch(`/api/bookings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.data);
        }
      })
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // Polling every 8 seconds for live counter updates
    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const handleVerifyQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifierError("");
    setVerificationResult(null);

    if (!verifierInput.trim()) return;

    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(verifierInput.trim())}/verify`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && data.verified) {
        setVerificationResult(data.data);
        setVerifierInput("");
        fetchData();
      } else {
        setVerifierError(data.message || "Invalid QR Code or Booking ID");
      }
    } catch (err) {
      console.error(err);
      setVerifierError("Error connecting to server for verification");
    }
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
            ← Back to Storefront
          </Link>
          <p className="eyebrow">SHOP OPERATOR PORTAL</p>
          <h1>Counter & Print Queue Dashboard</h1>
          <p className="hero-description">
            Live queue manager for shop operators. Advance printing statuses, download customer documents, and verify pickup QR passes.
          </p>
        </section>

        {/* Counter QR Code Scanner / Verifier */}
        <section className="verifier-card">
          <h3>⚡ Counter Pickup QR Verifier</h3>
          <p>
            When a customer presents their phone screen at the counter, enter or scan the Booking ID / QR token to instantly verify and mark order as collected.
          </p>

          <form onSubmit={handleVerifyQR} className="verifier-form">
            <input
              type="text"
              placeholder="Scan or enter Booking ID (e.g. LP-20261012-001 or QR token)..."
              value={verifierInput}
              onChange={(e) => setVerifierInput(e.target.value)}
              className="verifier-input"
            />
            <button type="submit" className="verifier-btn">
              Verify & Complete Pickup
            </button>
          </form>

          {verifierError && (
            <p style={{ color: "#f87171", fontSize: "13px", marginTop: "10px", fontWeight: 600 }}>
              ⚠️ {verifierError}
            </p>
          )}

          {verificationResult && (
            <div
              style={{
                marginTop: "16px",
                padding: "16px",
                background: "#064e3b",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ fontSize: "15px", color: "#6ee7b7" }}>
                  ✅ Pickup Confirmed for Order {verificationResult.id}
                </strong>
                <p style={{ margin: "4px 0 0", color: "#d1fae5", fontSize: "13px" }}>
                  Customer: <strong>{verificationResult.customerName}</strong> ({verificationResult.customerPhone}) • Total: ₹{verificationResult.totalPrice}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVerificationResult(null)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Dismiss
              </button>
            </div>
          )}
        </section>

        {/* KPIs */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Total Orders</div>
            <div className="kpi-value">{stats.totalOrders}</div>
          </div>

          <div className="kpi-card" style={{ borderColor: "#fde68a" }}>
            <div className="kpi-label" style={{ color: "#d97706" }}>
              ⏳ Pending Queue
            </div>
            <div className="kpi-value" style={{ color: "#b45309" }}>
              {stats.pendingOrders}
            </div>
          </div>

          <div className="kpi-card" style={{ borderColor: "#bae6fd" }}>
            <div className="kpi-label" style={{ color: "#0284c7" }}>
              🖨️ Printing Now
            </div>
            <div className="kpi-value" style={{ color: "#0369a1" }}>
              {stats.printingOrders}
            </div>
          </div>

          <div className="kpi-card" style={{ borderColor: "#bbf7d0" }}>
            <div className="kpi-label" style={{ color: "#16a34a" }}>
              ✅ Ready for Pickup
            </div>
            <div className="kpi-value" style={{ color: "#15803d" }}>
              {stats.readyOrders}
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Today's Revenue</div>
            <div className="kpi-value">₹{stats.totalRevenue}</div>
          </div>
        </section>

        {/* Order Queue Management */}
        <section className="section">
          <div className="section-header" style={{ flexWrap: "wrap", gap: "10px" }}>
            <h2>Order Queue Management</h2>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Search orders (name, ID)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e4e4e7",
                  fontSize: "13px",
                }}
              />
              <button
                onClick={fetchData}
                className="shop-button secondary-button"
                style={{ fontSize: "13px", padding: "8px 14px" }}
              >
                🔄 Refresh List
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {[
              { id: "all", label: "All Orders" },
              { id: "pending", label: "⏳ Pending" },
              { id: "printing", label: "🖨️ Printing" },
              { id: "ready", label: "✅ Ready" },
              { id: "completed", label: "📦 Completed" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`filter-tab ${statusFilter === tab.id ? "active" : ""}`}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#71717a" }}>
              Loading queue orders...
            </div>
          ) : orders.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e8e8ed",
              }}
            >
              <h3>No orders in this queue</h3>
              <p style={{ color: "#71717a" }}>All orders are cleared or no matching orders found.</p>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div className="order-card" key={order.id}>
                  <div className="order-card-info">
                    <div className="order-card-icon">🖨️</div>
                    <div className="order-card-details">
                      <h4>
                        {order.id}
                        <span className={`status-pill ${getStatusClass(order.status)}`}>
                          ● {order.status}
                        </span>
                      </h4>
                      <p>
                        Customer: <strong>{order.customerName}</strong> (📞 {order.customerPhone})
                      </p>
                      <p style={{ margin: "2px 0 6px", fontSize: "13px", color: "#3f3f46" }}>
                        📄 <strong>{order.documentName}</strong> ({order.copies} copies • {order.paperSize} •{" "}
                        {order.colour === "colour" ? "Colour" : "B&W"} • {order.sides}-sided
                        {order.binding ? " • Spiral Binding" : ""}
                        {order.lamination ? " • Lamination" : ""})
                      </p>
                      {order.instructions && (
                        <p style={{ margin: "2px 0 6px", fontSize: "12px", color: "#6d4aff", fontStyle: "italic" }}>
                          Notes: "{order.instructions}"
                        </p>
                      )}
                      <div className="order-meta-chips">
                        <span>🕒 Slot: {order.pickupDate}, {order.pickupSlot}</span>
                        <span>💰 ₹{order.totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="order-actions" style={{ flexWrap: "wrap" }}>
                    {order.documentPath && (
                      <a
                        href={order.documentPath}
                        target="_blank"
                        rel="noreferrer"
                        className="shop-button secondary-button"
                        style={{ padding: "8px 12px", fontSize: "12px", textDecoration: "none" }}
                      >
                        📥 Print File
                      </a>
                    )}

                    {order.status === "pending" && (
                      <button
                        className="shop-button"
                        style={{ padding: "8px 12px", fontSize: "12px", background: "#0284c7" }}
                        onClick={() => handleUpdateStatus(order.id, "printing")}
                      >
                        Start Printing →
                      </button>
                    )}

                    {order.status === "printing" && (
                      <button
                        className="shop-button"
                        style={{ padding: "8px 12px", fontSize: "12px", background: "#16a34a" }}
                        onClick={() => handleUpdateStatus(order.id, "ready")}
                      >
                        Mark Ready →
                      </button>
                    )}

                    {order.status === "ready" && (
                      <button
                        className="shop-button"
                        style={{ padding: "8px 12px", fontSize: "12px", background: "#18181b" }}
                        onClick={() => handleUpdateStatus(order.id, "completed")}
                      >
                        Complete Handover ✓
                      </button>
                    )}

                    {order.status === "completed" && (
                      <span style={{ fontSize: "12px", color: "#71717a", fontWeight: 600 }}>
                        Done ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
