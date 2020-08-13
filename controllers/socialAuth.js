require('dotenv').config();

const jwt = require('jsonwebtoken')
const User = require('../models/socialUser');
const RefreshToken = require('../models/refreshtoken');



// @route POST api/social/fblogin
// @desc Login user and return JWT token
// @access Public
exports.facebookLogin = async  (req, res) => {
    try {
        const _id = req.body.id
            
        const user = await User.findById(_id);

        if (!user) return res.status(401).json({message: 'User does not exist'});

        // Login successful, write token, and send back user
        const refreshToken = user.FBgenerateJWTrefresh();
        const checkToken = await RefreshToken.findOne({token: refreshToken});
        if (checkToken)return res.status(401).json({msg: 'The login process has encountered an error, please log in again'});

        const newRefreshToken = new RefreshToken({
            userId: user._id,
            token: refreshToken
        });

        await newRefreshToken.save();

        res.status(200).json({accessToken: user.FBgenerateJWT(), refreshToken: newRefreshToken.token, user});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

//@route POST api/auth/refreshtoken
//@desc Refresh Token
//@access Private
exports.facebookrefreshToken = async  (req, res) => {
    try {
        const _id = req.user._id

        const user = await User.findById(_id);
        
        const refreshToken = req.body.token;

        if (refreshToken == null) return res.sendStatus(401).json({message: 'Error refreshToken null'});

        const checkToken = await RefreshToken.findOne({token: refreshToken});

        if (!checkToken) return res.sendStatus(403).json({message: 'The refreshToken has expired'});

        // verify and generate new access token
        jwt.verify(checkToken.token, process.env.JWT_SECRET_REFRESH, (err) => {
            if (err) return res.sendStatus(403).json({message: 'Authentication error. Please check out the refresh token'});
            res.json({ accessToken: user.FBgenerateJWT() });
          });
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

//@route GET api/auth/logout
//@desc Logout
//@access Publish
exports.facebookLogout = async  (req, res) => {
    try {
        // logout request handler, passport attaches a logout() function to the req object,
// and we call this to logout the user, same as destroying the data in the session.
        req.logout();
        res.json({message: 'logout success!'});
       
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

