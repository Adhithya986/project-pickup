import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    totalOrders: 0,
    pendingOrders: 0,
    printingOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    shopCount: 0,
  });
  const [shops, setShops] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAdminTab, setActiveAdminTab] = useState<"shops" | "orders" | "system">("shops");

  // Filter & Search states
  const [selectedShopFilter, setSelectedShopFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Add Shop Modal
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [newShopCategory, setNewShopCategory] = useState("Printing");
  const [newShopAddress, setNewShopAddress] = useState("");
  const [newShopPhone, setNewShopPhone] = useState("");
  const [newShopPrice, setNewShopPrice] = useState("From ₹2");
  const [newShopHours, setNewShopHours] = useState("8:00 AM - 10:00 PM");
  const [newShopTagline, setNewShopTagline] = useState("");

  const fetchAdminData = () => {
    // 1. Stats
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch((err) => console.error(err));

    // 2. Shops
    fetch("/api/shops")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setShops(data.data);
      })
      .catch((err) => console.error(err));

    // 3. Global Orders
    const params = new URLSearchParams();
    if (selectedShopFilter !== "all") params.set("shopId", selectedShopFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());

    fetch(`/api/bookings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 8000);
    return () => clearInterval(interval);
  }, [selectedShopFilter, statusFilter]);

  const handleAddShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) return;

    try {
      const res = await fetch("/api/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newShopName.trim(),
          category: newShopCategory,
          address: newShopAddress.trim() || "Campus Main Complex",
          phone: newShopPhone.trim() || "+91 98000 00000",
          startingPrice: newShopPrice.trim() || "From ₹2",
          openHours: newShopHours.trim() || "8:00 AM - 10:00 PM",
          tagline: newShopTagline.trim() || "Printing & Photocopy Services",
          distance: "0.5 km",
          icon: newShopCategory === "Stationery" ? "📚" : "🖨️",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddShopModal(false);
        setNewShopName("");
        setNewShopAddress("");
        setNewShopPhone("");
        setNewShopTagline("");
        fetchAdminData();
      } else {
        alert(data.message || "Failed to create shop");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding new shop");
    }
  };

  const handleAdminUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
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
        <section className="shops-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
            <Link to="/" className="back-link">
              ← Storefront View
            </Link>

            <Link
              to="/shop-dashboard"
              className="shop-button secondary-button"
              style={{ fontSize: "13px", padding: "8px 14px" }}
            >
              🏪 Switch to Shop Operator View →
            </Link>
          </div>

          <p className="eyebrow">PLATFORM SUPER ADMIN</p>
          <h1>Campus Network Control Center</h1>
          <p className="hero-description">
            Platform-wide management for campus administration. Oversee all registered print shops, review global order transactions, and monitor system health.
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#18181b",
              color: "white",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              marginTop: "10px",
            }}
          >
            <span>👑 Authenticated Admin:</span>
            <strong>{user?.name || "Campus System Admin"}</strong>
            <span style={{ color: "#a1a1aa" }}>({user?.email || "admin@localpickup.com"})</span>
          </div>
        </section>

        {/* Global Platform KPIs */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Total Platform Revenue</div>
            <div className="kpi-value" style={{ color: "#6d4aff" }}>
              ₹{stats.totalRevenue}
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Total Network Orders</div>
            <div className="kpi-value">{stats.totalOrders}</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Registered Shops</div>
            <div className="kpi-value">{stats.shopCount}</div>
          </div>

          <div className="kpi-card" style={{ borderColor: "#bae6fd" }}>
            <div className="kpi-label" style={{ color: "#0284c7" }}>
              Active Jobs
            </div>
            <div className="kpi-value" style={{ color: "#0369a1" }}>
              {stats.pendingOrders + stats.printingOrders}
            </div>
          </div>
        </section>

        {/* Admin Navigation Tabs */}
        <div style={{ display: "flex", gap: "14px", borderBottom: "1px solid #e4e4e7", marginBottom: "24px" }}>
          <button
            className={`nav-link ${activeAdminTab === "shops" ? "active" : ""}`}
            style={{ fontSize: "16px", padding: "10px 18px", borderBottom: activeAdminTab === "shops" ? "2px solid #6d4aff" : "none" }}
            onClick={() => setActiveAdminTab("shops")}
          >
            🏪 Managed Shops ({shops.length})
          </button>
          <button
            className={`nav-link ${activeAdminTab === "orders" ? "active" : ""}`}
            style={{ fontSize: "16px", padding: "10px 18px", borderBottom: activeAdminTab === "orders" ? "2px solid #6d4aff" : "none" }}
            onClick={() => setActiveAdminTab("orders")}
          >
            📋 Master Orders Audit ({orders.length})
          </button>
          <button
            className={`nav-link ${activeAdminTab === "system" ? "active" : ""}`}
            style={{ fontSize: "16px", padding: "10px 18px", borderBottom: activeAdminTab === "system" ? "2px solid #6d4aff" : "none" }}
            onClick={() => setActiveAdminTab("system")}
          >
            ⚡ System & Database
          </button>
        </div>

        {/* TAB 1: Shops Management */}
        {activeAdminTab === "shops" && (
          <section className="section" style={{ marginTop: "10px" }}>
            <div className="section-header">
              <h2>Registered Print Shops & Vendors</h2>
              <button
                className="shop-button"
                style={{ fontSize: "13px" }}
                onClick={() => setShowAddShopModal(true)}
              >
                + Register New Shop
              </button>
            </div>

            <div className="orders-grid">
              {shops.map((shop) => (
                <div className="order-card" key={shop.id}>
                  <div className="order-card-info">
                    <div className="order-card-icon">{shop.icon || "🖨️"}</div>
                    <div className="order-card-details">
                      <h4>
                        {shop.name}
                        <span style={{ fontSize: "12px", color: "#6d4aff", background: "#f0ebff", padding: "2px 8px", borderRadius: "8px" }}>
                          {shop.category}
                        </span>
                      </h4>
                      <p>
                        📍 {shop.address} • 📞 {shop.phone}
                      </p>
                      <div className="order-meta-chips">
                        <span>⭐ Rating: {shop.rating}</span>
                        <span>🕒 Hours: {shop.openHours}</span>
                        <span>📦 Total Orders: {shop.totalOrders || 0}</span>
                        <span>💰 {shop.startingPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="order-actions">
                    <Link
                      to={`/shops/${shop.id}`}
                      className="shop-button secondary-button"
                      style={{ fontSize: "12px", padding: "8px 12px" }}
                    >
                      Storefront View
                    </Link>
                    <Link
                      to="/shop-dashboard"
                      onClick={() => localStorage.setItem("operator_shop_id", String(shop.id))}
                      className="shop-button"
                      style={{ fontSize: "12px", padding: "8px 14px" }}
                    >
                      Open Operator Counter →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 2: Master Orders Audit */}
        {activeAdminTab === "orders" && (
          <section className="section" style={{ marginTop: "10px" }}>
            <div className="section-header" style={{ flexWrap: "wrap", gap: "10px" }}>
              <h2>Global Orders Log</h2>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                {/* Shop Filter */}
                <select
                  value={selectedShopFilter}
                  onChange={(e) => setSelectedShopFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e4e4e7",
                    fontSize: "13px",
                  }}
                >
                  <option value="all">All Shops</option>
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Search order ID, phone, customer..."
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
                  onClick={fetchAdminData}
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
                Loading global orders...
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
                <h3>No orders found</h3>
                <p style={{ color: "#71717a" }}>No orders matching current admin filters.</p>
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
                          <span style={{ fontSize: "12px", color: "#52525b", fontWeight: 600 }}>
                            [@ {order.shopName}]
                          </span>
                        </h4>
                        <p>
                          Customer: <strong>{order.customerName}</strong> (📞 {order.customerPhone}) • Doc: <strong>{order.documentName}</strong>
                        </p>
                        <div className="order-meta-chips">
                          <span>🕒 {order.pickupDate}, {order.pickupSlot}</span>
                          <span>📄 {order.copies} copies ({order.paperSize}, {order.colour})</span>
                          <span>💰 ₹{order.totalPrice}</span>
                        </div>
                      </div>
                    </div>

                    <div className="order-actions">
                      {order.documentPath && (
                        <a
                          href={order.documentPath}
                          target="_blank"
                          rel="noreferrer"
                          className="shop-button secondary-button"
                          style={{ padding: "8px 12px", fontSize: "12px", textDecoration: "none" }}
                        >
                          📥 View Doc
                        </a>
                      )}

                      {order.status !== "completed" && (
                        <button
                          className="shop-button"
                          style={{ padding: "8px 12px", fontSize: "12px", background: "#18181b" }}
                          onClick={() => handleAdminUpdateStatus(order.id, "completed")}
                        >
                          Force Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: System & Database Diagnostics */}
        {activeAdminTab === "system" && (
          <section className="section" style={{ marginTop: "10px" }}>
            <div
              style={{
                background: "white",
                padding: "26px",
                borderRadius: "16px",
                border: "1px solid #e8e8ed",
              }}
            >
              <h2 style={{ margin: "0 0 16px" }}>⚡ Backend & Database Diagnostics</h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                <div style={{ padding: "16px", background: "#f4f4f5", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "#71717a", fontWeight: 700 }}>DATABASE ENGINE</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>
                    SQLite 3 (better-sqlite3)
                  </div>
                  <div style={{ fontSize: "12px", color: "#16a34a", marginTop: "4px" }}>
                    ● WAL Journal Mode (High Performance)
                  </div>
                </div>

                <div style={{ padding: "16px", background: "#f4f4f5", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "#71717a", fontWeight: 700 }}>API STATUS</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>
                    Express.js (Port 5000)
                  </div>
                  <div style={{ fontSize: "12px", color: "#16a34a", marginTop: "4px" }}>
                    ● Healthy & Serving Requests
                  </div>
                </div>

                <div style={{ padding: "16px", background: "#f4f4f5", borderRadius: "12px" }}>
                  <div style={{ fontSize: "12px", color: "#71717a", fontWeight: 700 }}>UPLOADED FILES</div>
                  <div style={{ fontSize: "18px", fontWeight: 700, marginTop: "4px" }}>
                    backend/uploads/
                  </div>
                  <div style={{ fontSize: "12px", color: "#52525b", marginTop: "4px" }}>
                    Static File Server Active
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Modal: Register New Shop */}
        {showAddShopModal && (
          <div className="modal-overlay" onClick={() => setShowAddShopModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: "left" }}>
              <button className="close-modal-btn" onClick={() => setShowAddShopModal(false)}>
                ✕
              </button>

              <h2 style={{ margin: "0 0 14px", textAlign: "center" }}>Register New Print Shop</h2>
              <p style={{ color: "#71717a", fontSize: "13px", textAlign: "center", marginBottom: "20px" }}>
                Add a new verified campus or local print shop to the network.
              </p>

              <form onSubmit={handleAddShopSubmit}>
                <div className="form-input-group">
                  <label>Shop Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Metro Xerox & Digital Hub"
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-input-group">
                  <label>Category</label>
                  <select
                    value={newShopCategory}
                    onChange={(e) => setNewShopCategory(e.target.value)}
                    style={{
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1px solid #e4e4e7",
                      fontSize: "14px",
                    }}
                  >
                    <option value="Printing">Printing</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Documents">Documents</option>
                  </select>
                </div>

                <div className="form-input-group">
                  <label>Address / Campus Location *</label>
                  <input
                    type="text"
                    placeholder="e.g. Science Block, Ground Floor"
                    value={newShopAddress}
                    onChange={(e) => setNewShopAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-input-group">
                  <label>Contact Phone Number *</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98111 22334"
                    value={newShopPhone}
                    onChange={(e) => setNewShopPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-input-group">
                  <label>Tagline / Specialties</label>
                  <input
                    type="text"
                    placeholder="e.g. Laser Printing • Posters • Hard Binding"
                    value={newShopTagline}
                    onChange={(e) => setNewShopTagline(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px" }}>
                  <div className="form-input-group">
                    <label>Starting Price</label>
                    <input
                      type="text"
                      value={newShopPrice}
                      onChange={(e) => setNewShopPrice(e.target.value)}
                    />
                  </div>
                  <div className="form-input-group">
                    <label>Operating Hours</label>
                    <input
                      type="text"
                      value={newShopHours}
                      onChange={(e) => setNewShopHours(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "24px", display: "flex", gap: "10px" }}>
                  <button type="submit" className="shop-button" style={{ flex: 1 }}>
                    Register Shop
                  </button>
                  <button
                    type="button"
                    className="shop-button secondary-button"
                    onClick={() => setShowAddShopModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
