const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: [true, "category is required"],
      trim: true,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: [true, "price is required"],
      min: [0, "price must be >= 0"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Indexes for query optimization:
// - case-insensitive search on name (collation strength 2)
// - filter by category + sort by createdAt desc
productSchema.index({ name: 1 }, { collation: { locale: "en", strength: 2 } });
productSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);