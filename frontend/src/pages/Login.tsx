import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "admin" ? "admin" : "shop";
  const [roleTab, setRoleTab] = useState<"shop" | "admin" | "register">(initialRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Register Shop state
  const [regShopName, setRegShopName] = useState("");
  const [regOwnerName, setRegOwnerName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (roleTab === "admin") {
        navigate("/admin");
      } else {
        navigate("/shop-dashboard");
      }
    } else {
      setErrorMsg(result.message || "Failed to log in");
    }
  };

  const handleRegisterShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: regShopName,
          ownerName: regOwnerName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
          address: regAddress,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success && data.token) {
        setRegSuccess("Shop registered successfully! Logging you in...");
        await login(regEmail, regPassword);
        setTimeout(() => navigate("/shop-dashboard"), 1000);
      } else {
        setErrorMsg(data.message || "Registration failed");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("Error registering shop");
    }
  };

  const fillCredentials = (userEmail: string, userPass: string, tab: "shop" | "admin") => {
    setRoleTab(tab);
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMsg("");
  };

  return (
    <div className="app">
      <Navbar />

      <main style={{ maxWidth: "520px", marginTop: "30px" }}>
        <div
          style={{
            background: "white",
            padding: "36px 32px",
            borderRadius: "20px",
            border: "1px solid #e8e8ed",
            boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "#f0ebff",
              display: "grid",
              placeItems: "center",
              fontSize: "26px",
              margin: "0 auto 16px",
            }}
          >
            {roleTab === "admin" ? "⚙️" : "🏪"}
          </div>

          <h1 style={{ fontSize: "24px", margin: "0 0 8px" }}>
            {roleTab === "admin" ? "Platform Admin Login" : roleTab === "register" ? "Register Your Print Shop" : "Shop Operator Login"}
          </h1>
          <p style={{ color: "#71717a", fontSize: "14px", margin: "0 0 24px" }}>
            {roleTab === "admin"
              ? "Sign in to access platform-wide settings and logs"
              : roleTab === "register"
              ? "Join the campus network as an official print vendor"
              : "Sign in to access your print queue and counter verifier"}
          </p>

          {/* Role Tabs */}
          <div className="filter-tabs" style={{ justifyContent: "center", marginBottom: "20px" }}>
            <button
              type="button"
              className={`filter-tab ${roleTab === "shop" ? "active" : ""}`}
              onClick={() => {
                setRoleTab("shop");
                setErrorMsg("");
              }}
            >
              🏪 Shop Operator
            </button>
            <button
              type="button"
              className={`filter-tab ${roleTab === "admin" ? "active" : ""}`}
              onClick={() => {
                setRoleTab("admin");
                setErrorMsg("");
              }}
            >
              ⚙️ Platform Admin
            </button>
            <button
              type="button"
              className={`filter-tab ${roleTab === "register" ? "active" : ""}`}
              onClick={() => {
                setRoleTab("register");
                setErrorMsg("");
              }}
            >
              + Register Shop
            </button>
          </div>

          {/* Quick autofill demo pills */}
          {roleTab !== "register" && (
            <div
              style={{
                background: "#f4f4f5",
                padding: "12px 14px",
                borderRadius: "12px",
                marginBottom: "20px",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#71717a", marginBottom: "8px", textTransform: "uppercase" }}>
                ⚡ Quick 1-Click Demo Logins:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {roleTab === "admin" ? (
                  <button
                    type="button"
                    onClick={() => fillCredentials("admin@localpickup.com", "admin123", "admin")}
                    style={{
                      background: "white",
                      border: "1px solid #d4d4d8",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    👑 System Admin
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => fillCredentials("abc@prints.com", "shop123", "shop")}
                      style={{
                        background: "white",
                        border: "1px solid #d4d4d8",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🖨️ ABC Digital Prints
                    </button>
                    <button
                      type="button"
                      onClick={() => fillCredentials("quick@print.com", "shop123", "shop")}
                      style={{
                        background: "white",
                        border: "1px solid #d4d4d8",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ⚡ Quick Print Center
                    </button>
                    <button
                      type="button"
                      onClick={() => fillCredentials("city@copy.com", "shop123", "shop")}
                      style={{
                        background: "white",
                        border: "1px solid #d4d4d8",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      📚 City Copy Hub
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                background: "#fee2e2",
                color: "#b91c1c",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "16px",
                textAlign: "left",
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          {regSuccess && (
            <div
              style={{
                background: "#dcfce7",
                color: "#15803d",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "16px",
                textAlign: "left",
              }}
            >
              ✓ {regSuccess}
            </div>
          )}

          {/* LOGIN FORM */}
          {roleTab !== "register" ? (
            <form onSubmit={handleLoginSubmit} style={{ textAlign: "left" }}>
              <div className="form-input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="shop-button"
                style={{ width: "100%", marginTop: "24px", padding: "13px", fontSize: "15px" }}
                disabled={loading}
              >
                {loading ? "Signing in..." : `Sign In as ${roleTab === "admin" ? "Admin" : "Shop Operator"} →`}
              </button>
            </form>
          ) : (
            /* REGISTER SHOP FORM */
            <form onSubmit={handleRegisterShop} style={{ textAlign: "left" }}>
              <div className="form-input-group">
                <label>Print Shop Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Express Print & Xerox"
                  value={regShopName}
                  onChange={(e) => setRegShopName(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Operator / Owner Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Singh"
                  value={regOwnerName}
                  onChange={(e) => setRegOwnerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Operator Email *</label>
                <input
                  type="email"
                  placeholder="owner@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Password *</label>
                <input
                  type="password"
                  placeholder="Choose a strong password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-input-group">
                <label>Shop Location / Address *</label>
                <input
                  type="text"
                  placeholder="e.g. Student Center, North Gate"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="shop-button"
                style={{ width: "100%", marginTop: "24px", padding: "13px", fontSize: "15px" }}
                disabled={loading}
              >
                {loading ? "Registering..." : "Create Shop & Operator Account →"}
              </button>
            </form>
          )}

          <div style={{ marginTop: "24px", fontSize: "13px", color: "#71717a" }}>
            <Link to="/" style={{ color: "#6d4aff", textDecoration: "none", fontWeight: 600 }}>
              ← Return to LocalPickup Storefront
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
