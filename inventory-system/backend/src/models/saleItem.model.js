const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SaleItem = sequelize.define("SaleItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  lineTotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
});

module.exports = SaleItem;
