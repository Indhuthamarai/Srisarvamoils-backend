// const express = require("express");
// const router = express.Router();
// const { signup, login } = require("../controllers/authController");
// const authMiddleware = require("../middleware/authMiddleware");
// router.post("/signup", signup);
// router.post("/login", login);
// // router.get("/login", authMiddleware, (req, res) => {
// //     res.status(200).json({ message: "Protected route accessed", userId: req.user.id });
// //   });
// router.get("/me", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password -__v");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.status(200).json({ user });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch user data" });
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../model/user"); // Added missing import

router.post("/signup", signup);
router.post("/login", login);

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});

module.exports = router;