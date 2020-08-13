require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Token = require('./token');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: 'Your email is required',
        trim: true,
        lowercase: true
    },

    username: {
        type: String,
        unique: true,
        required: 'Your username is required',
        trim: true,
        lowercase: true
    },

    password: {
        type: String,
        required: 'Your password is required',
        max: 100
    },
    
    profileImage: {
        type: String,
        required: false
    },

    isAdmin: {
        type: Boolean,
        default: false
    },
    
    resetPasswordToken: {
        type: String,
        required: false
    },

    resetPasswordExpires: {
        type: Date,
        required: false
    }
}, {timestamps: true});


adminSchema.pre('save',  function(next) {
    const user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

adminSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

adminSchema.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate());

    let payload = {
        id: this._id,
        email: this.email,
        username: this.username,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '43200m' //expires in 30d
    });
};

adminSchema.methods.generateJWTrefresh = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    let payload = {
        id: this._id,
        email: this.email,
        username: this.username,
    };

    return jwt.sign(payload, process.env.JWT_SECRET_REFRESH, {
        expiresIn: '43200m' //expires in 30d
    });
};
adminSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(64).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

adminSchema.methods.generateVerificationToken = function() {
    let payload = {
        userId: this._id,
        token: crypto.randomBytes(64).toString('hex')
    };

    return new Token(payload);
};


mongoose.set('useFindAndModify', false);
module.exports = mongoose.model('Admin', adminSchema);