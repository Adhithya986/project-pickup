import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login?role=admin" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2>⛔ Access Denied</h2>
        <p style={{ color: "#71717a" }}>This area is restricted to Platform Administrators.</p>
        <p>Logged in as: <strong>{user?.name}</strong> ({user?.role})</p>
      </div>
    );
  }

  return <>{children}</>;
};

export const ShopRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isShopOperator } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login?role=shop" state={{ from: location }} replace />;
  }

  if (!isShopOperator) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2>⛔ Access Denied</h2>
        <p style={{ color: "#71717a" }}>This area is restricted to Print Shop Operators.</p>
        <p>Logged in as: <strong>{user?.name}</strong> ({user?.role})</p>
      </div>
    );
  }

  return <>{children}</>;
};
