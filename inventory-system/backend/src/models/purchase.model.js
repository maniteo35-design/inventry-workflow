const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Purchase = sequelize.define("Purchase", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  purchaseNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  totalCost: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  tax: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  paymentStatus: { type: DataTypes.ENUM("unpaid", "partial", "paid"), defaultValue: "unpaid" },
  deliveryStatus: { type: DataTypes.ENUM("pending", "in_transit", "delivered"), defaultValue: "pending" },
});

module.exports = Purchase;
