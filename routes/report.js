// const express = require('express');
// const router = express.Router();
// const Order = require('../model/Order'); // Import your Order model
// const User = require('../model/user'); // Import your User model
// const Product = require('../model/product'); // Import your Product model

// // Helper function to parse date range parameters
// const getDateRange = (req) => {
//   const { startDate, endDate } = req.query;
//   let start, end;
//   if (startDate) {
//     start = new Date(startDate);
//     start.setHours(0, 0, 0, 0);
//   } else {
//     // Default to 30 days ago
//     start = new Date();
//     start.setDate(start.getDate() - 30);
//     start.setHours(0, 0, 0, 0);
//   }
//   if (endDate) {
//     end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);
//   } else {
//     end = new Date();
//     end.setHours(23, 59, 59, 999);
//   }
//   return { start, end };
// };

// // Sales Report - Provides overall sales statistics
// router.get('/sales', async (req, res) => {
//   try {
//     const { start, end } = getDateRange(req);
    
//     // Get all orders within date range
//     const orders = await Order.find({
//       createdAt: { $gte: start, $lte: end }
//     });
    
//     // Calculate total revenue
//     const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
//     // Count total orders
//     const totalOrders = orders.length;
    
//     // Calculate average order value
//     const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
//     // Count payment methods
//     const paymentMethodStats = {};
//     orders.forEach(order => {
//       const method = order.paymentmethod || 'Unknown';
//       paymentMethodStats[method] = (paymentMethodStats[method] || 0) + 1;
//     });
    
//     // Group orders by date for daily sales chart
//     const dailySales = [];
//     const dateMap = {};
    
//     // Initialize dateMap with all dates in range
//     const dateIterator = new Date(start);
//     while (dateIterator <= end) {
//       const dateString = dateIterator.toISOString().split('T')[0];
//       dateMap[dateString] = {
//         date: dateString,
//         revenue: 0,
//         orders: 0
//       };
//       dateIterator.setDate(dateIterator.getDate() + 1);
//     }
    
//     // Fill in actual data
//     orders.forEach(order => {
//       const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
//       if (dateMap[orderDate]) {
//         dateMap[orderDate].revenue += order.totalAmount;
//         dateMap[orderDate].orders += 1;
//       }
//     });
    
//     // Convert map to array for the chart
//     Object.values(dateMap).forEach(day => {
//       dailySales.push(day);
//     });
    
//     // Sort by date
//     dailySales.sort((a, b) => new Date(a.date) - new Date(b.date));

//     // Calculate growth rates
//     let previousPeriodRevenue = 0;
//     let previousPeriodOrders = 0;
    
//     // If we have more than 30 days of data, calculate previous period stats
//     if (end.getTime() - start.getTime() > 30 * 24 * 60 * 60 * 1000) {
//       const previousPeriodStart = new Date(start);
//       previousPeriodStart.setDate(previousPeriodStart.getDate() - (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
      
//       const previousPeriodEnd = new Date(start);
//       previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
      
//       const previousPeriodOrders = await Order.find({
//         createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd }
//       });
      
//       previousPeriodRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
//       previousPeriodOrders = previousPeriodOrders.length;
//     }
    
//     const revenueGrowth = previousPeriodRevenue ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(2) : null;
//     const orderGrowth = previousPeriodOrders ? ((totalOrders - previousPeriodOrders) / previousPeriodOrders * 100).toFixed(2) : null;
    
//     res.json({
//       totalRevenue,
//       totalOrders,
//       averageOrderValue,
//       paymentMethodStats,
//       dailySales,
//       periodStart: start,
//       periodEnd: end,
//       revenueGrowth,
//       orderGrowth
//     });
//   } catch (error) {
//     console.error('Error generating sales report:', error);
//     res.status(500).json({ error: 'Failed to generate sales report' });
//   }
// });

// // Product Performance Report
// router.get('/products', async (req, res) => {
//   try {
//     const { start, end } = getDateRange(req);
//     const limit = parseInt(req.query.limit) || 10;
    
//     // Get orders within the date range
//     const orders = await Order.find({
//       createdAt: { $gte: start, $lte: end }
//     });
    
//     // Calculate product sales statistics
//     const productStats = {};
    
//     // Process each order
//     orders.forEach(order => {
//       // Ensure items is an array
//       const items = Array.isArray(order.items) ? order.items : [];
      
//       // Process each item in the order
//       items.forEach(item => {
//         const productId = item.productId ? item.productId.toString() : 'unknown';
//         if (!productStats[productId]) {
//           productStats[productId] = {
//             productId,
//             name: item.name || 'Unknown Product',
//             quantity: 0,
//             revenue: 0,
//             orders: new Set()
//           };
//         }
        
//         productStats[productId].quantity += item.quantity || 1;
//         productStats[productId].revenue += (item.price * (item.quantity || 1));
//         productStats[productId].orders.add(order._id.toString());
//       });
//     });
    
//     // Convert to array and calculate additional metrics
//     const productsArray = Object.values(productStats).map(product => ({
//       ...product,
//       orderCount: product.orders.size,
//       averageOrderValue: product.orders.size ? (product.revenue / product.orders.size) : 0,
//       orders: undefined  // Remove the Set from the response
//     }));
    
//     // Sort by revenue (descending)
//     productsArray.sort((a, b) => b.revenue - a.revenue);
    
//     // Get top products based on limit
//     const topProducts = productsArray.slice(0, limit);
    
//     // Get all product IDs to fetch additional details
//     const productIds = topProducts.map(product => product.productId).filter(id => id !== 'unknown');
    
//     // Fetch additional product details if needed
//     if (productIds.length > 0) {
//       const productDetails = await Product.find({ _id: { $in: productIds } });
      
//       // Map details to products
//       topProducts.forEach(product => {
//         const details = productDetails.find(p => p._id.toString() === product.productId);
//         if (details) {
//           product.category = details.category;
//           product.inStock = details.stock;
//           product.imageUrl = details.imageUrl;
//         }
//       });
//     }
    
//     res.json({
//       topProducts,
//       totalProducts: productsArray.length,
//       periodStart: start,
//       periodEnd: end
//     });
//   } catch (error) {
//     console.error('Error generating product report:', error);
//     res.status(500).json({ error: 'Failed to generate product report' });
//   }
// });

// // Customer Insights Report
// router.get('/auth/login', async (req, res) => {
//   try {
//     const { start, end } = getDateRange(req);
//     const limit = parseInt(req.query.limit) || 10;
    
//     // Get orders within the date range
//     const orders = await Order.find({
//       createdAt: { $gte: start, $lte: end }
//     }).populate('userId', 'name email createdAt');
    
//     // Calculate customer statistics
//     const customerStats = {};
    
//     // Process each order
//     orders.forEach(order => {
//       if (!order.userId) return;
      
//       const userId = order.userId._id.toString();
      
//       if (!customerStats[userId]) {
//         customerStats[userId] = {
//           userId,
//           name: order.userId.name || 'Anonymous',
//           email: order.userId.email || 'No Email',
//           firstPurchase: order.createdAt,
//           lastPurchase: order.createdAt,
//           totalSpent: 0,
//           orderCount: 0,
//           averageOrderValue: 0
//         };
//       }
      
//       // Update stats
//       customerStats[userId].totalSpent += order.totalAmount;
//       customerStats[userId].orderCount += 1;
//       customerStats[userId].averageOrderValue = customerStats[userId].totalSpent / customerStats[userId].orderCount;
      
//       // Update first and last purchase dates
//       if (order.createdAt < customerStats[userId].firstPurchase) {
//         customerStats[userId].firstPurchase = order.createdAt;
//       }
//       if (order.createdAt > customerStats[userId].lastPurchase) {
//         customerStats[userId].lastPurchase = order.createdAt;
//       }
//     });
    
//     // Convert to array
//     const customersArray = Object.values(customerStats);
    
//     // Calculate lifetime value
//     customersArray.forEach(customer => {
//       // Basic LTV calculation - can be refined based on business model
//       customer.lifetimeValue = customer.totalSpent;
      
//       // Add customer age in days
//       const customerAgeMs = new Date() - new Date(customer.firstPurchase);
//       customer.customerAgeDays = Math.floor(customerAgeMs / (1000 * 60 * 60 * 24));
      
//       // Add frequency (average days between orders)
//       if (customer.orderCount > 1) {
//         const daysBetweenFirstAndLast = (new Date(customer.lastPurchase) - new Date(customer.firstPurchase)) / (1000 * 60 * 60 * 24);
//         customer.purchaseFrequency = daysBetweenFirstAndLast / (customer.orderCount - 1);
//       } else {
//         customer.purchaseFrequency = null;
//       }
//     });
    
//     // Sort by total spent (descending)
//     customersArray.sort((a, b) => b.totalSpent - a.totalSpent);
    
//     // Get top customers based on limit
//     const topCustomers = customersArray.slice(0, limit);
    
//     // Calculate overall statistics
//     const totalCustomers = customersArray.length;
//     const newCustomers = customersArray.filter(c => new Date(c.firstPurchase) >= start).length;
//     const returningCustomers = totalCustomers - newCustomers;
//     const averageLTV = customersArray.reduce((sum, c) => sum + c.lifetimeValue, 0) / (totalCustomers || 1);
    
//     res.json({
//       topCustomers,
//       totalCustomers,
//       newCustomers,
//       returningCustomers,
//       averageLTV,
//       periodStart: start,
//       periodEnd: end
//     });
//   } catch (error) {
//     console.error('Error generating customer report:', error);
//     res.status(500).json({ error: 'Failed to generate customer report' });
//   }
// });

// // Cart Abandonment Report
// router.get('/cart-abandonment', async (req, res) => {
//   try {
//     const { start, end } = getDateRange(req);
    
//     // For this report, we'll need a Cart model or a way to track abandoned carts
//     // This is a simplified version assuming you have a Cart model with status
//     const Cart = require('../models/Cart'); // Import your Cart model
    
//     const allCarts = await Cart.find({
//       createdAt: { $gte: start, $lte: end }
//     });
    
//     const abandonedCarts = allCarts.filter(cart => cart.status === 'abandoned');
//     const completedCarts = allCarts.filter(cart => cart.status === 'completed');
    
//     const abandonmentRate = allCarts.length > 0 
//       ? (abandonedCarts.length / allCarts.length * 100).toFixed(2) 
//       : 0;
    
//     // Calculate average value of abandoned carts
//     const averageAbandonedValue = abandonedCarts.length > 0
//       ? abandonedCarts.reduce((sum, cart) => sum + cart.totalValue, 0) / abandonedCarts.length
//       : 0;
    
//     // Get abandoned products
//     const abandonedProducts = {};
//     abandonedCarts.forEach(cart => {
//       if (Array.isArray(cart.items)) {
//         cart.items.forEach(item => {
//           const productId = item.productId.toString();
//           if (!abandonedProducts[productId]) {
//             abandonedProducts[productId] = {
//               productId,
//               name: item.name || 'Unknown Product',
//               abandonmentCount: 0
//             };
//           }
//           abandonedProducts[productId].abandonmentCount += 1;
//         });
//       }
//     });
    
//     // Convert to array and sort
//     const abandonedProductsArray = Object.values(abandonedProducts)
//       .sort((a, b) => b.abandonmentCount - a.abandonmentCount);
    
//     res.json({
//       totalCarts: allCarts.length,
//       abandonedCarts: abandonedCarts.length,
//       completedCarts: completedCarts.length,
//       abandonmentRate,
//       averageAbandonedValue,
//       topAbandonedProducts: abandonedProductsArray.slice(0, 10),
//       periodStart: start,
//       periodEnd: end
//     });
//   } catch (error) {
//     console.error('Error generating cart abandonment report:', error);
//     res.status(500).json({ error: 'Failed to generate cart abandonment report' });
//   }
// });

// // Inventory Analysis Report
// router.get('/inventory', async (req, res) => {
//   try {
//     const { start, end } = getDateRange(req);
    
//     // Get all products
//     const products = await Product.find({});
    
//     // Get all orders in the period
//     const orders = await Order.find({
//       createdAt: { $gte: start, $lte: end }
//     });
    
//     // Calculate sales velocity for each product
//     const productStats = {};
    
//     // Initialize product stats
//     products.forEach(product => {
//       productStats[product._id.toString()] = {
//         productId: product._id.toString(),
//         name: product.name,
//         sku: product.sku,
//         currentStock: product.stock || 0,
//         category: product.category,
//         price: product.price,
//         salesQuantity: 0,
//         salesValue: 0,
//         daysOutOfStock: 0  // Would need historical inventory data for accurate calculation
//       };
//     });
    
//     // Calculate sales
//     orders.forEach(order => {
//       if (Array.isArray(order.items)) {
//         order.items.forEach(item => {
//           const productId = item.productId ? item.productId.toString() : null;
//           if (productId && productStats[productId]) {
//             productStats[productId].salesQuantity += item.quantity || 1;
//             productStats[productId].salesValue += (item.price * (item.quantity || 1));
//           }
//         });
//       }
//     });
    
//     // Calculate days in period
//     const daysInPeriod = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
//     // Add derived metrics
//     const productsArray = Object.values(productStats).map(product => {
//       // Calculate daily sales velocity
//       product.dailySalesVelocity = daysInPeriod > 0 ? product.salesQuantity / daysInPeriod : 0;
      
//       // Calculate days of inventory remaining based on velocity
//       product.daysOfInventoryLeft = product.dailySalesVelocity > 0 
//         ? Math.round(product.currentStock / product.dailySalesVelocity) 
//         : (product.currentStock > 0 ? 999 : 0); // If no sales, but has stock, set high value
      
//       // Flag low stock products (less than 30 days of inventory)
//       product.isLowStock = product.daysOfInventoryLeft < 30 && product.daysOfInventoryLeft > 0;
      
//       // Flag out of stock products
//       product.isOutOfStock = product.currentStock <= 0;
      
//       // Calculate inventory value
//       product.inventoryValue = product.currentStock * product.price;
      
//       return product;
//     });
    
//     // Sort by stock status, then by days of inventory left
//     productsArray.sort((a, b) => {
//       if (a.isOutOfStock && !b.isOutOfStock) return 1;
//       if (!a.isOutOfStock && b.isOutOfStock) return -1;
//       if (a.isLowStock && !b.isLowStock) return -1;
//       if (!a.isLowStock && b.isLowStock) return 1;
//       return a.daysOfInventoryLeft - b.daysOfInventoryLeft;
//     });
    
//     // Calculate aggregate statistics
//     const totalInventoryValue = productsArray.reduce((sum, p) => sum + p.inventoryValue, 0);
//     const outOfStockCount = productsArray.filter(p => p.isOutOfStock).length;
//     const lowStockCount = productsArray.filter(p => p.isLowStock).length;
    
//     res.json({
//       products: productsArray,
//       totalProducts: productsArray.length,
//       totalInventoryValue,
//       outOfStockCount,
//       lowStockCount,
//       outOfStockPercentage: (outOfStockCount / productsArray.length * 100).toFixed(2),
//       periodStart: start,
//       periodEnd: end
//     });
//   } catch (error) {
//     console.error('Error generating inventory report:', error);
//     res.status(500).json({ error: 'Failed to generate inventory report' });
//   }
// });

// // Dashboard Summary - Aggregate data for dashboard
// router.get('/dashboard', async (req, res) => {
//   try {
//     const { start, end } = getDateRange(req);
    
//     // Calculate period length in days
//     const daysInPeriod = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
//     // Get previous period dates
//     const previousStart = new Date(start);
//     previousStart.setDate(previousStart.getDate() - daysInPeriod);
//     const previousEnd = new Date(start);
//     previousEnd.setDate(previousEnd.getDate() - 1);
    
//     // Get orders for current period
//     const orders = await Order.find({
//       createdAt: { $gte: start, $lte: end }
//     }).populate('userId');
    
//     // Get orders for previous period
//     const previousOrders = await Order.find({
//       createdAt: { $gte: previousStart, $lte: previousEnd }
//     });
    
//     // Current period metrics
//     const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
//     const orderCount = orders.length;
//     const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;
    
//     // Unique customers count
//     const uniqueCustomers = new Set();
//     orders.forEach(order => {
//       if (order.userId && order.userId._id) {
//         uniqueCustomers.add(order.userId._id.toString());
//       }
//     });
//     const customerCount = uniqueCustomers.size;
    
//     // Previous period metrics
//     const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
//     const previousOrderCount = previousOrders.length;
    
//     // Growth calculations
//     const revenueGrowth = previousRevenue !== 0
//       ? ((revenue - previousRevenue) / previousRevenue * 100).toFixed(2)
//       : null;
//     const orderGrowth = previousOrderCount !== 0
//       ? ((orderCount - previousOrderCount) / previousOrderCount * 100).toFixed(2)
//       : null;
    
//     // Get inventory stats
//     const products = await Product.find({});
//     const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold).length;
//     const outOfStockCount = products.filter(p => p.stock <= 0).length;
    
//     // Get recent orders
//     const recentOrders = await Order.find({})
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .populate('userId', 'name email');
    
//     // Simplified recent order data
//     const recentOrdersData = recentOrders.map(order => ({
//       id: order._id,
//       customerName: order.userId ? order.userId.name : 'Guest',
//       amount: order.totalAmount,
//       date: order.createdAt,
//       status: order.status
//     }));
    
//     res.json({
//       metrics: {
//         revenue,
//         orderCount,
//         customerCount,
//         averageOrderValue,
//         revenueGrowth,
//         orderGrowth,
//         lowStockCount,
//         outOfStockCount
//       },
//       recentOrders: recentOrdersData,
//       periodStart: start,
//       periodEnd: end
//     });
//   } catch (error) {
//     console.error('Error generating dashboard summary:', error);
//     res.status(500).json({ error: 'Failed to generate dashboard summary' });
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const Order = require("../model/Order");
const Product = require("../model/product");

// GET /api/report
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    const products = await Product.find();

    // Total Revenue
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Total Products Sold
    let totalItemsSold = 0;
    orders.forEach(order => {
      order.items.forEach(item => {
        totalItemsSold += item.quantity;
      });
    });

    // Total Stock Remaining
    const totalStockRemaining = products.reduce((sum, p) => sum + p.stocks, 0);

    // Total Orders
    const totalOrders = orders.length;

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalRevenue,
      totalItemsSold,
      totalStockRemaining,
      totalOrders,
      statusCounts,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate report" });
  }
});

module.exports = router;
