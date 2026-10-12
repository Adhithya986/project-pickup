import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function ShopDashboard() {
  const { user, isAdmin } = useAuth();
  const [shops, setShops] = useState<any[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<number>(() => {
    if (user?.shopId) return user.shopId;
    const saved = localStorage.getItem("operator_shop_id");
    return saved ? Number(saved) : 1;
  });
  const [currentShop, setCurrentShop] = useState<any>(null);
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
  const [activeTab, setActiveTab] = useState<"queue" | "services">("queue");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Counter QR Verifier
  const [verifierInput, setVerifierInput] = useState("");
  const [verifierResult, setVerifierResult] = useState<any | null>(null);
  const [verifierError, setVerifierError] = useState("");

  // New Service Form
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");

  // Load all shops for selector
  useEffect(() => {
    fetch("/api/shops")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShops(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch shop details, orders, and stats whenever selectedShopId changes
  const fetchShopData = () => {
    if (!selectedShopId) return;

    // 1. Shop details
    fetch(`/api/shops/${selectedShopId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCurrentShop(data.data);
        }
      })
      .catch((err) => console.error(err));

    // 2. Shop stats
    fetch(`/api/stats/shop/${selectedShopId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch((err) => console.error(err));

    // 3. Shop orders
    const params = new URLSearchParams();
    params.set("shopId", String(selectedShopId));
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());

    fetch(`/api/bookings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    localStorage.setItem("operator_shop_id", String(selectedShopId));
    fetchShopData();
    const interval = setInterval(fetchShopData, 7000);
    return () => clearInterval(interval);
  }, [selectedShopId, statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchShopData();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating order status");
    }
  };

  const handleVerifyQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifierError("");
    setVerifierResult(null);

    if (!verifierInput.trim()) return;

    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(verifierInput.trim())}/verify`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && data.verified) {
        setVerifierResult(data.data);
        setVerifierInput("");
        fetchShopData();
      } else {
        setVerifierError(data.message || "Invalid QR pass or booking not found");
      }
    } catch (err) {
      console.error(err);
      setVerifierError("Network error during counter verification");
    }
  };

  const handleToggleService = async (serviceId: number, currentStatus: number) => {
    try {
      const res = await fetch(`/api/shops/${selectedShopId}/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBookable: currentStatus === 1 ? 0 : 1 }),
      });
      const data = await res.json();
      if (data.success) {
        fetchShopData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice.trim()) return;

    try {
      const res = await fetch(`/api/shops/${selectedShopId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newServiceName.trim(),
          priceText: newServicePrice.trim(),
          description: newServiceDesc.trim(),
          basePrice: 2,
          isBookable: 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddService(false);
        setNewServiceName("");
        setNewServicePrice("");
        setNewServiceDesc("");
        fetchShopData();
      }
    } catch (err) {
      console.error(err);
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
        {/* Operator Header & Shop Switcher */}
        <section className="shops-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
            <Link to="/" className="back-link">
              ← Storefront View
            </Link>

            {/* Shop Switcher / Identity Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isAdmin ? (
                <>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#71717a" }}>
                    👑 Admin Switch Shop:
                  </span>
                  <select
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(Number(e.target.value))}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d4d4d8",
                      fontSize: "14px",
                      fontWeight: 600,
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <div
                  style={{
                    background: "#f4f4f5",
                    padding: "6px 14px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#3f3f46",
                  }}
                >
                  👤 Operator: <strong>{user?.name}</strong> ({user?.email})
                </div>
              )}
            </div>
          </div>

          <p className="eyebrow">SHOP OPERATOR PORTAL</p>
          <h1>{currentShop?.name || "Print Shop"} Counter</h1>
          <p className="hero-description">
            Live queue manager for this counter. View incoming orders, print customer files, advance statuses, and verify QR passes.
          </p>

          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              fontSize: "13px",
              color: "#52525b",
              background: "#f4f4f5",
              padding: "10px 16px",
              borderRadius: "10px",
              maxWidth: "700px",
            }}
          >
            <span>📍 {currentShop?.address}</span>
            <span>📞 {currentShop?.phone}</span>
            <span>🕒 {currentShop?.openHours}</span>
            <span style={{ color: "#16a34a", fontWeight: 700 }}>🟢 Accepting Pre-Orders</span>
          </div>
        </section>

        {/* Counter QR Scanner / Verifier */}
        <section className="verifier-card">
          <h3>⚡ Counter Pickup QR Verifier</h3>
          <p>
            When a student arrives at your counter, scan or enter their Booking ID / QR pass to verify and complete handoff.
          </p>

          <form onSubmit={handleVerifyQR} className="verifier-form">
            <input
              type="text"
              placeholder="Enter Booking ID (e.g. LP-20261012-001 or QR pass)..."
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

          {verifierResult && (
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
                  ✅ Pickup Confirmed for Order {verifierResult.id}
                </strong>
                <p style={{ margin: "4px 0 0", color: "#d1fae5", fontSize: "13px" }}>
                  Customer: <strong>{verifierResult.customerName}</strong> ({verifierResult.customerPhone}) • Total: ₹{verifierResult.totalPrice}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVerifierResult(null)}
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

        {/* Shop Specific KPIs */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Total Shop Orders</div>
            <div className="kpi-value">{stats.totalOrders}</div>
          </div>

          <div className="kpi-card" style={{ borderColor: "#fde68a" }}>
            <div className="kpi-label" style={{ color: "#d97706" }}>
              ⏳ Pending Print
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
            <div className="kpi-label">Shop Revenue</div>
            <div className="kpi-value">₹{stats.totalRevenue}</div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "14px", borderBottom: "1px solid #e4e4e7", marginBottom: "20px" }}>
          <button
            className={`nav-link ${activeTab === "queue" ? "active" : ""}`}
            style={{ fontSize: "16px", padding: "10px 18px", borderBottom: activeTab === "queue" ? "2px solid #6d4aff" : "none" }}
            onClick={() => setActiveTab("queue")}
          >
            🖨️ Print Order Queue ({orders.length})
          </button>
          <button
            className={`nav-link ${activeTab === "services" ? "active" : ""}`}
            style={{ fontSize: "16px", padding: "10px 18px", borderBottom: activeTab === "services" ? "2px solid #6d4aff" : "none" }}
            onClick={() => setActiveTab("services")}
          >
            ⚙️ Services & Pricing ({currentShop?.services?.length || 0})
          </button>
        </div>

        {/* TAB 1: Order Queue */}
        {activeTab === "queue" && (
          <section className="section" style={{ marginTop: "10px" }}>
            <div className="section-header" style={{ flexWrap: "wrap", gap: "10px" }}>
              <h2>Incoming Orders for {currentShop?.name}</h2>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Search customer, ID..."
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
                  onClick={fetchShopData}
                  className="shop-button secondary-button"
                  style={{ fontSize: "13px", padding: "8px 14px" }}
                >
                  🔄 Refresh
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
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px 20px",
                  background: "white",
                  borderRadius: "16px",
                  border: "1px solid #e8e8ed",
                }}
              >
                <h3>No orders in this queue</h3>
                <p style={{ color: "#71717a" }}>There are no active orders for this filter right now.</p>
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
                            Customer Instructions: "{order.instructions}"
                          </p>
                        )}
                        <div className="order-meta-chips">
                          <span>🕒 Scheduled: {order.pickupDate}, {order.pickupSlot}</span>
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
                          title="Open uploaded file to print"
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
                          Handed Over ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: Services & Pricing Manager */}
        {activeTab === "services" && (
          <section className="section" style={{ marginTop: "10px" }}>
            <div className="section-header">
              <h2>Services Offered by {currentShop?.name}</h2>
              <button
                className="shop-button"
                onClick={() => setShowAddService(!showAddService)}
                style={{ fontSize: "13px" }}
              >
                + Add New Service
              </button>
            </div>

            {showAddService && (
              <form
                onSubmit={handleAddService}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "14px",
                  border: "1px solid #e8e8ed",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ margin: "0 0 14px", fontSize: "16px" }}>Add Service to Shop Menu</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <div className="form-input-group">
                    <label>Service Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Color Poster Print"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-input-group">
                    <label>Price Display *</label>
                    <input
                      type="text"
                      placeholder="e.g. From ₹15 / page"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-input-group">
                    <label>Description</label>
                    <input
                      type="text"
                      placeholder="Brief details about service"
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                  <button type="submit" className="shop-button">
                    Save Service
                  </button>
                  <button
                    type="button"
                    className="shop-button secondary-button"
                    onClick={() => setShowAddService(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="services-list">
              {currentShop?.services?.map((svc: any) => (
                <div className="service-card" key={svc.id}>
                  <div className="service-icon">{svc.icon || "📄"}</div>
                  <div className="service-info">
                    <h3>{svc.name}</h3>
                    <p>{svc.description}</p>
                    <strong>{svc.priceText}</strong>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                      className={`shop-button ${svc.isBookable ? "" : "secondary-button"}`}
                      style={{ fontSize: "13px", padding: "8px 14px" }}
                      onClick={() => handleToggleService(svc.id, svc.isBookable)}
                    >
                      {svc.isBookable ? "🟢 Online Active" : "⚪ Walk-in Only"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
