import { Router, Request, Response } from "express";
import { db } from "../db";

const router = Router();

// GET /api/stats - Global platform analytics (for Admin)
router.get("/", (_req: Request, res: Response) => {
  try {
    const totalOrders: any = db.prepare("SELECT COUNT(*) as count FROM bookings").get();
    const pendingOrders: any = db
      .prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'")
      .get();
    const printingOrders: any = db
      .prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'printing'")
      .get();
    const readyOrders: any = db
      .prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'ready'")
      .get();
    const completedOrders: any = db
      .prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'")
      .get();
    const totalRevenue: any = db
      .prepare("SELECT COALESCE(SUM(totalPrice), 0) as total FROM bookings")
      .get();
    const shopCount: any = db.prepare("SELECT COUNT(*) as count FROM shops").get();

    res.json({
      success: true,
      data: {
        totalOrders: totalOrders.count,
        pendingOrders: pendingOrders.count,
        printingOrders: printingOrders.count,
        readyOrders: readyOrders.count,
        completedOrders: completedOrders.count,
        totalRevenue: Math.round(totalRevenue.total),
        shopCount: shopCount.count,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/stats/shop/:shopId - Shop-specific analytics (for Shop Dashboard)
router.get("/shop/:shopId", (req: Request, res: Response) => {
  try {
    const shopId = Number(req.params.shopId);
    const totalOrders: any = db
      .prepare("SELECT COUNT(*) as count FROM bookings WHERE shopId = ?")
      .get(shopId);
    const pendingOrders: any = db
      .prepare("SELECT COUNT(*) as count FROM bookings WHERE shopId = ? AND status = 'pending'")
      .get(shopId);
    const printingOrders: any = db
      .prepare("SELECT COUNT(*) as count FROM bookings WHERE shopId = ? AND status = 'printing'")
      .get(shopId);
    const readyOrders: any = db
      .prepare("SELECT COUNT(*) as count FROM bookings WHERE shopId = ? AND status = 'ready'")
      .get(shopId);
    const completedOrders: any = db
      .prepare("SELECT COUNT(*) as count FROM bookings WHERE shopId = ? AND status = 'completed'")
      .get(shopId);
    const totalRevenue: any = db
      .prepare("SELECT COALESCE(SUM(totalPrice), 0) as total FROM bookings WHERE shopId = ?")
      .get(shopId);

    res.json({
      success: true,
      data: {
        totalOrders: totalOrders?.count || 0,
        pendingOrders: pendingOrders?.count || 0,
        printingOrders: printingOrders?.count || 0,
        readyOrders: readyOrders?.count || 0,
        completedOrders: completedOrders?.count || 0,
        totalRevenue: Math.round(totalRevenue?.total || 0),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
