import { useState, useEffect } from "react";










import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

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
      .catch((err) => console.error("Error loading shop:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="app">
        <Navbar />
        <main style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ color: "#71717a" }}>Loading shop details from database...</p>
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
          <Link to="/shops" className="shop-button" style={{ display: "inline-block", marginTop: "16px" }}>
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
        <section className="shop-details-header">
          <Link to="/shops" className="back-link">
            ← Back to shops
          </Link>

          <div className="large-shop-icon">{shop.icon || "🖨️"}</div>

          <p className="eyebrow">{shop.category.toUpperCase()} SERVICES</p>

          <h1>{shop.name}</h1>

          <p className="shop-description">{shop.description}</p>

          <div className="shop-details-meta">
            <span>⭐ {shop.rating} ({shop.reviewCount} reviews)</span>
            <span>📍 {shop.distance}</span>
            <span>🕒 {shop.openHours}</span>
            <span>📞 {shop.phone}</span>
            <span
              style={{
                background: "#e0f2fe",
                color: "#0369a1",
                padding: "2px 8px",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            >
              ⏱️ Queue wait: ~{shop.estimatedWait}
            </span>
          </div>

          <p style={{ fontSize: "13px", color: "#71717a", marginTop: "12px" }}>
            Full Address: <strong>{shop.address}</strong>
          </p>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Available Services & Pricing</h2>
            <span style={{ fontSize: "14px", color: "#71717a" }}>
              {shop.services?.length || 0} services
            </span>
          </div>

          <div className="services-list">
            {shop.services?.map((service: any) => (
              <div className="service-card" key={service.id || service.name}>
                <div className="service-icon">{service.icon || "📄"}</div>

                <div className="service-info">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <strong>{service.priceText}</strong>
                </div>

                {service.isBookable === 1 ? (
                  <button
                    className="shop-button"
                    onClick={() => handleBookService(service)}
                  >
                    Configure & Book →
                  </button>
                ) : (
                  <button className="shop-button secondary-button" disabled>
                    Walk-in Only
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