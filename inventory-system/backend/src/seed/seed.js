require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User, Category, Brand, Supplier, Customer, Warehouse, Product } = require("../models");
const { generateQRCodeDataUrl } = require("../utils/barcode");
const { generateProductCode, generateBarcodeNumber } = require("../utils/generateCode");

async function run() {
  await sequelize.sync({ force: true }); // WARNING: drops and recreates all tables
  console.log("Tables recreated.");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  await User.bulkCreate([
    { name: "Super Admin", email: "admin@example.com", password: passwordHash, role: "super_admin" },
    { name: "Store Manager", email: "manager@example.com", password: passwordHash, role: "manager" },
    { name: "Cashier Jane", email: "cashier@example.com", password: passwordHash, role: "salesperson" },
  ]);

  const categories = await Category.bulkCreate([
    { name: "Electronics" },
    { name: "Groceries" },
    { name: "Stationery" },
    { name: "Beverages" },
  ]);

  const brands = await Brand.bulkCreate([{ name: "Generic" }, { name: "Samsung" }, { name: "Nestle" }]);

  const suppliers = await Supplier.bulkCreate([
    { companyName: "Accra Wholesale Ltd", contactPerson: "Kwame Mensah", phone: "+233201234567", email: "sales@accrawholesale.com" },
    { companyName: "Global Electronics Distributors", contactPerson: "Ama Owusu", phone: "+233209876543", email: "info@geld.com" },
  ]);

  const warehouse = await Warehouse.create({ name: "Main Warehouse", location: "Accra" });

  await Customer.bulkCreate([
    { name: "Walk-in Customer", phone: "", email: "" },
    { name: "Kofi Boateng", phone: "+233551112222", email: "kofi@example.com" },
  ]);

  const sampleProducts = [
    { name: "Samsung Galaxy A15 Charger", purchasePrice: 30, sellingPrice: 55, quantity: 40, categoryId: categories[0].id, brandId: brands[1].id },
    { name: "Rice 5kg Bag", purchasePrice: 60, sellingPrice: 80, quantity: 8, categoryId: categories[1].id, brandId: brands[0].id },
    { name: "A4 Exercise Book", purchasePrice: 3, sellingPrice: 6, quantity: 200, categoryId: categories[2].id, brandId: brands[0].id },
    { name: "Nescafe Instant Coffee 200g", purchasePrice: 25, sellingPrice: 38, quantity: 3, categoryId: categories[3].id, brandId: brands[2].id },
  ];

  for (const p of sampleProducts) {
    const productCode = generateProductCode();
    const barcode = generateBarcodeNumber();
    const qrCode = await generateQRCodeDataUrl(barcode);
    await Product.create({
      ...p,
      productCode,
      barcode,
      qrCode,
      unit: "pcs",
      minStockThreshold: 10,
      supplierId: suppliers[0].id,
      warehouseId: warehouse.id,
      status: "active",
      productType: "physical",
    });
  }

  console.log("Seed complete.");
  console.log("Login with: admin@example.com / Password123!");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
