const mongoose = require("mongoose");
const Product = require("../models/Product");
const { validateProductBody } = require("../middleware/validate");

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/products?search=&category=&page=&limit=
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category && String(req.query.category).trim()) {
      filter.category = String(req.query.category).trim();
    }
    if (req.query.search && String(req.query.search).trim()) {
      filter.name = { $regex: escapeRegex(String(req.query.search).trim()), $options: "i" };
    }

    const [data, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/products
exports.create = async (req, res, next) => {
  try {
    const { errors, value } = validateProductBody(req.body || {});
    if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

    const product = await Product.create(value);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
exports.update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const { errors, value } = validateProductBody(req.body || {}, { partial: true });
    if (errors.length) return res.status(400).json({ error: "Validation failed", details: errors });

    const updated = await Product.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
exports.remove = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const deleted = await Product.findByIdAndDelete(req.params.id).lean();
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ deleted: true, product: deleted });
  } catch (err) {
    next(err);
  }
};