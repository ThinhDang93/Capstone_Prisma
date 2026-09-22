const express = require("express");
const authRoutes = require("./auth.route");
const imageRoutes = require("./image.route");
const userRoutes = require("./user.route");

const router = express.Router();

router.use("/auth", authRoutes); 
router.use("/images", imageRoutes); 
router.use("/users", userRoutes); 

module.exports = router;
