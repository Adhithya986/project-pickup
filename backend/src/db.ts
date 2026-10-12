import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Ensure data folder exists
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "localpickup.db");
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency performance
db.pragma("journal_mode = WAL");

export function initDatabase() {
  // Shops table
  db.exec(`
    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Printing',
      tagline TEXT,
      description TEXT,
      address TEXT,
      distance TEXT,
      phone TEXT,
      rating REAL DEFAULT 4.5,
      reviewCount INTEGER DEFAULT 42,
      openHours TEXT DEFAULT '8:00 AM - 10:00 PM',
      startingPrice TEXT DEFAULT 'From ₹2',
      icon TEXT DEFAULT '🖨️',
      isPopular INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shopId INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      priceText TEXT NOT NULL,
      basePrice REAL DEFAULT 2.0,
      icon TEXT DEFAULT '📄',
      isBookable INTEGER DEFAULT 1,
      FOREIGN KEY (shopId) REFERENCES shops (id) ON DELETE CASCADE
    );
  `);

  // Bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      shopId INTEGER NOT NULL,
      shopName TEXT NOT NULL,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      customerEmail TEXT,
      documentName TEXT NOT NULL,
      documentPath TEXT,
      documentSize TEXT,
      paperSize TEXT NOT NULL DEFAULT 'A4',
      colour TEXT NOT NULL DEFAULT 'bw',
      sides TEXT NOT NULL DEFAULT 'single',
      copies INTEGER NOT NULL DEFAULT 1,
      binding INTEGER NOT NULL DEFAULT 0,
      lamination INTEGER NOT NULL DEFAULT 0,
      instructions TEXT,
      pickupDate TEXT NOT NULL,
      pickupSlot TEXT NOT NULL,
      totalPrice REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- pending | printing | ready | completed | cancelled
      qrToken TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shopId) REFERENCES shops (id)
    );
  `);

  // Seed default shops and services if empty
  const shopCount = db.prepare("SELECT COUNT(*) as count FROM shops").get() as { count: number };
  if (shopCount.count === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  console.log("Seeding initial shops and services into SQLite database...");

  const insertShop = db.prepare(`
    INSERT INTO shops (name, category, tagline, description, address, distance, phone, rating, reviewCount, openHours, startingPrice, icon, isPopular)
    VALUES (@name, @category, @tagline, @description, @address, @distance, @phone, @rating, @reviewCount, @openHours, @startingPrice, @icon, @isPopular)
  `);

  const insertService = db.prepare(`
    INSERT INTO services (shopId, name, description, priceText, basePrice, icon, isBookable)
    VALUES (@shopId, @name, @description, @priceText, @basePrice, @icon, @isBookable)
  `);

  const shopsData = [
    {
      name: "ABC Digital Prints",
      category: "Printing",
      tagline: "Printing • Photocopy • Binding",
      description: "Fast-turnaround high-speed digital printing, colour laser, spiral binding, and project thesis formatting.",
      address: "North Campus Gate 2, Main Street, Delhi",
      distance: "0.8 km",
      phone: "+91 98765 43210",
      rating: 4.8,
      reviewCount: 128,
      openHours: "8:00 AM - 10:30 PM",
      startingPrice: "From ₹2",
      icon: "🖨️",
      isPopular: 1,
      services: [
        {
          name: "Document Printing",
          description: "A4 & A3 high quality laser printing in Black & White or Rich Colour.",
          priceText: "From ₹2 / page",
          basePrice: 2,
          icon: "🖨️",
          isBookable: 1,
        },
        {
          name: "Spiral & Hard Binding",
          description: "Durable comb, wire, or hardbound cover with golden embossing for college projects.",
          priceText: "From ₹20 / book",
          basePrice: 20,
          icon: "📚",
          isBookable: 1,
        },
        {
          name: "Bulk Photocopy",
          description: "Crisp black and white document duplication at wholesale student rates.",
          priceText: "From ₹1.50 / page",
          basePrice: 1.5,
          icon: "📄",
          isBookable: 1,
        },
        {
          name: "Lamination & ID Cards",
          description: "Glossy or matte heat lamination to safeguard certificates and notes.",
          priceText: "From ₹10 / sheet",
          basePrice: 10,
          icon: "🛡️",
          isBookable: 1,
        },
      ],
    },
    {
      name: "Quick Print Center",
      category: "Printing",
      tagline: "Printing • Binding • Lamination",
      description: "Express printing hub near the library. Pre-book your lecture notes and skip the long lines.",
      address: "Library Road, Opposite Central Canteen",
      distance: "1.2 km",
      phone: "+91 98111 22334",
      rating: 4.6,
      reviewCount: 94,
      openHours: "7:30 AM - 11:00 PM",
      startingPrice: "From ₹2",
      icon: "⚡",
      isPopular: 0,
      services: [
        {
          name: "Lecture Notes Printing",
          description: "Double-sided economical printing tailored for slides and study materials.",
          priceText: "From ₹2 / page",
          basePrice: 2,
          icon: "📑",
          isBookable: 1,
        },
        {
          name: "Colour Poster & Charts",
          description: "Vibrant high-resolution gloss presentation charts and architectural sheets.",
          priceText: "From ₹15 / page",
          basePrice: 15,
          icon: "🎨",
          isBookable: 1,
        },
        {
          name: "Soft & Thermal Binding",
          description: "Quick clean thermal binding in under 5 minutes.",
          priceText: "From ₹25 / book",
          basePrice: 25,
          icon: "📕",
          isBookable: 1,
        },
      ],
    },
    {
      name: "City Copy & Stationery Hub",
      category: "Stationery",
      tagline: "Printing • Documents • Scanning",
      description: "Complete student stationer offering document digitizing, high-res scanning, blueprints, and materials.",
      address: "Hostel Block C Complex, South Gate",
      distance: "1.8 km",
      phone: "+91 97222 33445",
      rating: 4.5,
      reviewCount: 67,
      openHours: "9:00 AM - 9:30 PM",
      startingPrice: "From ₹2",
      icon: "🏪",
      isPopular: 0,
      services: [
        {
          name: "High-Res OCR Scanning",
          description: "Digitize handwritten books and notes into searchable PDFs.",
          priceText: "From ₹3 / scan",
          basePrice: 3,
          icon: "📱",
          isBookable: 1,
        },
        {
          name: "Colour Document Printing",
          description: "Laser grade 1200 DPI vibrant colour printing.",
          priceText: "From ₹5 / page",
          basePrice: 5,
          icon: "🖨️",
          isBookable: 1,
        },
      ],
    },
  ];

  const insertAll = db.transaction(() => {
    for (const shop of shopsData) {
      const { services, ...shopFields } = shop;
      const result = insertShop.run(shopFields);
      const shopId = result.lastInsertRowid;

      for (const service of services) {
        insertService.run({ shopId, ...service });
      }
    }
  });

  insertAll();

  // Seed sample initial bookings so the dashboard and bookings view have data immediately
  const sampleBookings = [
    {
      id: "LP-20261012-001",
      shopId: 1,
      shopName: "ABC Digital Prints",
      customerName: "Rahul Sharma",
      customerPhone: "9876543210",
      customerEmail: "rahul.sharma@campus.edu",
      documentName: "Machine_Learning_Project_Report.pdf",
      documentPath: null,
      documentSize: "2.4 MB",
      paperSize: "A4",
      colour: "colour",
      sides: "double",
      copies: 2,
      binding: 1,
      lamination: 0,
      instructions: "Please make sure cover page is printed on 120gsm paper.",
      pickupDate: "Today",
      pickupSlot: "8:30 PM",
      totalPrice: 48,
      status: "ready",
      qrToken: "QR-LP-20261012-001-SECURE",
    },
    {
      id: "LP-20261012-002",
      shopId: 1,
      shopName: "ABC Digital Prints",
      customerName: "Priya Patel",
      customerPhone: "9812345678",
      customerEmail: "priya.p@campus.edu",
      documentName: "Resume_Engineering_2026.pdf",
      documentPath: null,
      documentSize: "420 KB",
      paperSize: "A4",
      colour: "bw",
      sides: "single",
      copies: 5,
      binding: 0,
      lamination: 1,
      instructions: "Lamination on 1 copy please.",
      pickupDate: "Today",
      pickupSlot: "9:00 PM",
      totalPrice: 20,
      status: "printing",
      qrToken: "QR-LP-20261012-002-SECURE",
    },
  ];

  const insertBooking = db.prepare(`
    INSERT INTO bookings (
      id, shopId, shopName, customerName, customerPhone, customerEmail,
      documentName, documentPath, documentSize, paperSize, colour, sides,
      copies, binding, lamination, instructions, pickupDate, pickupSlot,
      totalPrice, status, qrToken
    ) VALUES (
      @id, @shopId, @shopName, @customerName, @customerPhone, @customerEmail,
      @documentName, @documentPath, @documentSize, @paperSize, @colour, @sides,
      @copies, @binding, @lamination, @instructions, @pickupDate, @pickupSlot,
      @totalPrice, @status, @qrToken
    )
  `);

  for (const b of sampleBookings) {
    insertBooking.run(b);
  }

  console.log("Database initialized and seeded successfully.");
}
