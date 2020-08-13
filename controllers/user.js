const User = require('../models/user');
const sendEMail = require('../controllers/sendEmail');
const RefreshToken = require('../models/refreshtoken');


// @route GET admin/user
// @desc Returns all users
// @access Public
exports.index = async function (req, res) {
    const users = await User.find({});
    res.status(200).json({users});
};


// @route POST api/user
// @desc Add a new user
// @access Public
exports.store = async (req, res) => {
    try {
        const {email} = req.body;

        // Make sure this account doesn't already exist
        const user = await User.findOne({email});

        if (user) return res.status(401).json({message: 'The email address you have entered is already associated with another account. You can change this users role instead.'});

        const password = '_' + Math.random().toString(36).substr(2, 9); //generate a random password
        const newUser = new User({...req.body, password});

        const user_ = await newUser.save();

        //Generate and set password reset token
        user_.generatePasswordReset();

        // Save the updated user object
        await user_.save();

        //Get mail options
        let domain = "http://" + req.headers.host;
        let link = "http://" + req.headers.host + "/api/auth/reset/" + user.resetPasswordToken;
        let html = `<p>Hi ${user.username}<p><br><p>A new account has been created for you on ${domain}. Please click on the following <a href="${link}">link</a> to set your password and login.</p> 
                  <br><p>If you did not request this, please ignore this email.</p>`

        await new sendEMail(user, html).newAccountCreated();

        res.status(200).json({message: 'An email has been sent to ' + user.email + '.'});

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
};

// @route GET api/user/{id}
// @desc Returns a specific user
// @access Public
exports.show = async function (req, res) {
    try {
        const id = req.params.id;
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) return res.status(401).json({message: 'User does not exist'});

        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

// @route PUT api/user/{id}
// @desc Update user details
// @access Public
exports.update = async function (req, res) {
    try {
        const update = req.body;
        const id = req.params.id;
        const userId = req.user._id;

        
        //Make sure the passed id is that of the logged in user
        //if (userId.toString() !== id.toString()) return res.status(401).json({message: "Sorry, you don't have the permission to upd this data."});
        if (!req.isAuthenticated()) return res.status(401).json({message: "Sorry, you don't have the permission to update this data."});
        // if they aren't redirect them to the home page
       // res.redirect('/');

        const user = await User.findByIdAndUpdate(userId, {$set: update}, {new: true});

        //if there is no image, return success message
        if (!req.file) {
            console.log('User '+ user.email +' updated profile');
            return res.status(200).json({user, message: 'User has been updated'});
        }
        
        // There is image
        const user_ = await User.findByIdAndUpdate(userId, {$set: {profileImage: req.file.filename}}, {new: true});
        console.log('User '+ user_.email +' uploaded image');

        return res.status(200).json({user: user_, message: 'User has been updated'});

    } catch (error) {
        
        res.status(500).json({message: error.message});
    }
};


// @route DESTROY api/user/{id}
// @desc Delete User
// @access Public
exports.destroy = async function (req, res) {
    try {
        const id = req.params.id;
        const user_id = req.user._id;

        //Make sure the passed id is that of the logged in user
        //if (user_id.toString() !== id.toString()) return res.status(401).json({message: "Sorry, you don't have the permission to delete this data."});
        if (!req.isAuthenticated()) return res.status(401).json({message: "Sorry, you don't have the permission to delete this data."});

        await User.findByIdAndDelete(user_id);
        res.status(200).json({message: 'User has been deleted'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};



// @route POST api/user/changepassword
// @desc Change Password 
// @access Public
exports.changePassword = async  (req, res) => {
    try {
        const { password, newpassword } = req.body;
        const userId = req.user._id;
        
        //Make sure the passed id is that of the logged in user
        //if (userId.toString() !== id.toString()) return res.status(401).json({message: "Sorry, you don't have the permission to upd this data."});
        if (!req.isAuthenticated()) return res.status(401).json({message: "Sorry, you don't have the permission to update this data."});
        // if they aren't redirect them to the home page
       // res.redirect('/');

        const user = await User.findById(userId);

        //validate password
        if (!user.comparePassword(password)) return res.status(401).json({message: 'Invalid password'});

        //Set the new password
        user.password = newpassword;
        
        // Save the updated user object
        await user.save();

        await RefreshToken.deleteOne({userId: userId});

        return res.status(200).json({message: 'Password has been changed, please sign in again.'});
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};