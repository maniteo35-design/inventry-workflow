const sequelize = require("../config/db");

const User = require("./user.model");
const Category = require("./category.model");
const Brand = require("./brand.model");
const Supplier = require("./supplier.model");
const Customer = require("./customer.model");
const Warehouse = require("./warehouse.model");
const Product = require("./product.model");
const StockMovement = require("./stockMovement.model");
const Sale = require("./sale.model");
const SaleItem = require("./saleItem.model");
const Purchase = require("./purchase.model");
const PurchaseItem = require("./purchaseItem.model");

// ---- Associations ----

Category.hasMany(Product, { foreignKey: "categoryId" });
Product.belongsTo(Category, { foreignKey: "categoryId" });

Brand.hasMany(Product, { foreignKey: "brandId" });
Product.belongsTo(Brand, { foreignKey: "brandId" });

Supplier.hasMany(Product, { foreignKey: "supplierId" });
Product.belongsTo(Supplier, { foreignKey: "supplierId" });

Warehouse.hasMany(Product, { foreignKey: "warehouseId" });
Product.belongsTo(Warehouse, { foreignKey: "warehouseId" });

Product.hasMany(StockMovement, { foreignKey: "productId" });
StockMovement.belongsTo(Product, { foreignKey: "productId" });

User.hasMany(StockMovement, { foreignKey: "userId" });
StockMovement.belongsTo(User, { foreignKey: "userId" });

Customer.hasMany(Sale, { foreignKey: "customerId" });
Sale.belongsTo(Customer, { foreignKey: "customerId" });

User.hasMany(Sale, { foreignKey: "userId" }); // cashier
Sale.belongsTo(User, { foreignKey: "userId" });

Sale.hasMany(SaleItem, { foreignKey: "saleId", onDelete: "CASCADE" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId" });

Product.hasMany(SaleItem, { foreignKey: "productId" });
SaleItem.belongsTo(Product, { foreignKey: "productId" });

Supplier.hasMany(Purchase, { foreignKey: "supplierId" });
Purchase.belongsTo(Supplier, { foreignKey: "supplierId" });

User.hasMany(Purchase, { foreignKey: "userId" });
Purchase.belongsTo(User, { foreignKey: "userId" });

Purchase.hasMany(PurchaseItem, { foreignKey: "purchaseId", onDelete: "CASCADE" });
PurchaseItem.belongsTo(Purchase, { foreignKey: "purchaseId" });

Product.hasMany(PurchaseItem, { foreignKey: "productId" });
PurchaseItem.belongsTo(Product, { foreignKey: "productId" });

module.exports = {
  sequelize,
  User,
  Category,
  Brand,
  Supplier,
  Customer,
  Warehouse,
  Product,
  StockMovement,
  Sale,
  SaleItem,
  Purchase,
  PurchaseItem,
};
