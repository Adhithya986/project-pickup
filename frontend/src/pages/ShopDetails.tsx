import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  IconStar,
  IconMapPin,
  IconClock,
  IconPhone,
  IconCheckCircle,
  IconArrowRight,
  IconPrinter,
} from "../components/Icons";

export default function ShopDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/shops/${id || 1}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShop(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="app">
        <Navbar />
        <main style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          Loading shop details...
        </main>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="app">
        <Navbar />
        <main style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>Shop not found</h2>
          <Link to="/shops" className="btn btn-secondary btn-sm" style={{ marginTop: "16px" }}>
            ← Back to all shops
          </Link>
        </main>
      </div>
    );
  }

  const handleBookService = (service: any) => {
    navigate("/print", {
      state: {
        shopId: shop.id,
        shopName: shop.name,
        serviceName: service.name,
        basePrice: service.basePrice,
      },
    });
  };

  return (
    <div className="app">
      <Navbar />

      <main>
        {/* Breadcrumb & Shop Header */}
        <div style={{ marginBottom: "28px" }}>
          <Link to="/shops" style={{ fontSize: "13px", color: "#64748b", textDecoration: "none", display: "inline-block", marginBottom: "14px" }}>
            ← Back to all shops
          </Link>

          <div
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "28px 32px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <span className="shop-badge" style={{ marginBottom: "8px", display: "inline-block" }}>
                  {shop.category}
                </span>
                <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "6px" }}>
                  {shop.name}
                </h1>
                <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "600px", lineHeight: 1.5, margin: 0 }}>
                  {shop.description || shop.tagline}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                  <IconStar size={16} color="#f59e0b" />
                  <span>{shop.rating}</span>
                  <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "13px" }}>({shop.reviewCount} verified reviews)</span>
                </span>
                <span className="status-pill status-ready" style={{ fontSize: "12px" }}>
                  <IconCheckCircle size={12} />
                  <span>Queue wait: ~{shop.estimatedWait}</span>
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                paddingTop: "20px",
                marginTop: "20px",
                borderTop: "1px solid #f1f5f9",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <IconMapPin size={15} color="#2563eb" />
                <span>{shop.address} ({shop.distance})</span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <IconClock size={15} color="#2563eb" />
                <span>{shop.openHours}</span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <IconPhone size={15} color="#2563eb" />
                <span>{shop.phone}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Services Catalog */}
        <section>
          <div style={{ marginBottom: "18px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 750 }}>Available Services & Rates</h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Select a service below to upload your file and configure printing specs.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {shop.services?.map((service: any) => (
              <div
                key={service.id || service.name}
                className="config-card"
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  marginBottom: 0,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center" }}>
                        <IconPrinter size={16} />
                      </span>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>{service.name}</h3>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", background: "#f8fafc", padding: "3px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                      {service.priceText}
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.45, margin: "6px 0 16px" }}>
                    {service.description}
                  </p>
                </div>

                {service.isBookable === 1 ? (
                  <button
                    onClick={() => handleBookService(service)}
                    className="btn btn-primary btn-sm"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <span>Configure & Pre-book</span>
                    <IconArrowRight size={14} />
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-sm" disabled style={{ width: "100%", opacity: 0.6 }}>
                    Walk-in counter only
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}