const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderid:String,
  name: String,
  email: String,
  contactno: String,
  address: String,
  city: String,
  pincode: String,
  status: { type: String, default: "pending" },
  paymentmethod:{ type: String, default: "Cash on delivery" },
  totalAmount: Number, // ✅ Add total amount field
  items: Array,         // Can be more detailed if needed
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
