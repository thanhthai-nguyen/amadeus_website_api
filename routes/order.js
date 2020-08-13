const express = require("express");
const router = express.Router();
const controller = require("../controllers/orderController");
const authenticate = require("../middlewares/authenticate");

router.get("/", controller.index);
// router.get("/get", authenticate, controller.getAllOrder);
router.post("/post", authenticate, controller.postNewOrder);
router.get("/get", authenticate, controller.getAllOrderUser);
router.get("/get-all", controller.getAllOrder);

module.exports = router;
