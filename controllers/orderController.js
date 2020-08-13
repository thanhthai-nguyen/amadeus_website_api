const Users = require("../models/user");
const Order = require("../models/Order");
const CartItem = require("../models/cartItem");
const Product = require("../models/Product");
const bodyParser = require("body-parser");

module.exports.index = async (req, res) => {
  res.send("OrderController");
};
module.exports.postNewOrder = async (req, res) => {
  //find cartItem
  const items = await CartItem.find({ userId: req.user._id }).populate({
    path: "productId",
    select: "price nameURL",
    model: Product,
  });
  const cart = items.map(x => {
    return {
      productId: x.productId._id,
      nameURL: x.productId.nameURL,
      quantity: x.count,
      price: x.productId.price,
    };
  });

  if (cart.length == 0) res.status(400).json({ message: "Cart is empty" });
  else {
    let totalPrice = 0;
    if (cart.length > 1) {
      totalPrice = cart.reduce((a, b) => {
        return a.price * a.quantity + b.price * b.quantity;
      });
    } else {
      if (cart.length == 1) {
        totalPrice = cart[0].quantity * cart[0].price;
      }
    }

    //create a order
    //console.log(cart);

    const order = new Order({
      userId: req.user._id,
      email: req.body.email,
      products: cart,
      total: totalPrice,
    });

    try {
      const saveOrder = await order.save();
      //delete all cart item
      const deleteCartItem = CartItem.deleteMany(
        { userId: req.user._id },
        err => {}
      );
      res
        .status(201)
        .json({ message: "create order success", orderId: saveOrder._id });
    } catch (err) {
      res.json({ message: err });
    }
  }
};

module.exports.getAllOrderUser = async (req, res) => {
  let items = await Order.find({ userId: req.user._id }).populate({
    path: "products.productId",
    select: "name price img nameURL",
  });
  let order = items.map(item => {
    year = item.createAt.getFullYear();
    month = item.createAt.getMonth() + 1;
    dt = item.createAt.getDate();

    if (dt < 10) {
      dt = "0" + dt;
    }
    if (month < 10) {
      month = "0" + month;
    }

    date = year + "-" + month + "-" + dt;
    return {
      paid: item.paid,
      _id: item._id,
      userId: item.userId,
      email: item.email,
      products: item.products,
      total: item.total,
      createAt: date,
    };
  });
  res.status(200).json(order);
};

module.exports.getAllOrder = async (req, res) => {
  const allOrder = await Order.find();
  res.status(200).json(allOrder);
};
