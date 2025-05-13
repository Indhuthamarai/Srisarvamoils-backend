const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const cors = require("cors");
const path = require("path");


require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve images

const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

const reportRoute = require("./routes/report");
app.use("/api/report", reportRoute);

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);
// const  analyticsRouter=require("./routes/reportroutes");
// app.use('/api/analytics', analyticsRouter);

app.get("/", (req, res) => {
  res.send("API is running ✅");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));