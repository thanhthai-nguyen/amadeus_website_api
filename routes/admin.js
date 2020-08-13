const express = require('express');
const {check} = require('express-validator');
const Admin = require('../controllers/admin');
const uploadImage = require('../controllers/uploadImage');

const multer = require('multer');
const validate = require('../middlewares/validate');

const router = express.Router();


//INDEX
router.get('/showalluser', Admin.index);


module.exports = router;