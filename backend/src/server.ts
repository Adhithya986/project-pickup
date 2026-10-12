import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { initDatabase } from "./db";
import shopsRouter from "./routes/shops";
import bookingsRouter from "./routes/bookings";
import statsRouter from "./routes/stats";
import authRouter from "./routes/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite Database schema and seeds
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded documents statically
const uploadsDir = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsDir));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/shops", shopsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/stats", statsRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    service: "LocalPickup Backend",
    status: "healthy",
    database: "SQLite (active)",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req, res) => {
  res.json({
    message: "LocalPickup API is running",
    endpoints: {
      health: "/api/health",
      shops: "/api/shops",
      bookings: "/api/bookings",
      stats: "/api/stats",
    },
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`LocalPickup backend running on http://localhost:${PORT}`);
  console.log(`Database connected: SQLite (backend/data/localpickup.db)`);
});