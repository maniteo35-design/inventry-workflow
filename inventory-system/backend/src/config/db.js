const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const dialect = process.env.DB_DIALECT || "mysql";

let sequelize;

if (dialect === "sqlite") {
  // Fully offline mode: a single local file, no DB server required.
  // Used by the Electron desktop app (see /electron/main.js).
  const storage = process.env.DB_STORAGE || path.join(__dirname, "../../data/inventory.sqlite");
  const dir = path.dirname(storage);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  sequelize = new Sequelize({
    dialect: "sqlite",
    storage,
    logging: false,
    define: { underscored: true },
  });
} else {
  // "mysql" or "postgres" — for server/hosted deployments.
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect,
      logging: false,
      define: { underscored: true },
    }
  );
}

module.exports = sequelize;
