import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "../db";

const router = Router();

// Configure upload directory
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

// Helper to generate readable ID
function generateBookingId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `LP-${dateStr}-${randomSuffix}`;
}

// POST /api/bookings - Create new booking (supports multipart file upload or json)
router.post("/", upload.single("file"), (req: Request, res: Response) => {
  try {
    const file = req.file;
    const body = req.body;

    const bookingId = generateBookingId();
    const qrToken = `VERIFY-${bookingId}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Get shop name
    const shopId = Number(body.shopId) || 1;
    const shop: any = db.prepare("SELECT name FROM shops WHERE id = ?").get(shopId);
    const shopName = shop ? shop.name : (body.shopName || "ABC Digital Prints");

    const documentName = file ? file.originalname : (body.fileName || body.documentName || "document.pdf");
    const documentPath = file ? `/uploads/${file.filename}` : (body.documentPath || null);
    const documentSize = file ? `${(file.size / 1024).toFixed(1)} KB` : (body.documentSize || "1.2 MB");

    const paperSize = body.paperSize || body.paper || "A4";
    const colour = body.colour || body.color || "bw";
    const sides = body.sides || "single";
    const copies = Number(body.copies) || 1;
    const binding = body.binding === "true" || body.binding === true || body.binding === 1 ? 1 : 0;
    const lamination = body.lamination === "true" || body.lamination === true || body.lamination === 1 ? 1 : 0;
    const instructions = body.instructions || "";
    const pickupDate = body.pickupDate || "Today";
    const pickupSlot = body.pickupSlot || body.pickupTime || "8:00 PM";
    const totalPrice = Number(body.totalPrice || body.total) || 10;

    const customerName = body.customerName || "Customer";
    const customerPhone = body.customerPhone || "9876543210";
    const customerEmail = body.customerEmail || "";

    const stmt = db.prepare(`
      INSERT INTO bookings (
        id, shopId, shopName, customerName, customerPhone, customerEmail,
        documentName, documentPath, documentSize, paperSize, colour, sides,
        copies, binding, lamination, instructions, pickupDate, pickupSlot,
        totalPrice, status, qrToken
      ) VALUES (
        @id, @shopId, @shopName, @customerName, @customerPhone, @customerEmail,
        @documentName, @documentPath, @documentSize, @paperSize, @colour, @sides,
        @copies, @binding, @lamination, @instructions, @pickupDate, @pickupSlot,
        @totalPrice, 'pending', @qrToken
      )
    `);

    stmt.run({
      id: bookingId,
      shopId,
      shopName,
      customerName,
      customerPhone,
      customerEmail,
      documentName,
      documentPath,
      documentSize,
      paperSize,
      colour,
      sides,
      copies,
      binding,
      lamination,
      instructions,
      pickupDate,
      pickupSlot,
      totalPrice,
      qrToken,
    });

    const newBooking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(bookingId);

    res.status(201).json({
      success: true,
      data: newBooking,
      message: "Order placed successfully!",
    });
  } catch (error: any) {
    console.error("Booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings - List bookings with optional filters
router.get("/", (req: Request, res: Response) => {
  try {
    const { phone, shopId, status, q } = req.query;
    let query = "SELECT * FROM bookings WHERE 1=1";
    const params: any[] = [];

    if (phone) {
      query += " AND customerPhone LIKE ?";
      params.push(`%${phone}%`);
    }

    if (shopId) {
      query += " AND shopId = ?";
      params.push(Number(shopId));
    }

    if (status && status !== "all") {
      query += " AND status = ?";
      params.push(status);
    }

    if (q) {
      query += " AND (id LIKE ? OR customerName LIKE ? OR documentName LIKE ?)";
      const pattern = `%${q}%`;
      params.push(pattern, pattern, pattern);
    }

    query += " ORDER BY createdAt DESC";
    const bookings = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookings/:id - Get specific booking by ID or QR Token
router.get("/:id", (req: Request, res: Response) => {
  try {
    const idOrToken = req.params.id;
    const booking = db
      .prepare("SELECT * FROM bookings WHERE id = ? OR qrToken = ?")
      .get(idOrToken, idOrToken);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/bookings/:id/status - Update booking status
router.patch("/:id/status", (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    const validStatuses = ["pending", "printing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const result = db
      .prepare("UPDATE bookings SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?")
      .run(status, bookingId);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const updated = db.prepare("SELECT * FROM bookings WHERE id = ?").get(bookingId);

    res.json({
      success: true,
      data: updated,
      message: `Status updated to ${status}`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/bookings/:id/verify - Shop counter QR pickup verification
router.post("/:id/verify", (req: Request, res: Response) => {
  try {
    const idOrToken = req.params.id;
    const booking: any = db
      .prepare("SELECT * FROM bookings WHERE id = ? OR qrToken = ?")
      .get(idOrToken, idOrToken);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Invalid QR code or booking ID" });
    }

    // Mark as completed
    db.prepare("UPDATE bookings SET status = 'completed', updatedAt = CURRENT_TIMESTAMP WHERE id = ?").run(
      booking.id
    );

    const verified = db.prepare("SELECT * FROM bookings WHERE id = ?").get(booking.id);

    res.json({
      success: true,
      verified: true,
      data: verified,
      message: `Pickup confirmed! Order ${booking.id} marked as completed.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
