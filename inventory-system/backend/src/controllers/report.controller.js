const { Op } = require("sequelize");
const { Parser } = require("json2csv");
const { Sale, SaleItem, Product, Purchase, Customer, Supplier } = require("../models");

async function getSalesInRange(from, to) {
  const where = { status: "completed" };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt[Op.gte] = new Date(from);
    if (to) where.createdAt[Op.lte] = new Date(to);
  }
  return Sale.findAll({ where, include: [{ model: SaleItem, include: [Product] }, Customer], order: [["createdAt", "DESC"]] });
}

exports.salesReport = async (req, res, next) => {
  try {
    const { from, to, format = "json" } = req.query;
    const sales = await getSalesInRange(from, to);

    if (format === "csv") {
      const rows = sales.map((s) => ({
        invoice: s.invoiceNumber,
        date: s.createdAt,
        customer: s.Customer ? s.Customer.name : "Walk-in",
        subtotal: s.subtotal,
        discount: s.discount,
        tax: s.tax,
        total: s.total,
        paymentMethod: s.paymentMethod,
      }));
      const csv = new Parser().parse(rows);
      res.header("Content-Type", "text/csv");
      res.attachment("sales_report.csv");
      return res.send(csv);
    }

    res.json(sales);
  } catch (err) {
    next(err);
  }
};

exports.profitReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const sales = await getSalesInRange(from, to);
    let revenue = 0;
    let cost = 0;
    for (const sale of sales) {
      for (const item of sale.SaleItems) {
        revenue += Number(item.lineTotal);
        cost += Number(item.Product.purchasePrice) * item.quantity;
      }
    }
    res.json({ revenue, cost, profit: revenue - cost, margin: revenue ? ((revenue - cost) / revenue) * 100 : 0 });
  } catch (err) {
    next(err);
  }
};

exports.stockReport = async (req, res, next) => {
  try {
    const { format = "json" } = req.query;
    const products = await Product.findAll();
    if (format === "csv") {
      const rows = products.map((p) => ({
        name: p.name,
        code: p.productCode,
        quantity: p.quantity,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        stockValue: Number(p.purchasePrice) * p.quantity,
      }));
      const csv = new Parser().parse(rows);
      res.header("Content-Type", "text/csv");
      res.attachment("stock_report.csv");
      return res.send(csv);
    }
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.purchaseReport = async (req, res, next) => {
  try {
    const purchases = await Purchase.findAll({ include: [Supplier], order: [["createdAt", "DESC"]] });
    res.json(purchases);
  } catch (err) {
    next(err);
  }
};

exports.inventoryValuation = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    const valuationAtCost = products.reduce((sum, p) => sum + Number(p.purchasePrice) * p.quantity, 0);
    const valuationAtRetail = products.reduce((sum, p) => sum + Number(p.sellingPrice) * p.quantity, 0);
    res.json({ valuationAtCost, valuationAtRetail, potentialProfit: valuationAtRetail - valuationAtCost });
  } catch (err) {
    next(err);
  }
};
