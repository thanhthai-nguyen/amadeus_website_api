const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const controller = require("../controllers/reviewController");
const authenticate = require("../middlewares/authenticate");

router.get("/", authenticate, controller.index);
router.post("/post", authenticate, controller.post);
router.get("/:ReviewId", controller.get);

module.exports = router;
