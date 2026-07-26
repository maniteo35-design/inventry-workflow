const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PurchaseItem = sequelize.define("PurchaseItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitCost: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  lineTotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
});

module.exports = PurchaseItem;
