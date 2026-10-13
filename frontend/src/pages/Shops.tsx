import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  IconSearch,
  IconMapPin,
  IconStar,
  IconClock,
  IconArrowRight,
  IconX,
} from "../components/Icons";

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
        {/* Header */}
        <section style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <Link to="/" style={{ fontSize: "13px", color: "#64748b", textDecoration: "none", display: "inline-block", marginBottom: "8px" }}>
                ← Back to home
              </Link>
              <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em" }}>Local Print Shops</h1>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                Select a local vendor to pre-book printing, binding, and document services.
              </p>
            </div>

            <div className="search-container" style={{ width: "320px" }}>
              <IconSearch size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search shops or services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} style={{ color: "#94a3b8" }}>
                  <IconX size={14} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Filter Pills */}
        <div className="filter-tabs">
          {["All", "Printing", "Stationery"].map((cat) => (
            <button
              key={cat}
              className={`filter-tab ${category === cat ? "active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat === "All" ? "All Vendors" : cat}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: "13px", color: "#64748b", alignSelf: "center" }}>
            {shops.length} verified {shops.length === 1 ? "shop" : "shops"}
          </span>
        </div>

        {/* Shop Grid */}
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
            Loading print shops...
          </div>
        ) : shops.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              background: "white",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>No shops match your search</h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", marginBottom: "16px" }}>
              Try searching a different location or reset your category filter.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="shop-card-grid">
            {shops.map((shop) => (
              <div className="shop-card-clean" key={shop.id}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <span className="shop-badge">{shop.category}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 650, color: "#0f172a" }}>
                      <IconStar size={14} color="#f59e0b" />
                      <span>{shop.rating}</span>
                      <span style={{ color: "#94a3b8", fontWeight: 400 }}>({shop.reviewCount})</span>
                    </span>
                  </div>

                  <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "4px" }}>{shop.name}</h3>
                  <p style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.45 }}>{shop.tagline}</p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                    {shop.address}
                  </p>

                  <div className="meta-row">
                    <span className="meta-item">
                      <IconMapPin size={14} />
                      <span>{shop.distance}</span>
                    </span>
                    <span className="meta-item">
                      <IconClock size={14} />
                      <span>{shop.openHours}</span>
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{shop.startingPrice}</span>
                  <Link
                    to={`/shops/${shop.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <span>View Shop</span>
                    <IconArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}