const express = require("express");
const imageController = require("../controllers/image.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const commentRoutes = require("./comment.route");
const saveRoutes = require("./save.route");

const router = express.Router();

router.use(requireAuth);

router.get("/", imageController.getImages); 

router.get("/:id", imageController.getImageById); 
router.use("/:id/comments", commentRoutes); 
router.use("/:id", saveRoutes); 

router.post("/", imageController.createImage); 
router.delete("/:id", imageController.deleteImage); 

module.exports = router;
