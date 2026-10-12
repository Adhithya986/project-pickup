import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "localpickup-secret-jwt-key-2026";

// Helper: generate token
export function generateToken(user: any): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      shopId: user.shopId,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Middleware: Authenticate Request
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token" });
  }
}

// Middleware: Require Admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const user = (req as any).user;
    if (user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access forbidden: Admin only" });
    }
    next();
  });
}

// Middleware: Require Shop Operator
export function requireShop(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const user = (req as any).user;
    if (user?.role !== "shop" && user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access forbidden: Shop Operator only" });
    }
    next();
  });
}

// POST /api/auth/login
router.post("/login", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user: any = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)").get(email.trim());

    if (!user) {
      return res.status(401).json({ success: false, message: "No account found with this email" });
    }

    const isValidPassword = bcrypt.compareSync(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    // Attach shop info if role is shop
    let shopInfo = null;
    if (user.shopId) {
      shopInfo = db.prepare("SELECT id, name, category, address FROM shops WHERE id = ?").get(user.shopId);
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopId: user.shopId,
        shop: shopInfo,
      },
      message: `Welcome back, ${user.name}!`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, (req: Request, res: Response) => {
  try {
    const tokenUser = (req as any).user;
    const user: any = db.prepare("SELECT id, name, email, role, shopId FROM users WHERE id = ?").get(tokenUser.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let shopInfo = null;
    if (user.shopId) {
      shopInfo = db.prepare("SELECT id, name, category, address FROM shops WHERE id = ?").get(user.shopId);
    }

    res.json({
      success: true,
      user: {
        ...user,
        shop: shopInfo,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/register-shop (Self-service shop registration)
router.post("/register-shop", (req: Request, res: Response) => {
  try {
    const {
      shopName,
      category = "Printing",
      address,
      phone,
      ownerName,
      email,
      password,
    } = req.body;

    if (!shopName || !ownerName || !email || !password) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    // Check if email already registered
    const existing: any = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").get(email.trim());
    if (existing) {
      return res.status(400).json({ success: false, message: "This email is already in use" });
    }

    const insertAll = db.transaction(() => {
      // 1. Create Shop
      const shopRes = db
        .prepare(`
          INSERT INTO shops (name, category, tagline, description, address, distance, phone, rating, reviewCount, openHours, startingPrice, icon)
          VALUES (?, ?, 'Local Printing & Photocopy', '', ?, '0.6 km', ?, 4.5, 1, '8:00 AM - 10:00 PM', 'From ₹2', ?)
        `)
        .run(shopName, category, address || "Campus Area", phone || "+91 99999 00000", category === "Stationery" ? "📚" : "🖨️");

      const shopId = shopRes.lastInsertRowid;

      // 2. Add default service
      db.prepare(`
        INSERT INTO services (shopId, name, description, priceText, basePrice, icon, isBookable)
        VALUES (?, 'Document Printing', 'High quality laser printing', 'From ₹2', 2, '📄', 1)
      `).run(shopId);

      // 3. Create Shop Operator User
      const passwordHash = bcrypt.hashSync(password, 10);
      const userRes = db
        .prepare(`
          INSERT INTO users (name, email, passwordHash, role, shopId)
          VALUES (?, ?, ?, 'shop', ?)
        `)
        .run(ownerName, email.trim(), passwordHash, shopId);

      const createdUser: any = db.prepare("SELECT id, name, email, role, shopId FROM users WHERE id = ?").get(userRes.lastInsertRowid);
      return { shopId, user: createdUser };
    });

    const result = insertAll();
    const token = generateToken(result.user);

    res.status(201).json({
      success: true,
      token,
      user: result.user,
      message: "Shop and operator account created successfully!",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
