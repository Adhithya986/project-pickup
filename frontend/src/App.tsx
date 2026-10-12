import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Shops from "./pages/Shops";
import ShopDetails from "./pages/ShopDetails";
import Print from "./pages/Print";
import Pickup from "./pages/Pickup";
import BookingSuccess from "./pages/BookingSuccess";
import MyBookings from "./pages/MyBookings";
import ShopDashboard from "./pages/ShopDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
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

        {/* Separate Dedicated Dashboards */}
        <Route path="/shop-dashboard" element={<ShopDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;