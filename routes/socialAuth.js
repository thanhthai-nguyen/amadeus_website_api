const express = require('express');
const {check} = require('express-validator');
const socialAuth = require('../controllers/socialAuth');
const validate = require('../middlewares/validate');


const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({message: "You are in the Auth Endpoint. Register or Login to test Authentication."});
});



// Facebook login
router.post('/fblogin', socialAuth.facebookLogin);


//Refresh token for facebook user
router.post('/fbrefreshtoken', socialAuth.facebookrefreshToken);

//Logout
//router.get('/fblogout', socialAuth.facebookLogout);



module.exports = router;