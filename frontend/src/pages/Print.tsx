import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  IconUpload,
  IconFileText,
  IconX,
  IconArrowRight,
} from "../components/Icons";

export default function Print() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialShop = location.state || {
    shopId: 1,
    shopName: "ABC Digital Prints",
    serviceName: "Document Printing",
  };

  const [file, setFile] = useState<File | null>(null);
  const [paper, setPaper] = useState<"A4" | "A3">("A4");
  const [colour, setColour] = useState<"bw" | "colour">("bw");
  const [sides, setSides] = useState<"single" | "double">("single");
  const [copies, setCopies] = useState(1);
  const [binding, setBinding] = useState(false);
  const [lamination, setLamination] = useState(false);
  const [instructions, setInstructions] = useState("");

  const basePrice = paper === "A4" ? 2 : 5;
  const colourPrice = colour === "colour" ? 3 : 0;
  const doubleSideDiscount = sides === "double" ? 1 : 0;

  const printingPrice =
    Math.max(1, basePrice + colourPrice - doubleSideDiscount) * copies;

  const bindingPrice = binding ? 20 : 0;
  const laminationPrice = lamination ? 10 : 0;

  const total = printingPrice + bindingPrice + laminationPrice;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }

  function continueToPickup() {
    if (!file) return;

    navigate("/pickup", {
      state: {
        file,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        shopId: initialShop.shopId,
        shopName: initialShop.shopName,
        paper,
        colour,
        sides,
        copies,
        binding,
        lamination,
        instructions,
        total,
      },
    });
  }

  return (
    <div className="app">
      <Navbar />

      <main>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <Link to={`/shops/${initialShop.shopId || 1}`} style={{ fontSize: "13px", color: "#64748b", textDecoration: "none", display: "inline-block", marginBottom: "8px" }}>
            ← Back to {initialShop.shopName || "Shop"}
          </Link>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>
            Configure Your Print Order
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Vendor: <strong>{initialShop.shopName || "ABC Digital Prints"}</strong>
          </p>
        </div>

        <div className="config-layout">
          {/* Left: Configuration Steps */}
          <div>
            {/* 1. Upload */}
            <div className="config-card">
              <h2>1. Upload Document</h2>

              {!file ? (
                <label className="upload-dropzone">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.ppt,.pptx"
                    onChange={handleFileChange}
                    hidden
                  />
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center" }}>
                    <IconUpload size={20} />
                  </div>
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>Click or drag file to upload</strong>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Supports PDF, DOC, DOCX, JPG, PNG (up to 50MB)</span>
                </label>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center" }}>
                      <IconFileText size={18} />
                    </span>
                    <div>
                      <strong style={{ fontSize: "14px", display: "block" }}>{file.name}</strong>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{(file.size / 1024).toFixed(1)} KB • Attached</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "4px 8px" }}
                  >
                    <IconX size={14} />
                    <span>Change</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Paper Size */}
            <div className="config-card">
              <h2>2. Paper Size</h2>
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segmented-btn ${paper === "A4" ? "selected" : ""}`}
                  onClick={() => setPaper("A4")}
                >
                  <strong>A4 Standard</strong>
                  <span>Standard size (₹2 / page)</span>
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${paper === "A3" ? "selected" : ""}`}
                  onClick={() => setPaper("A3")}
                >
                  <strong>A3 Format</strong>
                  <span>Large drawing / poster (₹5 / page)</span>
                </button>
              </div>
            </div>

            {/* 3. Color Mode */}
            <div className="config-card">
              <h2>3. Print Color</h2>
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segmented-btn ${colour === "bw" ? "selected" : ""}`}
                  onClick={() => setColour("bw")}
                >
                  <strong>Black & White</strong>
                  <span>Standard laser print</span>
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${colour === "colour" ? "selected" : ""}`}
                  onClick={() => setColour("colour")}
                >
                  <strong>Full Color</strong>
                  <span>Rich color laser (+ ₹3)</span>
                </button>
              </div>
            </div>

            {/* 4. Sides */}
            <div className="config-card">
              <h2>4. Printing Sides</h2>
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segmented-btn ${sides === "single" ? "selected" : ""}`}
                  onClick={() => setSides("single")}
                >
                  <strong>Single-Sided</strong>
                  <span>Print on front side</span>
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${sides === "double" ? "selected" : ""}`}
                  onClick={() => setSides("double")}
                >
                  <strong>Double-Sided (Duplex)</strong>
                  <span>Both sides • ₹1 discount</span>
                </button>
              </div>
            </div>

            {/* 5. Copies */}
            <div className="config-card">
              <h2>5. Number of Copies</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                  <button
                    type="button"
                    onClick={() => setCopies((c) => Math.max(1, c - 1))}
                    style={{ width: "40px", height: "38px", background: "#f8fafc", fontSize: "16px", fontWeight: 700 }}
                  >
                    −
                  </button>
                  <span style={{ width: "48px", textAlign: "center", fontWeight: 700, fontSize: "15px" }}>
                    {copies}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCopies((c) => c + 1)}
                    style={{ width: "40px", height: "38px", background: "#f8fafc", fontSize: "16px", fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  {copies} {copies === 1 ? "complete copy" : "complete copies"}
                </span>
              </div>
            </div>

            {/* 6. Finishing Add-ons */}
            <div className="config-card">
              <h2>6. Optional Finishing & Binding</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", background: binding ? "#eff6ff" : "white" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      checked={binding}
                      onChange={(e) => setBinding(e.target.checked)}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <div>
                      <strong style={{ fontSize: "14px", display: "block" }}>Spiral / Comb Binding</strong>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Durable clear cover & comb binding</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#2563eb" }}>+ ₹20</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", background: lamination ? "#eff6ff" : "white" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      checked={lamination}
                      onChange={(e) => setLamination(e.target.checked)}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <div>
                      <strong style={{ fontSize: "14px", display: "block" }}>Thermal Lamination</strong>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Waterproof gloss protection</span>
                    </div>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#2563eb" }}>+ ₹10</span>
                </label>
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label>Special Instructions for Shopkeeper (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please staple top-left corner, or cover page in color only..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right: Summary Panel */}
          <aside className="summary-panel">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Vendor</span>
              <strong>{initialShop.shopName || "ABC Digital Prints"}</strong>
            </div>

            <div className="summary-row">
              <span>Print specs</span>
              <span>
                {copies}× {paper} ({colour === "bw" ? "B&W" : "Color"})
              </span>
            </div>

            <div className="summary-row">
              <span>Printing charges</span>
              <span>₹{printingPrice}</span>
            </div>

            {binding && (
              <div className="summary-row">
                <span>Spiral binding</span>
                <span>₹20</span>
              </div>
            )}

            {lamination && (
              <div className="summary-row">
                <span>Lamination</span>
                <span>₹10</span>
              </div>
            )}

            <div className="summary-row total-row">
              <span>Estimated Total</span>
              <span style={{ color: "#2563eb" }}>₹{total}</span>
            </div>

            <button
              className="continue-button"
              disabled={!file}
              onClick={continueToPickup}
              style={{ marginTop: "20px" }}
            >
              <span>Continue to Pickup Slot</span>
              <IconArrowRight size={16} />
            </button>

            {!file && (
              <p style={{ fontSize: "12px", color: "#64748b", textAlign: "center", marginTop: "10px" }}>
                Upload a document to proceed
              </p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}