const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const controller = require("../controllers/productController");

router.get("/", controller.index);
router.post("/", controller.post);
router.post("/search", controller.search);
router.delete("/:prodID", controller.delete);
router.patch("/:prodID", controller.update);
router.get("/:prodID", controller.getOne);

module.exports = router;
