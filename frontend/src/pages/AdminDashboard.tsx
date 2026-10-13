import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { IconDownload, IconX } from "../components/Icons";

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

  const [selectedShopFilter, setSelectedShopFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [newShopCategory, setNewShopCategory] = useState("Printing");
  const [newShopAddress, setNewShopAddress] = useState("");
  const [newShopPhone, setNewShopPhone] = useState("");
  const [newShopPrice, setNewShopPrice] = useState("From ₹2");
  const [newShopHours, setNewShopHours] = useState("8:00 AM - 10:00 PM");
  const [newShopTagline, setNewShopTagline] = useState("");

  const fetchAdminData = () => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch((err) => console.error(err));

    fetch("/api/shops")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setShops(data.data);
      })
      .catch((err) => console.error(err));

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
          address: newShopAddress.trim() || "Campus Complex",
          phone: newShopPhone.trim() || "+91 98000 00000",
          startingPrice: newShopPrice.trim() || "From ₹2",
          openHours: newShopHours.trim() || "8:00 AM - 10:00 PM",
          tagline: newShopTagline.trim() || "Print & Photocopy",
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
      if (data.success) fetchAdminData();
    } catch (err) {}
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
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
            <Link to="/" style={{ fontSize: "13px", color: "#64748b", textDecoration: "none" }}>
              ← Storefront View
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "13px", color: "#334155", background: "#f1f5f9", padding: "5px 12px", borderRadius: "20px" }}>
                Admin: <strong>{user?.name || "Campus System Admin"}</strong>
              </span>
              <Link to="/shop-dashboard" className="btn btn-secondary btn-sm">
                Switch to Counter View →
              </Link>
            </div>
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>
            Platform Administration Console
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Central campus control center. Monitor vendors, audit orders, and manage platform health.
          </p>
        </div>

        {/* Global KPIs */}
        <div className="kpi-container">
          <div className="kpi-box">
            <div className="label">Total Network Revenue</div>
            <div className="val" style={{ color: "#2563eb" }}>₹{stats.totalRevenue}</div>
          </div>
          <div className="kpi-box">
            <div className="label">Total Platform Orders</div>
            <div className="val">{stats.totalOrders}</div>
          </div>
          <div className="kpi-box">
            <div className="label">Registered Vendors</div>
            <div className="val">{stats.shopCount}</div>
          </div>
          <div className="kpi-box">
            <div className="label">Active Queue Load</div>
            <div className="val" style={{ color: "#0284c7" }}>
              {stats.pendingOrders + stats.printingOrders}
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #e2e8f0", marginBottom: "22px" }}>
          <button
            className={`nav-link ${activeAdminTab === "shops" ? "active" : ""}`}
            style={{ fontSize: "14.5px", padding: "8px 16px", borderRadius: "6px" }}
            onClick={() => setActiveAdminTab("shops")}
          >
            Registered Print Shops ({shops.length})
          </button>
          <button
            className={`nav-link ${activeAdminTab === "orders" ? "active" : ""}`}
            style={{ fontSize: "14.5px", padding: "8px 16px", borderRadius: "6px" }}
            onClick={() => setActiveAdminTab("orders")}
          >
            Master Orders Audit ({orders.length})
          </button>
          <button
            className={`nav-link ${activeAdminTab === "system" ? "active" : ""}`}
            style={{ fontSize: "14.5px", padding: "8px 16px", borderRadius: "6px" }}
            onClick={() => setActiveAdminTab("system")}
          >
            System Diagnostics
          </button>
        </div>

        {/* TAB 1: Registered Shops */}
        {activeAdminTab === "shops" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Print Shops & Campus Vendors</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddShopModal(true)}
              >
                + Register New Shop
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
              {shops.map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span className="shop-badge">{s.category}</span>
                      <span style={{ fontSize: "13px", fontWeight: 700 }}>★ {s.rating}</span>
                    </div>

                    <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "2px 0 4px" }}>{s.name}</h3>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>📍 {s.address}</p>
                    <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0" }}>📞 {s.phone}</p>

                    <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#64748b", marginTop: "12px" }}>
                      <span>🕒 {s.openHours}</span>
                      <span>📦 {s.totalOrders || 0} total orders</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                    <Link
                      to={`/shops/${s.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      Storefront
                    </Link>
                    <Link
                      to="/shop-dashboard"
                      onClick={() => localStorage.setItem("operator_shop_id", String(s.id))}
                      className="btn btn-dark btn-sm"
                      style={{ flex: 1, justifyContent: "center" }}
                    >
                      Open Counter →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Master Orders Audit */}
        {activeAdminTab === "orders" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <select
                  value={selectedShopFilter}
                  onChange={(e) => setSelectedShopFilter(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    background: "white",
                  }}
                >
                  <option value="all">All Shops</option>
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <div className="filter-tabs" style={{ marginBottom: 0 }}>
                  {[
                    { id: "all", label: "All" },
                    { id: "pending", label: "Pending" },
                    { id: "printing", label: "Printing" },
                    { id: "ready", label: "Ready" },
                    { id: "completed", label: "Completed" },
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
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Search customer, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                />
                <button onClick={fetchAdminData} className="btn btn-secondary btn-sm">
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading orders log...</div>
            ) : orders.length === 0 ? (
              <div style={{ padding: "50px", textAlign: "center", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>No orders match filter</h3>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {orders.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "16px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "3px" }}>
                        <strong>{o.id}</strong>
                        <span className={`status-pill ${getStatusClass(o.status)}`}>{o.status}</span>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#2563eb" }}>
                          [{o.shopName}]
                        </span>
                      </div>

                      <p style={{ fontSize: "13px", color: "#475569", margin: "2px 0" }}>
                        Customer: <strong>{o.customerName}</strong> ({o.customerPhone}) • Doc: {o.documentName}
                      </p>

                      <div style={{ display: "flex", gap: "14px", fontSize: "12px", color: "#64748b" }}>
                        <span>🕒 {o.pickupDate}, {o.pickupSlot}</span>
                        <span>{o.copies} copies ({o.paperSize}, {o.colour})</span>
                        <strong style={{ color: "#0f172a" }}>₹{o.totalPrice}</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {o.documentPath && (
                        <a
                          href={o.documentPath}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          <IconDownload size={14} />
                          <span>View Doc</span>
                        </a>
                      )}

                      {o.status !== "completed" && (
                        <button
                          onClick={() => handleAdminUpdateStatus(o.id, "completed")}
                          className="btn btn-dark btn-sm"
                        >
                          Force Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: System Diagnostics */}
        {activeAdminTab === "system" && (
          <div style={{ background: "white", padding: "26px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>Platform Engine & Database</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Database Engine</div>
                <div style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>SQLite 3 (better-sqlite3)</div>
                <div style={{ fontSize: "12px", color: "#059669", marginTop: "2px" }}>✓ WAL Journal Mode Active</div>
              </div>
              <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Backend Runtime</div>
                <div style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>Express.js API (:5000)</div>
                <div style={{ fontSize: "12px", color: "#059669", marginTop: "2px" }}>✓ Serving Requests Cleanly</div>
              </div>
              <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>File Storage</div>
                <div style={{ fontSize: "16px", fontWeight: 700, marginTop: "4px" }}>backend/uploads/</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Direct Static Server</div>
              </div>
            </div>
          </div>
        )}

        {/* Add Shop Modal */}
        {showAddShopModal && (
          <div className="modal-overlay" onClick={() => setShowAddShopModal(false)}>
            <div className="modal-clean" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setShowAddShopModal(false)}>
                <IconX size={18} />
              </button>

              <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "4px" }}>Register Print Shop</h2>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
                Add a new campus or neighborhood vendor to the LocalPickup network.
              </p>

              <form onSubmit={handleAddShopSubmit}>
                <div className="form-group">
                  <label>Shop Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Science Block Xerox & Prints"
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newShopCategory}
                    onChange={(e) => setNewShopCategory(e.target.value)}
                  >
                    <option value="Printing">Printing</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Documents">Documents</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Address / Location *</label>
                  <input
                    type="text"
                    placeholder="e.g. Near North Gate Canteen"
                    value={newShopAddress}
                    onChange={(e) => setNewShopAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={newShopPhone}
                    onChange={(e) => setNewShopPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tagline / Highlights</label>
                  <input
                    type="text"
                    placeholder="e.g. High-speed laser & project binding"
                    value={newShopTagline}
                    onChange={(e) => setNewShopTagline(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="form-group">
                    <label>Starting Price</label>
                    <input
                      type="text"
                      value={newShopPrice}
                      onChange={(e) => setNewShopPrice(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Operating Hours</label>
                    <input
                      type="text"
                      value={newShopHours}
                      onChange={(e) => setNewShopHours(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Register Shop
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
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
