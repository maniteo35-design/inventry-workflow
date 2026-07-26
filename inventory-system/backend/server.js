require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

const { sequelize } = require("./src/models");
const errorMiddleware = require("./src/middleware/error.middleware");

const authRoutes = require("./src/routes/auth.routes");
const productRoutes = require("./src/routes/product.routes");
const categoryRoutes = require("./src/routes/category.routes");
const brandRoutes = require("./src/routes/brand.routes");
const supplierRoutes = require("./src/routes/supplier.routes");
const customerRoutes = require("./src/routes/customer.routes");
const saleRoutes = require("./src/routes/sale.routes");
const purchaseRoutes = require("./src/routes/purchase.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const reportRoutes = require("./src/routes/report.routes");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic rate limiting (extra layer beyond auth attempts)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";

async function ensureDefaultAdmin() {
  // Zero-config first run: if AUTO_SEED_ADMIN=true and no users exist yet,
  // create a default super_admin so the app is usable immediately without a
  // separate seed step. Used by the offline desktop app; opt-in elsewhere too.
  if (process.env.AUTO_SEED_ADMIN !== "true") return;

  const { User } = require("./src/models");
  const bcrypt = require("bcryptjs");

  const count = await User.count();
  if (count > 0) return;

  const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@local";
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!";
  const hash = await bcrypt.hash(password, 10);

  await User.create({ name: "Administrator", email, password: hash, role: "super_admin" });
  console.log(`Default admin account created: ${email} / ${password}`);
}

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");
    // In production, use migrations instead of sync({alter:true})
    await sequelize.sync({ alter: process.env.NODE_ENV !== "production" });
    console.log("Models synced.");
    await ensureDefaultAdmin();
    app.listen(PORT, HOST, () => console.log(`API running at http://${HOST}:${PORT}`));
  } catch (err) {
    console.error("Unable to start server:", err);
    process.exit(1);
  }
}

start();
