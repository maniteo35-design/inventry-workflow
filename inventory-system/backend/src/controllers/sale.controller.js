const { sequelize, Sale, SaleItem, Product, StockMovement, Customer } = require("../models");
const { generateInvoiceNumber } = require("../utils/generateCode");

// Create a sale (checkout from POS cart)
// body: { items: [{productId, quantity}], customerId, discount, taxRate, paymentMethod, amountPaid, status }
exports.create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { items, customerId, discount = 0, taxRate = 0, paymentMethod = "cash", amountPaid, status = "completed" } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "At least one item is required." });
    }

    let subtotal = 0;
    const preparedItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!product) throw Object.assign(new Error(`Product ${item.productId} not found.`), { status: 404 });
      if (status === "completed" && product.quantity < item.quantity) {
        throw Object.assign(
          new Error(`Insufficient stock for "${product.name}". Available: ${product.quantity}.`),
          { status: 400 }
        );
      }
      const unitPrice = Number(product.sellingPrice);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      preparedItems.push({ product, quantity: item.quantity, unitPrice, lineTotal });
    }

    const tax = (subtotal - discount) * (Number(taxRate) / 100);
    const total = subtotal - discount + tax;

    const sale = await Sale.create(
      {
        invoiceNumber: generateInvoiceNumber(),
        subtotal,
        discount,
        tax,
        total,
        amountPaid: amountPaid ?? total,
        paymentMethod,
        status,
        customerId: customerId || null,
        userId: req.user.id,
      },
      { transaction: t }
    );

    for (const { product, quantity, unitPrice, lineTotal } of preparedItems) {
      await SaleItem.create(
        { saleId: sale.id, productId: product.id, quantity, unitPrice, lineTotal },
        { transaction: t }
      );

      if (status === "completed") {
        product.quantity -= quantity;
        await product.save({ transaction: t });

        await StockMovement.create(
          {
            type: "sale_out",
            quantityChange: -quantity,
            quantityAfter: product.quantity,
            reference: sale.invoiceNumber,
            productId: product.id,
            userId: req.user.id,
          },
          { transaction: t }
        );
      }
    }

    if (customerId && status === "completed") {
      await Customer.increment("loyaltyPoints", { by: Math.floor(total / 10), where: { id: customerId }, transaction: t });
    }

    await t.commit();

    const fullSale = await Sale.findByPk(sale.id, { include: [{ model: SaleItem, include: [Product] }, Customer] });
    res.status(201).json(fullSale);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const { from, to, status, page = 1, limit = 25 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (from || to) {
      const { Op } = require("sequelize");
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }
    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Sale.findAndCountAll({
      where,
      include: [{ model: SaleItem, include: [Product] }, Customer],
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset,
    });
    res.json({ data: rows, pagination: { total: count, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const sale = await Sale.findByPk(req.params.id, { include: [{ model: SaleItem, include: [Product] }, Customer] });
    if (!sale) return res.status(404).json({ message: "Sale not found." });
    res.json(sale);
  } catch (err) {
    next(err);
  }
};

// Refund / return: restocks items and marks sale accordingly
exports.refund = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const sale = await Sale.findByPk(req.params.id, { include: [SaleItem], transaction: t });
    if (!sale) throw Object.assign(new Error("Sale not found."), { status: 404 });
    if (sale.status === "refunded") throw Object.assign(new Error("Sale already refunded."), { status: 400 });

    for (const item of sale.SaleItems) {
      const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
      if (product) {
        product.quantity += item.quantity;
        await product.save({ transaction: t });
        await StockMovement.create(
          {
            type: "return_in",
            quantityChange: item.quantity,
            quantityAfter: product.quantity,
            reference: sale.invoiceNumber,
            productId: product.id,
            userId: req.user.id,
          },
          { transaction: t }
        );
      }
    }

    sale.status = req.body.type === "return" ? "returned" : "refunded";
    await sale.save({ transaction: t });

    await t.commit();
    res.json(sale);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// Hold sale: create with status "held" (no stock deducted), resume later by re-submitting as completed.
exports.heldSales = async (req, res, next) => {
  try {
    const held = await Sale.findAll({ where: { status: "held" }, include: [{ model: SaleItem, include: [Product] }] });
    res.json(held);
  } catch (err) {
    next(err);
  }
};
