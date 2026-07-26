const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Records every inventory change for audit / product timeline
const StockMovement = sequelize.define("StockMovement", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: {
    type: DataTypes.ENUM("purchase_in", "sale_out", "adjustment", "return_in", "transfer"),
    allowNull: false,
  },
  quantityChange: { type: DataTypes.INTEGER, allowNull: false }, // + or -
  quantityAfter: { type: DataTypes.INTEGER, allowNull: false },
  reference: { type: DataTypes.STRING }, // e.g. sale #, purchase #
  note: { type: DataTypes.STRING },
});

module.exports = StockMovement;
