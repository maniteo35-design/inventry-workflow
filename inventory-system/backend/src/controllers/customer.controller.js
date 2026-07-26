const { Customer, Sale, SaleItem, Product } = require("../models");

exports.create = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const customers = await Customer.findAll({ order: [["name", "ASC"]] });
    res.json(customers);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        {
          model: Sale,
          include: [{ model: SaleItem, include: [Product] }],
          order: [["createdAt", "DESC"]],
        },
      ],
    });
    if (!customer) return res.status(404).json({ message: "Customer not found." });

    const totalPurchases = customer.Sales.reduce((sum, s) => sum + Number(s.total), 0);
    res.json({ ...customer.toJSON(), totalPurchases });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found." });
    await customer.update(req.body);
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found." });
    await customer.destroy();
    res.json({ message: "Customer deleted." });
  } catch (err) {
    next(err);
  }
};
