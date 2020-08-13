require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Token = require('./token');

const socialUserSchema = new mongoose.Schema({
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String,
        picurl: String,
        }
   
}, {timestamps: true});


socialUserSchema.methods.FBgenerateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate());

    let payload = {
        _id: this._id,
        id: this.facebook.id,
        email: this.facebook.email,
        name: this.facebook.name,
        token: this.facebook.token,
        picurl: this.facebook.picurl
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "43200m", //expires in 30d
    });
};

socialUserSchema.methods.FBgenerateJWTrefresh = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    let payload = {
        _id: this._id,
        id: this.facebook.id,
        email: this.facebook.email,
        name: this.facebook.name,
        token: this.facebook.token,
        picurl: this.facebook.picurl
    };

    return jwt.sign(payload, process.env.JWT_SECRET_REFRESH, {
        expiresIn: '43200m' //expires in 30d
    });
};



mongoose.set('useFindAndModify', false);
module.exports = mongoose.model('socialUser', socialUserSchema);