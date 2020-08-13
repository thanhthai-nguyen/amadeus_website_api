const User = require("../models/user");
const CartItem = require("../models/cartItem");
const Product = require("../models/Product");

const sendEMail = require("../controllers/sendEmail");
const { ObjectId } = require("mongodb");

// @route PUT api/user/{id}
// @desc Update event details
// @access Public
exports.cartItem = async function (req, res) {
  try {
    const itemsId = req.body.productId;
    const count = req.body.count;
    const userId = req.user._id;

    //Make sure the passed id is that of the logged in user
    //if (userId.toString() !== id.toString()) return res.status(401).json({message: "Sorry, you don't have the permission to upd this data."});
    if (!req.isAuthenticated())
      return res
        .status(401)
        .json({
          message: "Sorry, you don't have the permission to update this data.",
        });
    // if they aren't redirect them to the home page
    // res.redirect('/');

    // Make sure Item does already exist
    const items = await Product.findById({ _id: ObjectId(itemsId) });

    if (!items)
      return res
        .status(401)
        .json({ message: "The Item does not already exist" });

    // Check the Item does already exist in Cart
    const _items = await CartItem.findOne({ productId: ObjectId(itemsId), userId: userId });

    if (!_items) {
      const newCart = new CartItem({
        userId: userId,
        productId: itemsId,
        count: count,
      });

      await newCart.save();

      const _newcart = await CartItem.findOne({
        productId: ObjectId(itemsId), userId: userId
      }).populate({
        path: "productId",
        select: "name img price",
        model: Product,
      });

      return res
        .status(200)
        .json({ _newcart, message: "The item has been added to cart" });
    }

    _items.count = _items.count + count;
    if (_items.count < 0) {
      return res.status(500).json({ message: "Invalid count value" });
    }
    if (_items.count == 0) {
      const removeItems = await CartItem.deleteOne({
        productId: ObjectId(itemsId), userId: userId
      });
      return res.status(200).json({ message: "The item has been deleted" });
    }

    await _items.save();

    const newcart_ = await CartItem.findOne({
      productId: ObjectId(itemsId), userId: userId
    }).populate({
      path: "productId",
      select: "name img price",
      model: Product,
    });

    return res
      .status(200)
      .json({ newcart_, message: "The item has been added to cart" });
  } catch (error) {
    res.
    status(500).json({ message: error.message });
  }
};

// @route POST api/user/{id}
// @desc GET the Item details of user
// @access Public
exports.itemShowOne = async function (req, res) {
  try {
    const userId = req.user._id;
    const itemsId = req.body.id;

    //Make sure the passed id is that of the logged in user
    //if (userId.toString() !== id.toString()) return res.status(401).json({message: "Sorry, you don't have the permission to upd this data."});
    if (!req.isAuthenticated())
      return res
        .status(401)
        .json({
          message: "Sorry, you don't have the permission to update this data.",
        });
    // if they aren't redirect them to the home page
    // res.redirect('/');

    const items = await CartItem.findById({ _id: ObjectId(itemsId) }).populate({
      path: "productId",
      select: "name img price",
      model: Product,
    });

    if (!items)
      return res.status(401).json({ message: "There are no items to display" });

    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET api/user/{id}
// @desc GET all Items in Cart
// @access Public
exports.itemShowAll = async function (req, res) {
  try {
    const userId = req.user._id;

    //Make sure the passed id is that of the logged in user
    //if (userId.toString() !== id.toString()) return res.status(401).json({message: "Sorry, you don't have the permission to upd this data."});
    if (!req.isAuthenticated())
      return res
        .status(401)
        .json({
          message: "Sorry, you don't have the permission to update this data.",
        });
    // if they aren't redirect them to the home page
    // res.redirect('/');

    const items = await CartItem.find({ userId: userId }).populate({
      path: "productId",
      select: "name nameURL img price",
      model: Product,
    });

    if (!items)
      return res.status(401).json({ message: "There are no items to display" });

    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE api/user/{id}
// @desc Delete The Item
// @access Public
exports.destroyItems = async function (req, res) {
  try {
    const itemsId = req.body.id;

    //Make sure the passed id is that of the logged in user
    //if (user_id.toString() !== id.toString()) return res.status(401).json({message: "Sorry, you don't have the permission to delete this data."});
    if (!req.isAuthenticated())
      return res
        .status(401)
        .json({
          message: "Sorry, you don't have the permission to delete this data.",
        });

    await CartItem.findByIdAndDelete({ _id: ObjectId(itemsId) });
    
    res.status(200).json({ message: "The item has been deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE api/user/{id}
// @desc Delete All Items in Cart
// @access Public
exports.destroyAllItems = async function (req, res) {
  try {
    const userId = req.user._id;

    //Make sure the passed id is that of the logged in user
    //if (user_id.toString() !== id.toString()) return res.status(401).json({message: "Sorry, you don't have the permission to delete this data."});
    if (!req.isAuthenticated())
      return res
        .status(401)
        .json({
          message: "Sorry, you don't have the permission to delete this data.",
        });

    await CartItem.deleteMany({ userId: userId });
    res.status(200).json({ message: "All the items in cart had been deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
