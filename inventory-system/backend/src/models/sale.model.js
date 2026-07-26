const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Sale = sequelize.define("Sale", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  invoiceNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  discount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  tax: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  amountPaid: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  paymentMethod: {
    type: DataTypes.ENUM("cash", "card", "mobile_money", "bank_transfer", "split"),
    defaultValue: "cash",
  },
  status: { type: DataTypes.ENUM("completed", "held", "refunded", "returned"), defaultValue: "completed" },
});

module.exports = Sale;
