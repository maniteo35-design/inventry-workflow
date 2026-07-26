const { Category, Product } = require("../models");

exports.create = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [["name", "ASC"]] });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });
    await category.update(req.body);
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const inUse = await Product.count({ where: { categoryId: req.params.id } });
    if (inUse > 0) {
      return res.status(400).json({ message: `Cannot delete: ${inUse} product(s) use this category.` });
    }
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });
    await category.destroy();
    res.json({ message: "Category deleted." });
  } catch (err) {
    next(err);
  }
};
