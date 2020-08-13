const express = require('express');
const {check} = require('express-validator');
const Auth = require('../controllers/auth');
const validate = require('../middlewares/validate');
const Password = require('../controllers/password');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({message: "You are in the Auth Endpoint. Register or Login to test Authentication."});
});

router.post('/register', [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('username').not().isEmpty().withMessage('Your username is required'),
    check('password').not().isEmpty().isLength({min: 6}).withMessage('Must be at least 6 chars long'),
], validate, Auth.register);

router.post("/login", [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('password').not().isEmpty(),
], validate, Auth.login);


// //Admin
// router.post('/admin/register', [
//     check('email').isEmail().withMessage('Enter a valid email address'),
//     check('username').not().isEmpty().withMessage('Your username is required'),
//     check('password').not().isEmpty().isLength({min: 6}).withMessage('Must be at least 6 chars long'),
// ], validate, Auth.registerAdmin);

router.post("/admin/login", [
    check('username').not().isEmpty().withMessage('Enter a valid username'),
    check('password').not().isEmpty(),
], validate, Auth.loginAdmin);


//EMAIL Verification
router.get('/verify/:token', Auth.verify);
router.post('/resend', Auth.resendToken);

//Refresh Token
router.post('/refreshtoken', Auth.refreshToken);

//Password RESET
router.post('/recover', [
    check('email').isEmail().withMessage('Enter a valid email address'),
], validate, Password.recover);

router.get('/reset/:token', Password.reset);

router.post('/reset/:token', [
    check('password').not().isEmpty().isLength({min: 6}).withMessage('Must be at least 6 chars long'),
    check('confirmPassword', 'Passwords do not match').custom((value, {req}) => (value === req.body.password)),
], validate, Password.resetPassword);

//Logout
router.delete('/logout', Auth.logout);

module.exports = router;