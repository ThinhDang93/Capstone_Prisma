const express = require("express");
const userController = require("../controllers/user.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireAuth); 

router.get("/me", userController.getMe); 
router.put("/me", userController.updateMe); 
router.get("/me/saved-images", userController.getSavedImages); 
router.get("/me/created-images", userController.getCreatedImages); 

module.exports = router;
