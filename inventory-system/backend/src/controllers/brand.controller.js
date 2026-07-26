const { Brand, Product } = require("../models");

exports.create = async (req, res, next) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json(brand);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const brands = await Brand.findAll({ order: [["name", "ASC"]] });
    res.json(brands);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found." });
    await brand.update(req.body);
    res.json(brand);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const inUse = await Product.count({ where: { brandId: req.params.id } });
    if (inUse > 0) return res.status(400).json({ message: `Cannot delete: ${inUse} product(s) use this brand.` });
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: "Brand not found." });
    await brand.destroy();
    res.json({ message: "Brand deleted." });
  } catch (err) {
    next(err);
  }
};
