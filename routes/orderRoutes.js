// const express = require("express");
// const router = express.Router();
// const Order = require("../model/Order"); // Your Order model

// router.post("/", async (req, res) => {
//   try {
//     const newOrder = new Order(req.body);
//     await newOrder.save();
//     res.status(201).json({ message: "Order saved" });
//   } catch (err) {
//     res.status(500).json({ message: "Error saving order", error: err.message });
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const Order = require("../model/Order");
const sendEmail = require("../utils/sendEmail");


// Create a new order
// router.post("/", async (req, res) => {
//   try {
//     const {
//       orderid,
//       name,
//       email,
//       contactno,
//       address,
//       city,
//       pincode,
//       status,
//       paymentmethod,
//       totalAmount,
//       items,
//     } = req.body;

//     const newOrder = new Order({
//       orderid,
//       name,
//       email,
//       contactno,
//       address,
//       city,
//       pincode,
//       status: status || "pending",
//       paymentmethod,
//       totalAmount,
//       items,
//     });

//     await newOrder.save();
//     // res.status(201).json({ message: "Order saved" });
//     res.json({ message: "Order saved", orderId: savedOrder._id });

//   } catch (err) {
//     res.status(500).json({ message: "Error saving order", error: err.message });
//   }
// });

router.post("/", async (req, res) => {
  try {
    const {
      orderid,
      name,
      email,
      contactno,
      address,
      city,
      pincode,
      status,
      paymentmethod,
      totalAmount,
      items,
    } = req.body;

    const newOrder = new Order({
      orderid,
      name,
      email,
      contactno,
      address,
      city,
      pincode,
      status: status || "pending",
      paymentmethod,
      totalAmount,
      items,
    });

    const savedOrder = await newOrder.save();

    // Generate HTML for ordered items
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px 12px;">${item.name}</td>
          <td style="padding: 8px 12px; text-align:center;">${item.quantity}</td>
          <td style="padding: 8px 12px; text-align:right;">$${item.price.toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    const emailContent = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Thank you for your order!</h2>
        <p><strong>Order ID:</strong> ${savedOrder._id}</p>
        <p><strong>Status:</strong> ${savedOrder.status}</p>
        <p><strong>Total Amount:</strong> ₹${savedOrder.totalAmount.toFixed(2)}</p>

        <h3 style="margin-top: 20px;">Order Details:</h3>
        <table border="1" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
          <thead style="background-color: #f2f2f2;">
            <tr>
              <th style="padding: 8px 12px; text-align:left;">Item</th>
              <th style="padding: 8px 12px; text-align:center;">Quantity</th>
              <th style="padding: 8px 12px; text-align:right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <p style="margin-top: 30px;">We appreciate your business! If you have any questions, feel free to reply to this email.</p>
      </div>
    `;

    // Send confirmation email
    await sendEmail(email, `Order Confirmation - ${savedOrder._id}`, emailContent);

    res.json({ message: "Order saved", orderId: savedOrder._id });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ message: "Error saving order", error: err.message });
  }
});




// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});
router.post("/user", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const orders = await Order.find({ email }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
});

// Update order status
router.put("/:id", async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating status", error: err.message });
  }
});

// Delete order
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting order", error: err.message });
  }
});



module.exports = router;

