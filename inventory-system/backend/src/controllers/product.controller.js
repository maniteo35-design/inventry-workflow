const { Op } = require("sequelize");
const { Product, Category, Brand, Supplier, Warehouse, StockMovement } = require("../models");
const { generateProductCode, generateBarcodeNumber } = require("../utils/generateCode");
const { generateQRCodeDataUrl } = require("../utils/barcode");

exports.create = async (req, res, next) => {
  try {
    const body = req.body;
    const productCode = body.productCode || generateProductCode();
    const barcode = body.barcode || generateBarcodeNumber();
    const qrCode = await generateQRCodeDataUrl(barcode);

    const product = await Product.create({ ...body, productCode, barcode, qrCode });

    if (product.quantity > 0) {
      await StockMovement.create({
        type: "adjustment",
        quantityChange: product.quantity,
        quantityAfter: product.quantity,
        note: "Initial stock on product creation",
        productId: product.id,
        userId: req.user.id,
      });
    }

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      supplier,
      status,
      minPrice,
      maxPrice,
      stockStatus, // "in_stock" | "low_stock" | "out_of_stock"
      page = 1,
      limit = 25,
      sortBy = "createdAt",
      sortDir = "DESC",
    } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { productCode: { [Op.like]: `%${search}%` } },
        { barcode: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category) where.categoryId = category;
    if (brand) where.brandId = brand;
    if (supplier) where.supplierId = supplier;
    if (status) where.status = status;
    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice[Op.gte] = minPrice;
      if (maxPrice) where.sellingPrice[Op.lte] = maxPrice;
    }
    if (stockStatus === "out_of_stock") where.quantity = 0;
    if (stockStatus === "in_stock") where.quantity = { [Op.gt]: 0 };
    // low_stock filtered post-query since it compares two columns

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, attributes: ["id", "name"] },
        { model: Brand, attributes: ["id", "name"] },
        { model: Supplier, attributes: ["id", "companyName"] },
        { model: Warehouse, attributes: ["id", "name"] },
      ],
      order: [[sortBy, sortDir]],
      limit: Number(limit),
      offset,
    });

    let results = rows;
    if (stockStatus === "low_stock") {
      results = rows.filter((p) => p.quantity > 0 && p.quantity <= p.minStockThreshold);
    }

    res.json({
      data: results,
      pagination: { total: count, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Brand },
        { model: Supplier },
        { model: Warehouse },
        { model: StockMovement, order: [["createdAt", "DESC"]], limit: 50 },
      ],
    });
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    const prevQty = product.quantity;
    await product.update(req.body);

    if (req.body.quantity !== undefined && Number(req.body.quantity) !== prevQty) {
      const diff = Number(req.body.quantity) - prevQty;
      await StockMovement.create({
        type: "adjustment",
        quantityChange: diff,
        quantityAfter: product.quantity,
        note: "Manual stock adjustment",
        productId: product.id,
        userId: req.user.id,
      });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    await product.destroy();
    res.json({ message: "Product deleted." });
  } catch (err) {
    next(err);
  }
};

exports.duplicate = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, { raw: true });
    if (!product) return res.status(404).json({ message: "Product not found." });

    delete product.id;
    product.name = `${product.name} (Copy)`;
    product.productCode = generateProductCode();
    product.barcode = generateBarcodeNumber();
    product.qrCode = await generateQRCodeDataUrl(product.barcode);
    product.quantity = 0;

    const copy = await Product.create(product);
    res.status(201).json(copy);
  } catch (err) {
    next(err);
  }
};

exports.bulkImport = async (req, res, next) => {
  try {
    // Expects { products: [ {...}, {...} ] } parsed client-side from CSV/Excel
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "products array is required." });
    }

    const created = [];
    for (const p of products) {
      const productCode = p.productCode || generateProductCode();
      const barcode = p.barcode || generateBarcodeNumber();
      const qrCode = await generateQRCodeDataUrl(barcode);
      created.push(await Product.create({ ...p, productCode, barcode, qrCode }));
    }

    res.status(201).json({ imported: created.length, products: created });
  } catch (err) {
    next(err);
  }
};

exports.lowStock = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    const low = products.filter((p) => p.quantity > 0 && p.quantity <= p.minStockThreshold);
    const out = products.filter((p) => p.quantity === 0);
    res.json({ lowStock: low, outOfStock: out });
  } catch (err) {
    next(err);
  }
};
