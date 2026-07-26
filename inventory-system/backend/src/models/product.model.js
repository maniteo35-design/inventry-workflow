const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  productCode: { type: DataTypes.STRING, allowNull: false, unique: true },
  barcode: { type: DataTypes.STRING, unique: true },
  qrCode: { type: DataTypes.TEXT }, // base64 data URL
  purchasePrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  sellingPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  unit: { type: DataTypes.STRING, defaultValue: "pcs" },
  minStockThreshold: { type: DataTypes.INTEGER, defaultValue: 5 },
  expiryDate: { type: DataTypes.DATEONLY, allowNull: true },
  manufactureDate: { type: DataTypes.DATEONLY, allowNull: true },
  shelfNumber: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  images: { type: DataTypes.JSON, defaultValue: [] }, // array of image URLs, first = main
  productType: {
    type: DataTypes.ENUM(
      "perishable",
      "non_perishable",
      "digital",
      "physical",
      "raw_material",
      "finished_goods",
      "consumable",
      "spare_part"
    ),
    defaultValue: "physical",
  },
  status: { type: DataTypes.ENUM("active", "inactive", "discontinued"), defaultValue: "active" },
});

module.exports = Product;
