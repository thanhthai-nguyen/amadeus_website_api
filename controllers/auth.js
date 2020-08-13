require('dotenv').config();

const jwt = require('jsonwebtoken')
const User = require('../models/user');
const Admin = require('../models/admin');

const Token = require('../models/token');
const RefreshToken = require('../models/refreshtoken');


const sendEMail = require('./sendEmail');


// @route POST api/auth/register
// @desc Register user
// @access Public
exports.register = async (req, res) => {
    try {
        const { email } = req.body;

        // Make sure this account doesn't already exist
        const user = await User.findOne({ email });

        if (user) return res.status(401).json({message: 'The email address you have entered is already associated with another account.'});

        const newUser = new User({ ...req.body, role: "basic" });

        const user_ = await newUser.save();

        await sendVerificationEmail(user_, req, res);

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
};

// @route POST api/auth/login
// @desc Login user and return JWT token
// @access Public
exports.login = async  (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({msg: 'The email address ' + email + ' is not associated with any account. Double-check your email address and try again.'});

        //validate password
        if (!user.comparePassword(password)) return res.status(401).json({message: 'Invalid email or password'});

        // Make sure the user has been verified
        if (!user.isVerified) return res.status(401).json({ type: 'not-verified', message: 'Your account has not been verified.' });

        // Login successful, write token, and send back user
        const refreshToken = user.generateJWTrefresh();
        const checkToken = await RefreshToken.findOne({token: refreshToken});
        if (checkToken)return res.status(401).json({msg: 'The login process has encountered an error, please log in again'});

        const newRefreshToken = new RefreshToken({
            userId: user._id,
            token: refreshToken
        });

        await newRefreshToken.save();

        res.status(200).json({accessToken: user.generateJWT(), refreshToken: newRefreshToken.token, user: user});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

//@route POST api/auth/refreshtoken
//@desc Refresh Token
//@access Private
exports.refreshToken = async  (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        
        const refreshToken = req.body.token;

        if (refreshToken == null) return res.sendStatus(401).json({message: 'Error refreshToken null'});

        const checkToken = await RefreshToken.findOne({token: refreshToken});

        if (!checkToken) return res.sendStatus(403).json({message: 'The refreshToken has expired'});

        // verify and generate new access token
        jwt.verify(checkToken.token, process.env.JWT_SECRET_REFRESH, (err) => {
            if (err) return res.sendStatus(403).json({message: 'Authentication error. Please check out the refresh token'});
            res.json({ accessToken: user.generateJWT() });
          });
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

//@route DELETE api/auth/logout
//@desc Logout
//@access Publish
exports.logout = async  (req, res) => {
    try {
        await RefreshToken.deleteOne({token: req.body.token});
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

// ===EMAIL VERIFICATION
// @route GET api/auth/verify/:token
// @desc Verify token
// @access Public
exports.verify = async (req, res) => {
    if(!req.params.token) return res.status(400).json({message: "We were unable to find a user for this token."});

    try {
        // Find a matching token
        const token = await Token.findOne({ token: req.params.token });

        if (!token) return res.status(400).json({ message: 'We were unable to find a valid token. Your token my have expired.' });

        // If we found a token, find a matching user
        User.findOne({ _id: token.userId }, (err, user) => {
            if (!user) return res.status(400).json({ message: 'We were unable to find a user for this token.' });

            if (user.isVerified) return res.status(400).json({ message: 'This user has already been verified.' });

            // Verify and save the user
            user.isVerified = true;
            user.save(function (err) {
                if (err) return res.status(500).json({message:err.message});

                res.status(200).send("The account has been verified. Please log in.");
            });
        });
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

// @route POST api/auth/resend
// @desc Resend Verification Token
// @access Public
exports.resendToken = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'});

        if (user.isVerified) return res.status(400).json({ message: 'This account has already been verified. Please log in.'});

        await sendVerificationEmail(user, req, res);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

async function sendVerificationEmail(user, req, res){
    try{
        const token = user.generateVerificationToken();

        // Save the verification token
        await token.save();

        let link="http://"+req.headers.host+"/api/auth/verify/"+token.token;
        let html = `<p>Hi ${user.username}<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p> 
                  <br><p>If you did not request this, please ignore this email.</p>`;

        await new sendEMail(user, html).accountVerificationToken();

        res.status(200).json({message: 'A verification email has been sent to ' + user.email + '.'});
    }catch (error) {
        res.status(500).json({message: error.message})
    }
}


// @route POST api/auth/register
// @desc Register Admin
// @access Public
exports.registerAdmin = async (req, res) => {
    try {
        const { email } = req.body;

        // Make sure this account doesn't already exist
        const admin = await Admin.findOne({ email });

        if (admin) return res.status(401).json({message: 'The email address you have entered is already associated with another account.'});

        const newAdmin = new Admin({ ...req.body, role: "basic" });

        const admin_ = await newAdmin.save();

        admin_.isAdmin = true;
    
        await newAdmin.save();

        //await sendVerificationEmail(admin_, req, res);
        res.status(200).json({admin_});

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
};


// @route POST api/auth/login
// @desc Login Admin and return JWT token
// @access Public
exports.loginAdmin = async  (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({ username });

        if (!admin) return res.status(401).json({msg: 'The username ' + username + ' is not associated with any account.'});

        //validate password
        if (!admin.comparePassword(password)) return res.status(401).json({message: 'Invalid email or password'});

        // Make sure the user has been verified
        if (!admin.isAdmin) return res.status(401).json({ type: 'not-Admin', message: 'Your account has not been Admin.' });

        // Login successful, write token, and send back user
        const refreshToken = admin.generateJWTrefresh();
        const checkToken = await RefreshToken.findOne({token: refreshToken});
        if (checkToken)return res.status(401).json({msg: 'The login process has encountered an error, please log in again'});

        const newRefreshToken = new RefreshToken({
            userId: admin._id,
            token: refreshToken
        });

        await newRefreshToken.save();

        res.status(200).json({accessToken: admin.generateJWT(), refreshToken: newRefreshToken.token, admin: admin});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};


//@route POST api/auth/refreshtoken
//@desc Refresh Token
//@access Private
exports.refreshTokenAdmin = async  (req, res) => {
    try {
        const { email } = req.body;

        const admin = await Admin.findOne({ email });
        
        const refreshToken = req.body.token;

        if (refreshToken == null) return res.sendStatus(401).json({message: 'Error refreshToken null'});

        const checkToken = await RefreshToken.findOne({token: refreshToken});

        if (!checkToken) return res.sendStatus(403).json({message: 'The refreshToken has expired'});

        // verify and generate new access token
        jwt.verify(checkToken.token, process.env.JWT_SECRET_REFRESH, (err) => {
            if (err) return res.sendStatus(403).json({message: 'Authentication error. Please check out the refresh token'});
            res.json({ accessToken: admin.generateJWT() });
          });
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};