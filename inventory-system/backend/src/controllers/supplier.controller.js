const { Supplier, Product, Purchase } = require("../models");

exports.create = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const suppliers = await Supplier.findAll({ order: [["companyName", "ASC"]] });
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id, {
      include: [{ model: Product }, { model: Purchase }],
    });
    if (!supplier) return res.status(404).json({ message: "Supplier not found." });
    res.json(supplier);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found." });
    await supplier.update(req.body);
    res.json(supplier);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found." });
    await supplier.destroy();
    res.json({ message: "Supplier deleted." });
  } catch (err) {
    next(err);
  }
};
