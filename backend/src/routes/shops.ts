import { Router, Request, Response } from "express";
import { db } from "../db";

const router = Router();

// GET /api/shops - list shops with optional filter
router.get("/", (req: Request, res: Response) => {
  try {
    const { q, category } = req.query;
    let query = "SELECT * FROM shops WHERE 1=1";
    const params: any[] = [];

    if (category && category !== "All") {
      query += " AND category = ?";
      params.push(category);
    }

    if (q) {
      query += " AND (name LIKE ? OR tagline LIKE ? OR description LIKE ?)";
      const searchPattern = `%${q}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += " ORDER BY isPopular DESC, rating DESC";
    const shops = db.prepare(query).all(...params);

    // Attach order counts for admin view
    const enhancedShops = shops.map((shop: any) => {
      const orderCount: any = db
        .prepare("SELECT COUNT(*) as count FROM bookings WHERE shopId = ?")
        .get(shop.id);
      return {
        ...shop,
        totalOrders: orderCount?.count || 0,
      };
    });

    res.json({
      success: true,
      data: enhancedShops,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/shops/:id - get shop details with its services
router.get("/:id", (req: Request, res: Response) => {
  try {
    const shopId = req.params.id;
    const shop: any = db.prepare("SELECT * FROM shops WHERE id = ?").get(shopId);

    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    const services = db.prepare("SELECT * FROM services WHERE shopId = ?").all(shopId);

    // Get active queue stats
    const queueStats: any = db
      .prepare(
        "SELECT COUNT(*) as activeCount FROM bookings WHERE shopId = ? AND status IN ('pending', 'printing')"
      )
      .get(shopId);

    const totalOrders: any = db
      .prepare("SELECT COUNT(*) as count FROM bookings WHERE shopId = ?")
      .get(shopId);

    const revenue: any = db
      .prepare("SELECT COALESCE(SUM(totalPrice), 0) as total FROM bookings WHERE shopId = ?")
      .get(shopId);

    res.json({
      success: true,
      data: {
        ...shop,
        services,
        activeOrders: queueStats?.activeCount || 0,
        totalOrders: totalOrders?.count || 0,
        totalRevenue: Math.round(revenue?.total || 0),
        estimatedWait: queueStats?.activeCount ? `${queueStats.activeCount * 4} mins` : "Ready now",
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/shops - Add new shop (Admin)
router.post("/", (req: Request, res: Response) => {
  try {
    const {
      name,
      category = "Printing",
      tagline = "Local Services",
      description = "",
      address = "Campus Area",
      distance = "1.0 km",
      phone = "+91 99999 00000",
      openHours = "8:00 AM - 10:00 PM",
      startingPrice = "From ₹2",
      icon = "🖨️",
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Shop name is required" });
    }

    const result = db
      .prepare(`
        INSERT INTO shops (name, category, tagline, description, address, distance, phone, rating, reviewCount, openHours, startingPrice, icon, isPopular)
        VALUES (?, ?, ?, ?, ?, ?, ?, 4.5, 1, ?, ?, ?, 0)
      `)
      .run(name, category, tagline, description, address, distance, phone, openHours, startingPrice, icon);

    const newShopId = result.lastInsertRowid;

    // Add default service
    db.prepare(`
      INSERT INTO services (shopId, name, description, priceText, basePrice, icon, isBookable)
      VALUES (?, 'Standard Document Printing', 'A4 laser printing', 'From ₹2', 2, '📄', 1)
    `).run(newShopId);

    const createdShop = db.prepare("SELECT * FROM shops WHERE id = ?").get(newShopId);

    res.status(201).json({
      success: true,
      data: createdShop,
      message: "New shop added successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/shops/:id - Update shop details (Admin / Shop Owner)
router.patch("/:id", (req: Request, res: Response) => {
  try {
    const shopId = req.params.id;
    const { name, tagline, description, address, phone, openHours, startingPrice } = req.body;

    const existing: any = db.prepare("SELECT * FROM shops WHERE id = ?").get(shopId);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }

    db.prepare(`
      UPDATE shops SET
        name = COALESCE(?, name),
        tagline = COALESCE(?, tagline),
        description = COALESCE(?, description),
        address = COALESCE(?, address),
        phone = COALESCE(?, phone),
        openHours = COALESCE(?, openHours),
        startingPrice = COALESCE(?, startingPrice)
      WHERE id = ?
    `).run(name, tagline, description, address, phone, openHours, startingPrice, shopId);

    const updated = db.prepare("SELECT * FROM shops WHERE id = ?").get(shopId);
    res.json({ success: true, data: updated, message: "Shop updated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/shops/:id/services - Add service to a shop (Shop Dashboard)
router.post("/:id/services", (req: Request, res: Response) => {
  try {
    const shopId = req.params.id;
    const { name, description, priceText, basePrice = 2, icon = "📄", isBookable = 1 } = req.body;

    if (!name || !priceText) {
      return res.status(400).json({ success: false, message: "Name and priceText are required" });
    }

    const result = db
      .prepare(`
        INSERT INTO services (shopId, name, description, priceText, basePrice, icon, isBookable)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(shopId, name, description || "", priceText, Number(basePrice) || 2, icon, isBookable ? 1 : 0);

    const newService = db.prepare("SELECT * FROM services WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ success: true, data: newService, message: "Service added successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/shops/:id/services/:serviceId - Update service (Shop Dashboard)
router.patch("/:id/services/:serviceId", (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const { isBookable, priceText, basePrice } = req.body;

    db.prepare(`
      UPDATE services SET
        isBookable = COALESCE(?, isBookable),
        priceText = COALESCE(?, priceText),
        basePrice = COALESCE(?, basePrice)
      WHERE id = ?
    `).run(isBookable !== undefined ? (isBookable ? 1 : 0) : null, priceText || null, basePrice ? Number(basePrice) : null, serviceId);

    const updated = db.prepare("SELECT * FROM services WHERE id = ?").get(serviceId);
    res.json({ success: true, data: updated, message: "Service updated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
