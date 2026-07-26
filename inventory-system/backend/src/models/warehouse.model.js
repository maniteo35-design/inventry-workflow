const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Warehouse = sequelize.define("Warehouse", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  location: { type: DataTypes.STRING },
});

module.exports = Warehouse;
