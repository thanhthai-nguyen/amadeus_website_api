const express = require('express');
const {check} = require('express-validator');
const CartItem = require('../controllers/cartItem');

const multer = require('multer');
const validate = require('../middlewares/validate');

const router = express.Router();


//UPDATE Cart Items
router.put('/items', CartItem.cartItem);

//GET The Item BY ID
router.post('/itemshowone', CartItem.itemShowOne);

//GET Cart 
router.get('/itemshowall', CartItem.itemShowAll);

//DELETE an Item
router.delete('/destroyitem', CartItem.destroyItems);

//DELETE All Items in Cart
router.delete('/destroycart', CartItem.destroyAllItems);

module.exports = router;
