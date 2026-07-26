const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Supplier = sequelize.define("Supplier", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyName: { type: DataTypes.STRING, allowNull: false },
  contactPerson: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
});

module.exports = Supplier;
