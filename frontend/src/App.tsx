import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminRoute, ShopRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Shops from "./pages/Shops";
import ShopDetails from "./pages/ShopDetails";
import Print from "./pages/Print";
import Pickup from "./pages/Pickup";
import BookingSuccess from "./pages/BookingSuccess";
import MyBookings from "./pages/MyBookings";
import ShopDashboard from "./pages/ShopDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Customer Storefront Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/shops/:id" element={<ShopDetails />} />
          <Route path="/print" element={<Print />} />
          <Route path="/pickup" element={<Pickup />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/bookings" element={<MyBookings />} />

          {/* Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboards */}
          <Route
            path="/shop-dashboard"
            element={
              <ShopRoute>
                <ShopDashboard />
              </ShopRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;