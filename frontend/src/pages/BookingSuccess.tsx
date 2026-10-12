import { Link, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";

export default function BookingSuccess() {
  const location = useLocation();
  const order = location.state || {
    id: "LP-20261012-001",
    shopName: "ABC Digital Prints",
    customerName: "Rahul Sharma",
    customerPhone: "9876543210",
    documentName: "document.pdf",
    pickupSlot: "8:30 PM",
    pickupDate: "Today",
    copies: 1,
    totalPrice: 20,
    status: "pending",
    qrToken: "VERIFY-LP-DEMO",
  };

  const bookingId = order.id || "LP-DEMO";
  const qrValue = order.qrToken || bookingId;

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
        <section className="success-page">
          <div className="success-icon">✓</div>

          <p className="eyebrow">ORDER CONFIRMED & QUEUED</p>
          <h1>Your order is booked!</h1>
          <p className="hero-description">
            Your print request has been saved in the database and sent to{" "}
            <strong>{order.shopName || "ABC Digital Prints"}</strong>.
          </p>

          <div className="booking-card">
            <div className="booking-shop">
              <div className="shop-icon">🖨️</div>
              <div>
                <strong>{order.shopName || "ABC Digital Prints"}</strong>
                <p>Printing & Document Pickup Counter</p>
              </div>

              <div style={{ marginLeft: "auto" }}>
                <span className={`status-pill ${getStatusClass(order.status)}`}>
                  ● {order.status || "pending"}
                </span>
              </div>
            </div>

            <div className="booking-id">
              <span>OFFICIAL BOOKING ID</span>
              <strong>{bookingId}</strong>
            </div>

            <div className="booking-details">
              <div>
                <span>Customer</span>
                <strong>{order.customerName}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{order.customerPhone}</strong>
              </div>

              <div>
                <span>Document</span>
                <strong>{order.documentName}</strong>
              </div>

              <div>
                <span>Scheduled Pickup</span>
                <strong style={{ color: "#6d4aff" }}>
                  {order.pickupDate || "Today"}, {order.pickupSlot}
                </strong>
              </div>

              <div>
                <span>Copies & Specs</span>
                <strong>
                  {order.copies || 1} copy • {order.paperSize || "A4"} ({order.colour === "colour" ? "Colour" : "B&W"})
                </strong>
              </div>

              <div>
                <span>Total Amount</span>
                <strong>₹{order.totalPrice || order.total || 0}</strong>
              </div>
            </div>

            {order.documentPath && (
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <a
                  href={order.documentPath}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#6d4aff",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  📥 View / Download Uploaded Document ({order.documentSize || "Ready"})
                </a>
              </div>
            )}

            <div className="qr-section">
              <div className="qr-wrapper">
                <QRCodeSVG value={qrValue} size={180} level="M" />
              </div>

              <h3>Your Counter Pickup QR Code</h3>
              <p>
                Show this QR code at the shop counter. The operator will scan or enter your ID to hand over your order.
              </p>
            </div>

            <div className="success-actions">
              <Link to="/bookings" className="continue-button">
                📋 View All My Bookings
              </Link>
              <Link to="/" className="home-button">
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}