const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  liter: String, // Assuming 'liter' is a string. If you prefer, you can use Number.
  price: Number,
  stocks: Number,  // Assuming stock is a number.
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);


