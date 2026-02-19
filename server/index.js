// server.js - Express Backend with Local SQLite Database
// Industrial Symbiosis Intelligence Engine

const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ==================== DATABASE CONFIGURATION ====================

const dbDir = path.join(__dirname, "data");
const dbPath = path.join(dbDir, "symbiosis.db");

// Create data directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log("✅ Created data directory:", dbDir);
}

console.log("\n" + "=".repeat(70));
console.log("🗄️  INDUSTRIAL SYMBIOSIS INTELLIGENCE ENGINE - DATABASE SETUP");
console.log("=".repeat(70));
console.log(`📍 Database location: ${dbPath}\n`);

// Initialize SQLite Database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  } else {
    console.log("✅ Connected to local SQLite database");

    // Enable foreign keys for referential integrity
    db.run("PRAGMA foreign_keys = ON", (err) => {
      if (err) {
        console.error("❌ Error enabling foreign keys:", err);
      } else {
        console.log("✅ Foreign key constraints enabled");
      }
    });

    // Initialize tables
    initDatabase().catch((err) => {
      console.error("❌ Failed to initialize database:", err);
      process.exit(1);
    });
  }
});

// Database error handler
db.on("error", (err) => {
  console.error("❌ Database error:", err);
});

// Process exit handler
process.on("exit", () => {
  db.close((err) => {
    if (err) console.error("Error closing database:", err);
    else console.log("\n✅ Database connection closed");
  });
});

// ==================== HELPER FUNCTIONS ====================

const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        console.error("❌ Query error:", sql);
        console.error("   Error:", err.message);
        reject(err);
      } else {
        resolve({
          id: this.lastID,
          changes: this.changes,
          success: true,
        });
      }
    });
  });
};

const getAllQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error("❌ Query error:", sql);
        console.error("   Error:", err.message);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error("❌ Query error:", sql);
        console.error("   Error:", err.message);
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};

// ==================== DATABASE INITIALIZATION ====================

const initDatabase = async () => {
  console.log("\n📋 Initializing database tables...\n");

  const tables = [
    {
      name: "industries",
      sql: `CREATE TABLE IF NOT EXISTS industries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        sector TEXT NOT NULL,
        location TEXT,
        description TEXT,
        annual_output REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    },
    {
      name: "materials",
      sql: `CREATE TABLE IF NOT EXISTS materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        industry_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        material_type TEXT NOT NULL,
        quantity REAL,
        unit TEXT,
        chemical_composition TEXT,
        mechanical_tolerance REAL,
        thermodynamic_stability REAL,
        regulatory_status TEXT,
        availability_status TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
      )`,
    },
    {
      name: "reuse_opportunities",
      sql: `CREATE TABLE IF NOT EXISTS reuse_opportunities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_material_id INTEGER NOT NULL,
        target_industry_id INTEGER NOT NULL,
        compatibility_score REAL,
        feasibility_index REAL,
        preprocessing_required TEXT,
        estimated_cost_savings REAL,
        environmental_impact_reduction REAL,
        reliability_rating REAL,
        status TEXT DEFAULT 'discovered',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_material_id) REFERENCES materials(id) ON DELETE CASCADE,
        FOREIGN KEY (target_industry_id) REFERENCES industries(id) ON DELETE CASCADE
      )`,
    },
    {
      name: "transactions",
      sql: `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_industry_id INTEGER NOT NULL,
        target_industry_id INTEGER NOT NULL,
        material_id INTEGER NOT NULL,
        quantity_transferred REAL,
        unit TEXT,
        transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        cost_savings REAL,
        environmental_benefit REAL,
        FOREIGN KEY (source_industry_id) REFERENCES industries(id) ON DELETE CASCADE,
        FOREIGN KEY (target_industry_id) REFERENCES industries(id) ON DELETE CASCADE,
        FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
      )`,
    },
    {
      name: "circulation_metrics",
      sql: `CREATE TABLE IF NOT EXISTS circulation_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        industry_id INTEGER NOT NULL,
        material_name TEXT,
        days_to_reabsorption REAL,
        circulation_cycles INTEGER,
        reabsorption_rate REAL,
        measured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE CASCADE
      )`,
    },
  ];

  for (const table of tables) {
    try {
      await runQuery(table.sql);
      console.log(`  ✅ Table "${table.name}" checked/initialized`);
    } catch (err) {
      console.error(`  ❌ Error creating table "${table.name}":`, err.message);
    }
  }

  // Create indexes...
  const indexes = [
    {
      name: "idx_materials_industry",
      sql: "CREATE INDEX IF NOT EXISTS idx_materials_industry ON materials(industry_id)",
    },
  ];

  for (const index of indexes) {
    try {
      await runQuery(index.sql);
    } catch (err) {}
  }

  console.log("\n✅ Database initialization complete!\n");
};

// ==================== API ENDPOINTS ====================

// Health Check
app.get("/api/health", async (req, res) => {
  try {
    const count = await getQuery("SELECT COUNT(*) as count FROM industries");
    res.json({
      status: "ok",
      database: "connected",
      industriesCount: count?.count || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ==================== INDUSTRIES ====================

app.get("/api/industries", async (req, res) => {
  try {
    const industries = await getAllQuery(
      "SELECT * FROM industries ORDER BY created_at DESC",
    );
    res.json(industries);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch industries", message: err.message });
  }
});

app.post("/api/industries", async (req, res) => {
  const { name, sector, location, description, annual_output } = req.body;
  if (!name || !sector)
    return res.status(400).json({ error: "Name and sector are required" });

  try {
    const result = await runQuery(
      "INSERT INTO industries (name, sector, location, description, annual_output) VALUES (?, ?, ?, ?, ?)",
      [name, sector, location || null, description || null, annual_output || 0],
    );
    res
      .status(201)
      .json({ id: result.id, message: "Industry created", success: true });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create industry", message: err.message });
  }
});

// ==================== MATERIALS ====================

app.get("/api/materials", async (req, res) => {
  const { status } = req.query;
  try {
    let sql = `
      SELECT m.*, i.name as industry_name, i.sector
      FROM materials m
      JOIN industries i ON m.industry_id = i.id
    `;
    const params = [];

    if (status) {
      sql += ` WHERE m.availability_status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY m.created_at DESC`;
    const materials = await getAllQuery(sql, params);
    res.json(materials);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch materials", message: err.message });
  }
});

app.post("/api/materials", async (req, res) => {
  const {
    industry_id,
    name,
    material_type,
    quantity,
    unit,
    chemical_composition,
    mechanical_tolerance,
    thermodynamic_stability,
    regulatory_status,
    availability_status,
    description,
  } = req.body;

  if (!industry_id || !name)
    return res.status(400).json({ error: "Industry ID and name required" });

  try {
    const result = await runQuery(
      `INSERT INTO materials 
      (industry_id, name, material_type, quantity, unit, chemical_composition, 
       mechanical_tolerance, thermodynamic_stability, regulatory_status, 
       availability_status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        industry_id,
        name,
        material_type,
        quantity || 0,
        unit || "kg",
        chemical_composition,
        mechanical_tolerance,
        thermodynamic_stability,
        regulatory_status || "unknown",
        availability_status || "available",
        description,
      ],
    );
    res
      .status(201)
      .json({ id: result.id, message: "Material registered", success: true });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create material", message: err.message });
  }
});

// ==================== OPPORTUNITIES ====================

app.get("/api/reuse-opportunities", async (req, res) => {
  try {
    // FIX: Aliased target_industry_name to match client expectation
    const opportunities = await getAllQuery(`
      SELECT ro.*, 
             m.name as material_name, m.material_type,
             si.name as source_industry, si.sector as source_sector,
             ti.name as target_industry_name, ti.sector as target_sector
      FROM reuse_opportunities ro
      JOIN materials m ON ro.source_material_id = m.id
      JOIN industries si ON m.industry_id = si.id
      JOIN industries ti ON ro.target_industry_id = ti.id
      ORDER BY ro.feasibility_index DESC
    `);
    res.json(opportunities);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch opportunities", message: err.message });
  }
});

app.post("/api/reuse-opportunities", async (req, res) => {
  const {
    source_material_id,
    target_industry_id,
    compatibility_score,
    feasibility_index,
    preprocessing_required,
    estimated_cost_savings,
    environmental_impact_reduction,
    reliability_rating,
    notes,
  } = req.body;

  try {
    const result = await runQuery(
      `INSERT INTO reuse_opportunities 
      (source_material_id, target_industry_id, compatibility_score, feasibility_index,
       preprocessing_required, estimated_cost_savings, environmental_impact_reduction,
       reliability_rating, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        source_material_id,
        target_industry_id,
        compatibility_score || 0,
        feasibility_index || 0,
        preprocessing_required,
        estimated_cost_savings || 0,
        environmental_impact_reduction || 0,
        reliability_rating || 0,
        notes,
      ],
    );
    res
      .status(201)
      .json({ id: result.id, message: "Opportunity created", success: true });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create opportunity", message: err.message });
  }
});

// ==================== TRANSACTIONS ====================

app.get("/api/transactions", async (req, res) => {
  const { status } = req.query;
  try {
    let sql = `
      SELECT t.*, 
             m.name as material_name,
             si.name as source_industry,
             ti.name as target_industry
      FROM transactions t
      JOIN materials m ON t.material_id = m.id
      JOIN industries si ON t.source_industry_id = si.id
      JOIN industries ti ON t.target_industry_id = ti.id
    `;
    const params = [];
    if (status) {
      sql += ` WHERE t.status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY t.transaction_date DESC`;

    const transactions = await getAllQuery(sql, params);
    res.json(transactions);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch transactions", message: err.message });
  }
});

// ==================== SYMBIOSIS NETWORK ====================

app.get("/api/symbiosis/network", async (req, res) => {
  try {
    const nodes = await getAllQuery("SELECT id, name, sector FROM industries");
    // Edges from reuse opportunities (potential connections)
    const edges = await getAllQuery(`
      SELECT ro.id, 
             m.industry_id as source, 
             ro.target_industry_id as target, 
             ro.feasibility_index as strength
      FROM reuse_opportunities ro
      JOIN materials m ON ro.source_material_id = m.id
    `);
    res.json({ nodes, edges });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch network", message: err.message });
  }
});

// ==================== ANALYTICS ====================

app.get("/api/analytics/circulation", async (req, res) => {
  try {
    const metrics = await getAllQuery(`
      SELECT cm.*, i.name as industry_name 
      FROM circulation_metrics cm
      JOIN industries i ON cm.industry_id = i.id
      ORDER BY cm.measured_at DESC
    `);
    res.json(metrics);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch metrics", message: err.message });
  }
});

// ==================== DASHBOARD ====================

app.get("/api/dashboard-stats", async (req, res) => {
  try {
    const industriesCount = await getQuery(
      "SELECT COUNT(*) as count FROM industries",
    );
    const materialsCount = await getQuery(
      "SELECT COUNT(*) as count FROM materials",
    );
    const transactionsCount = await getQuery(
      "SELECT COUNT(*) as count FROM transactions",
    );
    const materialStock = await getQuery(
      "SELECT COALESCE(SUM(quantity), 0) as total FROM materials",
    );

    // Derived metrics for UI
    const avgFeasibility = await getQuery(
      "SELECT AVG(feasibility_index) as val FROM reuse_opportunities",
    );
    const activeConnections = await getQuery(
      "SELECT COUNT(*) as count FROM reuse_opportunities WHERE feasibility_index > 0.5",
    );

    // FIX: Keys match frontend expectations
    res.json({
      total_industries: industriesCount?.count || 0,
      available_materials: materialsCount?.count || 0,
      completed_transactions: transactionsCount?.count || 0,
      avg_feasibility: avgFeasibility?.val || 0,
      total_material_quantity: materialStock?.total || 0,
      active_connections: activeConnections?.count || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch statistics", message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
});
