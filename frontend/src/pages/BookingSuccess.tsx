import { Link, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";
import {
  IconCheckCircle,
  IconClock,
  IconDownload,
  IconArrowRight,
} from "../components/Icons";

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
    paperSize: "A4",
    colour: "bw",
    totalPrice: 20,
    status: "pending",
    qrToken: "VERIFY-LP-DEMO",
  };

  const bookingId = order.id || "LP-DEMO";
  const qrValue = order.qrToken || bookingId;

  return (
    <div className="app">
      <Navbar />

      <main style={{ maxWidth: "600px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#ecfdf5",
              color: "#059669",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 14px",
            }}
          >
            <IconCheckCircle size={24} />
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>
            Order Confirmed & Queued
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Your print job has been sent to <strong>{order.shopName}</strong>.
          </p>
        </div>

        {/* Digital Pickup Pass Card */}
        <div className="digital-ticket">
          <div className="ticket-header">
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase" }}>
                PICKUP PASS
              </span>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "2px 0 0" }}>
                {order.shopName}
              </h2>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "20px",
                background: "rgba(255,255,255,0.15)",
                color: "white",
              }}
            >
              {order.status || "Pending"}
            </span>
          </div>

          <div className="ticket-body">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>BOOKING ID</span>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", letterSpacing: "0.03em" }}>{bookingId}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>SCHEDULED TIME</span>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                  <IconClock size={15} />
                  <span>{order.pickupDate || "Today"}, {order.pickupSlot}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div>
                <span style={{ fontSize: "11.5px", color: "#64748b" }}>Customer</span>
                <div style={{ fontSize: "13.5px", fontWeight: 700 }}>{order.customerName}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>{order.customerPhone}</div>
              </div>
              <div>
                <span style={{ fontSize: "11.5px", color: "#64748b" }}>Document Specs</span>
                <div style={{ fontSize: "13.5px", fontWeight: 700 }}>
                  {order.copies || 1}× {order.paperSize || "A4"} ({order.colour === "colour" ? "Color" : "B&W"})
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {order.documentName}
                </div>
              </div>
            </div>

            {order.documentPath && (
              <div style={{ marginTop: "14px", textAlign: "center" }}>
                <a
                  href={order.documentPath}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#2563eb",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <IconDownload size={14} />
                  <span>Download / Preview Uploaded File</span>
                </a>
              </div>
            )}

            {/* QR Code Pass */}
            <div className="ticket-qr">
              <div
                style={{
                  background: "white",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "var(--shadow-sm)",
                  display: "inline-block",
                }}
              >
                <QRCodeSVG value={qrValue} size={160} level="M" />
              </div>
              <p style={{ fontSize: "13px", color: "#64748b", marginTop: "12px" }}>
                Present this QR code at the counter for contactless order handoff.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <Link to="/bookings" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                <span>View All My Bookings</span>
                <IconArrowRight size={15} />
              </Link>
              <Link to="/" className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}