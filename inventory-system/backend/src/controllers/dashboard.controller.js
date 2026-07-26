const { Op, fn, col, literal } = require("sequelize");
const { Product, Category, Sale, SaleItem } = require("../models");

exports.summary = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalProducts, totalCategories, stockAgg, products] = await Promise.all([
      Product.count(),
      Category.count(),
      Product.sum("quantity"),
      Product.findAll({ attributes: ["id", "quantity", "minStockThreshold", "purchasePrice", "sellingPrice"] }),
    ]);

    const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= p.minStockThreshold).length;
    const outOfStock = products.filter((p) => p.quantity === 0).length;

    const inventoryValue = products.reduce((sum, p) => sum + Number(p.purchasePrice) * p.quantity, 0);

    async function salesTotal(since) {
      const result = await Sale.sum("total", {
        where: { status: "completed", createdAt: { [Op.gte]: since } },
      });
      return result || 0;
    }

    const [todaySales, weekSales, monthSales] = await Promise.all([
      salesTotal(startOfToday),
      salesTotal(startOfWeek),
      salesTotal(startOfMonth),
    ]);

    // Rough profit: sum((unitPrice - product.purchasePrice) * quantity) over completed sale items this month
    const items = await SaleItem.findAll({
      include: [{ model: Product, attributes: ["purchasePrice"] }, { model: Sale, attributes: ["status", "createdAt"], where: { status: "completed", createdAt: { [Op.gte]: startOfMonth } } }],
    });
    const profit = items.reduce((sum, i) => sum + (Number(i.unitPrice) - Number(i.Product.purchasePrice)) * i.quantity, 0);

    const recentTransactions = await Sale.findAll({
      order: [["createdAt", "DESC"]],
      limit: 10,
      include: [{ model: SaleItem }],
    });

    const topProductsRaw = await SaleItem.findAll({
      attributes: ["productId", [fn("SUM", col("quantity")), "totalSold"]],
      group: ["productId", "Product.id"],
      order: [[literal("totalSold"), "DESC"]],
      limit: 5,
      include: [{ model: Product, attributes: ["id", "name", "sellingPrice"] }],
    });

    res.json({
      totalProducts,
      totalCategories,
      totalStockQuantity: stockAgg || 0,
      lowStockProducts: lowStock,
      outOfStockProducts: outOfStock,
      todaySales,
      weekSales,
      monthSales,
      inventoryValue,
      profit,
      recentTransactions,
      topSellingProducts: topProductsRaw,
    });
  } catch (err) {
    next(err);
  }
};

// Data points for a sales trend chart, e.g. last 7 or 30 days
exports.salesChart = async (req, res, next) => {
  try {
    const days = Number(req.query.days || 7);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const sales = await Sale.findAll({
      where: { status: "completed", createdAt: { [Op.gte]: since } },
      attributes: [
        [fn("DATE", col("createdAt")), "date"],
        [fn("SUM", col("total")), "total"],
      ],
      group: [literal("date")],
      order: [literal("date ASC")],
    });

    res.json(sales);
  } catch (err) {
    next(err);
  }
};
