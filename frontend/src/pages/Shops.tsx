import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Shops() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialQ = searchParams.get("q") || "";

  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialQ);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category && category !== "All") params.set("category", category);
    if (search.trim()) params.set("q", search.trim());

    fetch(`/api/shops?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShops(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [category, search]);

  const handleCategoryClick = (cat: string) => {
    setCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="app">
      <Navbar />

      <main>
        <section className="shops-header">
          <Link to="/" className="back-link">
            ← Back to home
          </Link>

          <p className="eyebrow">DISCOVER SHOPS</p>
          <h1>Find a Local Print Shop</h1>
          <p className="hero-description">
            Choose a campus or neighborhood shop, pre-book your documents, and pick them up freshly printed.
          </p>

          <div className="search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search by shop name, service, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#a1a1aa",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </section>

        <section className="section">
          <div className="categories">
            {["All", "Printing", "Stationery"].map((cat) => (
              <button
                key={cat}
                className={`category ${category === cat ? "active" : ""}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat === "All" ? "⚡ All Shops" : cat === "Printing" ? "🖨️ Printing" : "📚 Stationery"}
              </button>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Available Shops</h2>
            <span className="shop-count">{shops.length} verified shops</span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#71717a" }}>
              Loading print shops...
            </div>
          ) : shops.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e8e8ed",
              }}
            >
              <h3>No shops found</h3>
              <p style={{ color: "#71717a" }}>Try adjusting your search query or category filter.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="shop-button"
                style={{ marginTop: "12px" }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            shops.map((shop) => (
              <div className="shop-card" key={shop.id}>
                <div className="shop-icon">{shop.icon || "🖨️"}</div>

                <div className="shop-info">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3>{shop.name}</h3>
                    {shop.isPopular === 1 && (
                      <span
                        style={{
                          background: "#f0ebff",
                          color: "#6d4aff",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "12px",
                        }}
                      >
                        Popular
                      </span>
                    )}
                  </div>

                  <p>{shop.tagline || shop.description}</p>
                  <p style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "2px" }}>
                    📍 {shop.address}
                  </p>

                  <div className="shop-meta">
                    <span>⭐ {shop.rating} ({shop.reviewCount} reviews)</span>
                    <span>📍 {shop.distance} away</span>
                    <span>🕒 {shop.openHours}</span>
                    <span>💰 {shop.startingPrice}</span>
                  </div>
                </div>

                <Link to={`/shops/${shop.id}`} className="shop-button">
                  View Shop
                </Link>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}