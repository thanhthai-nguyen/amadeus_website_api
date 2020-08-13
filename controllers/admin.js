const User = require('../models/user');
const Admin = require('../models/admin');

const sendEMail = require('./sendEmail');
const RefreshToken = require('../models/refreshtoken');


// @route GET admin/user
// @desc Returns all users
// @access Public
exports.index = async function (req, res) {
    const users = await User.find({});
    res.status(200).json({users});
};


