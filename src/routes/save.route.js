const express = require("express");
const saveController = require("../controllers/save.controller");

const router = express.Router({ mergeParams: true });

router.get("/saved", saveController.checkSaved); 
router.post("/save", saveController.toggleSave); 

module.exports = router;
