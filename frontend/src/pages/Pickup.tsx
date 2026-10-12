import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";

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
          <p style={{ color: "#71717a" }}>Please select a shop and upload a file first.</p>
          <Link to="/shops" className="shop-button" style={{ display: "inline-block", marginTop: "16px" }}>
            Browse Shops →
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
      setErrorMsg("Please enter your name and phone number.");
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
      console.error(err);
      setErrorMsg("Connection error while creating booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app">
      <Navbar />

      <main>
        <section className="pickup-header">
          <Link to="/print" state={order} className="back-link">
            ← Back to print options
          </Link>

          <p className="eyebrow">PICKUP SCHEDULING & DETAILS</p>
          <h1>When would you like to pick it up?</h1>
          <p className="hero-description">
            Choose your pickup time and enter contact details. The shop will print your document in advance.
          </p>
        </section>

        <section className="pickup-layout">
          <div className="pickup-main">
            {/* Date selection */}
            <div className="pickup-section">
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                {["Today", "Tomorrow"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`filter-tab ${pickupDate === d ? "active" : ""}`}
                    onClick={() => setPickupDate(d)}
                  >
                    📅 {d}
                  </button>
                ))}
              </div>

              <div className="date-heading">
                <div>
                  <span className="date-label">{pickupDate.toUpperCase()}</span>
                  <h2>{pickupDate === "Today" ? "Available Pickup Slots Today" : "Available Tomorrow"}</h2>
                </div>
              </div>

              <div className="slot-grid">
                {pickupSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`time-slot ${selectedSlot === slot ? "selected" : ""}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <strong>{slot}</strong>
                    <span>{selectedSlot === slot ? "Selected" : "Available"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details Form */}
            <div className="pickup-section" style={{ marginTop: "24px" }}>
              <h2 style={{ fontSize: "18px", margin: "0 0 14px" }}>
                👤 Your Contact Information
              </h2>

              <div className="form-input-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Phone Number (for pickup verification SMS) *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Email Address (Optional for digital receipt)</label>
                <input
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="pickup-note">
              <span>💡</span>
              <div>
                <strong>Zero Queue Guarantee</strong>
                <p>
                  Your order is queued in the shop's system immediately. Just arrive at your selected slot, scan your QR code at the counter, and pick up!
                </p>
              </div>
            </div>
          </div>

          <aside className="price-summary">
            <h2>Booking Summary</h2>

            <div className="summary-shop">
              <span>Shop</span>
              <strong>{order.shopName || "ABC Digital Prints"}</strong>
            </div>

            <div className="summary-line">
              <span>Document</span>
              <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {order.fileName || "Document"}
              </span>
            </div>

            <div className="summary-line">
              <span>Print Type</span>
              <span>
                {order.paper} • {order.colour === "bw" ? "B&W" : "Colour"} • {order.sides}
              </span>
            </div>

            <div className="summary-line">
              <span>Copies</span>
              <span>{order.copies || 1}</span>
            </div>

            <div className="summary-line">
              <span>Scheduled Pickup</span>
              <span style={{ color: "#6d4aff", fontWeight: 700 }}>
                {pickupDate}, {selectedSlot}
              </span>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total Payable</span>
              <strong>₹{order.total || 0}</strong>
            </div>

            {errorMsg && (
              <p style={{ color: "#e11d48", fontSize: "13px", fontWeight: 600, margin: "10px 0" }}>
                {errorMsg}
              </p>
            )}

            <button
              className="continue-button"
              disabled={submitting || !selectedSlot}
              onClick={handleConfirmBooking}
            >
              {submitting ? "Booking into Database..." : "Confirm & Pre-Book Order →"}
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}