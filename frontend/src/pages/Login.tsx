import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { IconStore, IconSettings } from "../components/Icons";

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
        setRegSuccess("Shop registered successfully! Signing in...");
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

      <main style={{ maxWidth: "460px", marginTop: "24px" }}>
        <div
          style={{
            background: "white",
            padding: "36px 32px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#eff6ff",
                color: "#2563eb",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 12px",
              }}
            >
              {roleTab === "admin" ? <IconSettings size={22} /> : <IconStore size={22} />}
            </div>

            <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>
              {roleTab === "admin"
                ? "Platform Admin Sign In"
                : roleTab === "register"
                ? "Register Print Shop"
                : "Shop Operator Sign In"}
            </h1>
            <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
              {roleTab === "admin"
                ? "Enter admin credentials to manage network"
                : roleTab === "register"
                ? "Join the network to receive online pre-orders"
                : "Sign in to access your counter pickup queue"}
            </p>
          </div>

          {/* Segmented Switcher */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "4px",
              background: "#f1f5f9",
              padding: "4px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setRoleTab("shop");
                setErrorMsg("");
              }}
              style={{
                padding: "8px 10px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 650,
                background: roleTab === "shop" ? "white" : "transparent",
                color: roleTab === "shop" ? "#0f172a" : "#64748b",
                boxShadow: roleTab === "shop" ? "var(--shadow-sm)" : "none",
                cursor: "pointer",
              }}
            >
              Shop
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTab("admin");
                setErrorMsg("");
              }}
              style={{
                padding: "8px 10px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 650,
                background: roleTab === "admin" ? "white" : "transparent",
                color: roleTab === "admin" ? "#0f172a" : "#64748b",
                boxShadow: roleTab === "admin" ? "var(--shadow-sm)" : "none",
                cursor: "pointer",
              }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTab("register");
                setErrorMsg("");
              }}
              style={{
                padding: "8px 10px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 650,
                background: roleTab === "register" ? "white" : "transparent",
                color: roleTab === "register" ? "#0f172a" : "#64748b",
                boxShadow: roleTab === "register" ? "var(--shadow-sm)" : "none",
                cursor: "pointer",
              }}
            >
              Register
            </button>
          </div>

          {/* Quick Demo Autofill Pills */}
          {roleTab !== "register" && (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "12px 14px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
                1-Click Demo Fill:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {roleTab === "admin" ? (
                  <button
                    type="button"
                    onClick={() => fillCredentials("admin@localpickup.com", "admin123", "admin")}
                    style={{
                      background: "white",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    System Admin
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => fillCredentials("abc@prints.com", "shop123", "shop")}
                      style={{
                        background: "white",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ABC Digital Prints
                    </button>
                    <button
                      type="button"
                      onClick={() => fillCredentials("quick@print.com", "shop123", "shop")}
                      style={{
                        background: "white",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Quick Print Center
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              {errorMsg}
            </div>
          )}

          {regSuccess && (
            <div
              style={{
                background: "#ecfdf5",
                color: "#059669",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              {regSuccess}
            </div>
          )}

          {/* SIGN IN FORM */}
          {roleTab !== "register" ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "11px", marginTop: "12px" }}
                disabled={loading}
              >
                {loading ? "Signing in..." : `Sign In as ${roleTab === "admin" ? "Admin" : "Operator"}`}
              </button>
            </form>
          ) : (
            /* REGISTER SHOP FORM */
            <form onSubmit={handleRegisterShop}>
              <div className="form-group">
                <label>Shop / Business Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Campus Digital Prints"
                  value={regShopName}
                  onChange={(e) => setRegShopName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Operator Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Sharma"
                  value={regOwnerName}
                  onChange={(e) => setRegOwnerName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Operator Email *</label>
                <input
                  type="email"
                  placeholder="operator@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  placeholder="Create password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+91 98000 00000"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Shop Location / Address *</label>
                <input
                  type="text"
                  placeholder="e.g. Science Block, Ground Floor"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "11px", marginTop: "12px" }}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Vendor Account"}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Link to="/" style={{ fontSize: "13px", color: "#64748b", textDecoration: "none" }}>
              ← Return to storefront
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
