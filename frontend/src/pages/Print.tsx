import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

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
        <section className="print-header">
          <Link to={`/shops/${initialShop.shopId || 1}`} className="back-link">
            ← Back to {initialShop.shopName || "Shop"}
          </Link>

          <p className="eyebrow">ORDER CONFIGURATION</p>
          <h1>Configure your print</h1>
          <p className="hero-description">
            Selected Shop: <strong>{initialShop.shopName || "ABC Digital Prints"}</strong>
            <br />
            Upload your document and choose print specifications.
          </p>
        </section>

        <section className="print-layout">
          <div className="print-form">
            {/* 1. Upload */}
            <div className="form-section">
              <h2>1. Upload document</h2>

              {!file ? (
                <label className="upload-box">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.ppt,.pptx"
                    onChange={handleFileChange}
                    hidden
                  />
                  <div className="upload-icon">📄</div>
                  <strong>Click to upload your document</strong>
                  <span>Supports PDF, DOC, DOCX, JPG, PNG (up to 50MB)</span>
                </label>
              ) : (
                <div className="selected-file">
                  <div className="file-icon">📄</div>
                  <div>
                    <strong>{file.name}</strong>
                    <p>{(file.size / 1024).toFixed(1)} KB • Ready for upload</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="remove-file"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* 2. Paper Size */}
            <div className="form-section">
              <h2>2. Paper size</h2>
              <div className="option-grid">
                <button
                  type="button"
                  className={`option ${paper === "A4" ? "selected" : ""}`}
                  onClick={() => setPaper("A4")}
                >
                  <strong>A4</strong>
                  <span>Standard size (₹2/page)</span>
                </button>

                <button
                  type="button"
                  className={`option ${paper === "A3" ? "selected" : ""}`}
                  onClick={() => setPaper("A3")}
                >
                  <strong>A3</strong>
                  <span>Large poster size (₹5/page)</span>
                </button>
              </div>
            </div>

            {/* 3. Colour */}
            <div className="form-section">
              <h2>3. Print Colour</h2>
              <div className="option-grid">
                <button
                  type="button"
                  className={`option ${colour === "bw" ? "selected" : ""}`}
                  onClick={() => setColour("bw")}
                >
                  <strong>Black & White</strong>
                  <span>Economical standard</span>
                </button>

                <button
                  type="button"
                  className={`option ${colour === "colour" ? "selected" : ""}`}
                  onClick={() => setColour("colour")}
                >
                  <strong>Colour Laser</strong>
                  <span>+ ₹3 per page</span>
                </button>
              </div>
            </div>

            {/* 4. Sides */}
            <div className="form-section">
              <h2>4. Printing Sides</h2>
              <div className="option-grid">
                <button
                  type="button"
                  className={`option ${sides === "single" ? "selected" : ""}`}
                  onClick={() => setSides("single")}
                >
                  <strong>Single-sided</strong>
                  <span>Standard 1-side</span>
                </button>

                <button
                  type="button"
                  className={`option ${sides === "double" ? "selected" : ""}`}
                  onClick={() => setSides("double")}
                >
                  <strong>Double-sided (Duplex)</strong>
                  <span>Saves paper • ₹1 discount</span>
                </button>
              </div>
            </div>

            {/* 5. Copies */}
            <div className="form-section">
              <h2>5. Number of copies</h2>
              <div className="copies-control">
                <button
                  type="button"
                  onClick={() => setCopies((c) => Math.max(1, c - 1))}
                >
                  −
                </button>
                <strong>{copies}</strong>
                <button
                  type="button"
                  onClick={() => setCopies((c) => c + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* 6. Optional Services */}
            <div className="form-section">
              <h2>6. Optional Finishing</h2>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={binding}
                  onChange={(e) => setBinding(e.target.checked)}
                />
                <span>
                  <strong>Spiral / Comb Binding</strong>
                  <small>+ ₹20 per booklet</small>
                </span>
              </label>

              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={lamination}
                  onChange={(e) => setLamination(e.target.checked)}
                />
                <span>
                  <strong>Heat Lamination</strong>
                  <small>+ ₹10 per sheet</small>
                </span>
              </label>

              <div className="form-input-group" style={{ marginTop: "16px" }}>
                <label>Special Notes / Instructions for Shopkeeper (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please print page 1 in colour and rest in B&W, or staple top-left corner..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <aside className="price-summary">
            <h2>Order Summary</h2>

            <div className="summary-shop">
              <span>Shop</span>
              <strong>{initialShop.shopName || "ABC Digital Prints"}</strong>
            </div>

            <div className="summary-line">
              <span>
                Printing ({copies} copy{copies > 1 ? "ies" : ""}, {paper}, {colour === "bw" ? "B&W" : "Colour"})
              </span>
              <span>₹{printingPrice}</span>
            </div>

            {binding && (
              <div className="summary-line">
                <span>Spiral Binding</span>
                <span>₹20</span>
              </div>
            )}

            {lamination && (
              <div className="summary-line">
                <span>Lamination</span>
                <span>₹10</span>
              </div>
            )}

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Estimated Total</span>
              <strong>₹{total}</strong>
            </div>

            <button
              className="continue-button"
              disabled={!file}
              onClick={continueToPickup}
            >
              Continue to Pickup Time →
            </button>

            {!file && (
              <p className="helper-text">
                ⚠️ Please upload a document to proceed.
              </p>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}