import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
  IconDownload,
  IconCheckCircle,
  IconUser,
  IconQrCode,
} from "../components/Icons";

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

  const fetchShopData = () => {
    if (!selectedShopId) return;

    fetch(`/api/shops/${selectedShopId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCurrentShop(data.data);
      })
      .catch((err) => console.error(err));

    fetch(`/api/stats/shop/${selectedShopId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch((err) => console.error(err));

    const params = new URLSearchParams();
    params.set("shopId", String(selectedShopId));
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
        setVerifierError(data.message || "Invalid Booking ID or QR pass");
      }
    } catch (err) {
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
      if (data.success) fetchShopData();
    } catch (err) {}
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
        {/* Header & Operator Identity */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "12px" }}>
            <Link to="/" style={{ fontSize: "13px", color: "#64748b", textDecoration: "none" }}>
              ← Storefront View
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isAdmin ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: 650, color: "#64748b" }}>Admin View:</span>
                  <select
                    value={selectedShopId}
                    onChange={(e) => setSelectedShopId(Number(e.target.value))}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      fontWeight: 600,
                      background: "white",
                    }}
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#334155", background: "#f1f5f9", padding: "6px 14px", borderRadius: "20px" }}>
                  <IconUser size={14} />
                  <span>Operator: <strong>{user?.name}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em" }}>
                {currentShop?.name || "Shop"} Counter
              </h1>
              <p style={{ fontSize: "14px", color: "#64748b", margin: "2px 0 0" }}>
                📍 {currentShop?.address} • 📞 {currentShop?.phone}
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <span className="status-pill status-ready" style={{ fontSize: "12px" }}>
                <IconCheckCircle size={13} />
                <span>Open & Receiving Orders</span>
              </span>
            </div>
          </div>
        </div>

        {/* Counter Scanner Card */}
        <section
          style={{
            background: "#0f172a",
            color: "white",
            padding: "22px 26px",
            borderRadius: "16px",
            marginBottom: "28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <IconQrCode size={18} color="#38bdf8" />
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Counter Pickup Verifier</h3>
          </div>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 16px" }}>
            When a student arrives at the pickup counter, enter or scan their Booking ID to complete pickup.
          </p>

          <form onSubmit={handleVerifyQR} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Scan or enter Booking ID (e.g. LP-20261012-001)..."
              value={verifierInput}
              onChange={(e) => setVerifierInput(e.target.value)}
              style={{
                flex: 1,
                minWidth: "240px",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #334155",
                background: "#1e293b",
                color: "white",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ background: "#2563eb" }}
            >
              Verify & Complete Pickup
            </button>
          </form>

          {verifierError && (
            <p style={{ color: "#f87171", fontSize: "13px", fontWeight: 600, marginTop: "10px" }}>
              ⚠️ {verifierError}
            </p>
          )}

          {verifierResult && (
            <div
              style={{
                marginTop: "14px",
                padding: "14px 18px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid #10b981",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ fontSize: "14px", color: "#6ee7b7" }}>
                  ✓ Pickup Confirmed for Order {verifierResult.id}
                </strong>
                <p style={{ margin: "2px 0 0", color: "#d1fae5", fontSize: "13px" }}>
                  Customer: <strong>{verifierResult.customerName}</strong> ({verifierResult.customerPhone}) • ₹{verifierResult.totalPrice}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVerifierResult(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: "4px 10px" }}
              >
                Dismiss
              </button>
            </div>
          )}
        </section>

        {/* Shop KPIs */}
        <div className="kpi-container">
          <div className="kpi-box">
            <div className="label">Total Shop Orders</div>
            <div className="val">{stats.totalOrders}</div>
          </div>
          <div className="kpi-box" style={{ borderLeft: "3px solid #f59e0b" }}>
            <div className="label" style={{ color: "#d97706" }}>Pending Print</div>
            <div className="val" style={{ color: "#b45309" }}>{stats.pendingOrders}</div>
          </div>
          <div className="kpi-box" style={{ borderLeft: "3px solid #2563eb" }}>
            <div className="label" style={{ color: "#2563eb" }}>Printing Now</div>
            <div className="val" style={{ color: "#1d4ed8" }}>{stats.printingOrders}</div>
          </div>
          <div className="kpi-box" style={{ borderLeft: "3px solid #10b981" }}>
            <div className="label" style={{ color: "#059669" }}>Ready for Pickup</div>
            <div className="val" style={{ color: "#047857" }}>{stats.readyOrders}</div>
          </div>
          <div className="kpi-box">
            <div className="label">Today's Revenue</div>
            <div className="val">₹{stats.totalRevenue}</div>
          </div>
        </div>

        {/* Section Tabs */}
        <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #e2e8f0", marginBottom: "20px" }}>
          <button
            className={`nav-link ${activeTab === "queue" ? "active" : ""}`}
            style={{ fontSize: "14.5px", padding: "8px 16px", borderRadius: "6px" }}
            onClick={() => setActiveTab("queue")}
          >
            Order Queue ({orders.length})
          </button>
          <button
            className={`nav-link ${activeTab === "services" ? "active" : ""}`}
            style={{ fontSize: "14.5px", padding: "8px 16px", borderRadius: "6px" }}
            onClick={() => setActiveTab("services")}
          >
            Services & Rates ({currentShop?.services?.length || 0})
          </button>
        </div>

        {/* TAB 1: Order Queue */}
        {activeTab === "queue" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              <div className="filter-tabs" style={{ marginBottom: 0 }}>
                {[
                  { id: "all", label: "All Queue" },
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
                <button
                  onClick={fetchShopData}
                  className="btn btn-secondary btn-sm"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading queue orders...</div>
            ) : orders.length === 0 ? (
              <div style={{ padding: "50px", textAlign: "center", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>Queue is clear</h3>
                <p style={{ fontSize: "13px", color: "#64748b" }}>No print jobs waiting under this filter.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {orders.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "16px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <strong style={{ fontSize: "15px" }}>{o.id}</strong>
                        <span className={`status-pill ${getStatusClass(o.status)}`}>{o.status}</span>
                        <span style={{ fontSize: "13px", fontWeight: 650, color: "#334155" }}>
                          {o.customerName} ({o.customerPhone})
                        </span>
                      </div>

                      <p style={{ fontSize: "13.5px", color: "#475569", margin: "2px 0 4px" }}>
                        📄 <strong>{o.documentName}</strong> ({o.copies} copies • {o.paperSize} • {o.colour === "colour" ? "Color" : "B&W"} • {o.sides}-sided
                        {o.binding ? " • Spiral Binding" : ""}
                        {o.lamination ? " • Lamination" : ""})
                      </p>

                      {o.instructions && (
                        <p style={{ fontSize: "12px", color: "#2563eb", margin: "2px 0 4px", fontStyle: "italic" }}>
                          Notes: "{o.instructions}"
                        </p>
                      )}

                      <div style={{ display: "flex", gap: "14px", fontSize: "12.5px", color: "#64748b" }}>
                        <span>🕒 Pickup: {o.pickupDate}, {o.pickupSlot}</span>
                        <strong style={{ color: "#0f172a" }}>₹{o.totalPrice}</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {o.documentPath && (
                        <a
                          href={o.documentPath}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          title="Open document file for physical printing"
                        >
                          <IconDownload size={14} />
                          <span>Print File</span>
                        </a>
                      )}

                      {o.status === "pending" && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ background: "#0284c7" }}
                          onClick={() => handleUpdateStatus(o.id, "printing")}
                        >
                          Start Printing →
                        </button>
                      )}

                      {o.status === "printing" && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ background: "#059669" }}
                          onClick={() => handleUpdateStatus(o.id, "ready")}
                        >
                          Mark Ready ✓
                        </button>
                      )}

                      {o.status === "ready" && (
                        <button
                          className="btn btn-dark btn-sm"
                          onClick={() => handleUpdateStatus(o.id, "completed")}
                        >
                          Complete Handover
                        </button>
                      )}

                      {o.status === "completed" && (
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                          Handed Over ✓
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Services & Pricing */}
        {activeTab === "services" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Menu & Service Offerings</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddService(!showAddService)}
              >
                + Add Service
              </button>
            </div>

            {showAddService && (
              <form
                onSubmit={handleAddService}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "18px",
                }}
              >
                <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>Add Service to Menu</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  <div className="form-group">
                    <label>Service Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Color Poster Print"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price Display *</label>
                    <input
                      type="text"
                      placeholder="e.g. From ₹15 / page"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      placeholder="Details about print or binding"
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Save Service
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowAddService(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
              {currentShop?.services?.map((svc: any) => (
                <div
                  key={svc.id}
                  style={{
                    background: "white",
                    padding: "16px 20px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>{svc.name}</h4>
                    <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0" }}>{svc.description}</p>
                    <strong style={{ fontSize: "13px", color: "#2563eb" }}>{svc.priceText}</strong>
                  </div>

                  <button
                    onClick={() => handleToggleService(svc.id, svc.isBookable)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "12px" }}
                  >
                    {svc.isBookable ? "🟢 Active Online" : "⚪ Walk-in Only"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
