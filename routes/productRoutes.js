// routes/productRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const Product = require("../model/product");

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder where images are stored
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: "Server Error" });
    }
  });


// Add a product with image
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const newProduct = new Product({
      name: req.body.name,
      liter: req.body.liter,
      price: req.body.price,
      stocks: req.body.stocks,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "", // Save relative image path
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/products/update/:id
router.put("/update/:id", async (req, res) => {
    try {
      const updateFields = {};
  
      if (req.body.price) updateFields.price = req.body.price;
      if (req.body.stock) updateFields.stock = req.body.stock;
      if (req.body.liter) updateFields.liter = req.body.liter;
  
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true }
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.json(updatedProduct);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  

module.exports = router;
