const { sequelize, Purchase, PurchaseItem, Product, StockMovement } = require("../models");
const { generatePurchaseNumber } = require("../utils/generateCode");

// body: { supplierId, items: [{productId, quantity, unitCost}], tax, paymentStatus, deliveryStatus }
exports.create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { supplierId, items, tax = 0, paymentStatus = "unpaid", deliveryStatus = "pending" } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: "At least one item is required." });
    }

    let totalCost = 0;
    const prepared = items.map((i) => {
      const lineTotal = i.unitCost * i.quantity;
      totalCost += lineTotal;
      return { ...i, lineTotal };
    });
    totalCost += Number(tax);

    const purchase = await Purchase.create(
      {
        purchaseNumber: generatePurchaseNumber(),
        totalCost,
        tax,
        paymentStatus,
        deliveryStatus,
        supplierId,
        userId: req.user.id,
      },
      { transaction: t }
    );

    for (const item of prepared) {
      await PurchaseItem.create(
        {
          purchaseId: purchase.id,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          lineTotal: item.lineTotal,
        },
        { transaction: t }
      );

      // Only increase stock once goods are marked delivered
      if (deliveryStatus === "delivered") {
        const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
        if (product) {
          product.quantity += item.quantity;
          await product.save({ transaction: t });
          await StockMovement.create(
            {
              type: "purchase_in",
              quantityChange: item.quantity,
              quantityAfter: product.quantity,
              reference: purchase.purchaseNumber,
              productId: product.id,
              userId: req.user.id,
            },
            { transaction: t }
          );
        }
      }
    }

    await t.commit();
    const full = await Purchase.findByPk(purchase.id, { include: [{ model: PurchaseItem, include: [Product] }] });
    res.status(201).json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const purchases = await Purchase.findAll({
      include: [{ model: PurchaseItem, include: [Product] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(purchases);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, { include: [{ model: PurchaseItem, include: [Product] }] });
    if (!purchase) return res.status(404).json({ message: "Purchase not found." });
    res.json(purchase);
  } catch (err) {
    next(err);
  }
};

// Marks a pending purchase as delivered, which triggers stock-in.
exports.markDelivered = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const purchase = await Purchase.findByPk(req.params.id, { include: [PurchaseItem], transaction: t });
    if (!purchase) throw Object.assign(new Error("Purchase not found."), { status: 404 });
    if (purchase.deliveryStatus === "delivered") throw Object.assign(new Error("Already delivered."), { status: 400 });

    for (const item of purchase.PurchaseItems) {
      const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
      if (product) {
        product.quantity += item.quantity;
        await product.save({ transaction: t });
        await StockMovement.create(
          {
            type: "purchase_in",
            quantityChange: item.quantity,
            quantityAfter: product.quantity,
            reference: purchase.purchaseNumber,
            productId: product.id,
            userId: req.user.id,
          },
          { transaction: t }
        );
      }
    }

    purchase.deliveryStatus = "delivered";
    await purchase.save({ transaction: t });
    await t.commit();
    res.json(purchase);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
