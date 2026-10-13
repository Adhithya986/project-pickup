import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import { IconArrowRight, IconShield } from "../components/Icons";

const pickupSlots = [
  "10:00 AM",
  "11:30 AM",
  "1:00 PM",
  "3:30 PM",
  "5:00 PM",
  "6:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
  "9:30 PM",
];

export default function Pickup() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state;

  const [pickupDate, setPickupDate] = useState("Today");
  const [selectedSlot, setSelectedSlot] = useState<string>("8:30 PM");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!order) {
    return (
      <div className="app">
        <Navbar />
        <main style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>No active print configuration</h2>
          <p style={{ color: "#64748b", margin: "8px 0 16px" }}>Please select a shop and upload a file first.</p>
          <Link to="/shops" className="btn btn-primary btn-sm">
            Browse Shops
          </Link>
        </main>
      </div>
    );
  }

  async function handleConfirmBooking() {
    if (!selectedSlot) {
      setErrorMsg("Please select a pickup time slot.");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg("Please enter your name and contact phone number.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      const formData = new FormData();
      if (order.file) {
        formData.append("file", order.file);
      }
      formData.append("shopId", String(order.shopId || 1));
      formData.append("shopName", order.shopName || "ABC Digital Prints");
      formData.append("documentName", order.fileName || "document.pdf");
      formData.append("documentSize", order.fileSize || "1.2 MB");
      formData.append("paperSize", order.paper || "A4");
      formData.append("colour", order.colour || "bw");
      formData.append("sides", order.sides || "single");
      formData.append("copies", String(order.copies || 1));
      formData.append("binding", String(order.binding ? 1 : 0));
      formData.append("lamination", String(order.lamination ? 1 : 0));
      formData.append("instructions", order.instructions || "");
      formData.append("pickupDate", pickupDate);
      formData.append("pickupSlot", selectedSlot);
      formData.append("totalPrice", String(order.total || 0));
      formData.append("customerName", customerName.trim());
      formData.append("customerPhone", customerPhone.trim());
      formData.append("customerEmail", customerEmail.trim());

      const res = await fetch("/api/bookings", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.success && result.data) {
        navigate("/booking-success", { state: result.data });
      } else {
        setErrorMsg(result.message || "Failed to confirm booking.");
      }
    } catch (err: any) {
      setErrorMsg("Connection error while creating booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <Link to="/print" state={order} style={{ fontSize: "13px", color: "#64748b", textDecoration: "none", display: "inline-block", marginBottom: "8px" }}>
            ← Back to print options
          </Link>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>
            Schedule Pickup & Contact Info
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Vendor: <strong>{order.shopName || "ABC Digital Prints"}</strong>
          </p>
        </div>

        <div className="config-layout">
          {/* Main options */}
          <div>
            {/* Slot picker */}
            <div className="config-card">
              <h2>1. Select Pickup Time Slot</h2>

              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {["Today", "Tomorrow"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`filter-tab ${pickupDate === d ? "active" : ""}`}
                    onClick={() => setPickupDate(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
                {pickupSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: selectedSlot === slot ? "2px solid #2563eb" : "1px solid #e2e8f0",
                      background: selectedSlot === slot ? "#eff6ff" : "white",
                      color: selectedSlot === slot ? "#2563eb" : "#334155",
                      fontWeight: 650,
                      fontSize: "13px",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div>{slot}</div>
                    <span style={{ fontSize: "11px", fontWeight: 400, color: selectedSlot === slot ? "#2563eb" : "#94a3b8" }}>
                      {selectedSlot === slot ? "Selected" : "Available"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Contact */}
            <div className="config-card">
              <h2>2. Contact Information</h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "-6px 0 16px" }}>
                Used for counter identification and pickup pass delivery.
              </p>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number (for counter verification) *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address (Optional for digital copy)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", fontSize: "12.5px", color: "#64748b", marginTop: "10px" }}>
                <IconShield size={16} color="#059669" />
                <span>Your contact details are encrypted and only shared with the selected print shopkeeper.</span>
              </div>
            </div>
          </div>

          {/* Sticky Summary */}
          <aside className="summary-panel">
            <h3>Booking Review</h3>

            <div className="summary-row">
              <span>Vendor</span>
              <strong>{order.shopName}</strong>
            </div>

            <div className="summary-row">
              <span>Document</span>
              <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {order.fileName}
              </span>
            </div>

            <div className="summary-row">
              <span>Print specs</span>
              <span>
                {order.copies}× {order.paper} ({order.colour === "bw" ? "B&W" : "Color"})
              </span>
            </div>

            <div className="summary-row">
              <span>Pickup schedule</span>
              <strong style={{ color: "#2563eb" }}>
                {pickupDate}, {selectedSlot}
              </strong>
            </div>

            <div className="summary-row total-row">
              <span>Payable Total</span>
              <span style={{ color: "#2563eb" }}>₹{order.total}</span>
            </div>

            {errorMsg && (
              <p style={{ color: "#ef4444", fontSize: "13px", fontWeight: 600, margin: "14px 0 0" }}>
                {errorMsg}
              </p>
            )}

            <button
              className="continue-button"
              disabled={submitting || !selectedSlot}
              onClick={handleConfirmBooking}
              style={{ marginTop: "20px" }}
            >
              <span>{submitting ? "Confirming..." : "Confirm & Pre-Book Order"}</span>
              <IconArrowRight size={16} />
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}