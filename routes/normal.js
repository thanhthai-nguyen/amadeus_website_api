const express = require('express');
const {check} = require('express-validator');
const User = require('../controllers/user');
const uploadImage = require('../controllers/uploadImage');

const multer = require('multer');
const validate = require('../middlewares/validate');

const router = express.Router();


//UPDATE
router.put('/update', uploadImage.uploadFile);

//DISPLAY IMAGE
router.get('/image/:filename', uploadImage.displayImage);


module.exports = router;