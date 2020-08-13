require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Token = require("./token");

const UserSchema = new mongoose.Schema({
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
    },

    password: {
        type: String,
        required: 'Your password is required',
        max: 100
    },

    nickname: {
        type: String,
        required: false,
        max: 255
    },

    numphone: {
        type: Number,
        required: false,
        max: 255
    },

    sex: {
        type: String,
        required: false,
        max: 255
    },
    
    datebirth: {
        type: String,
        required: false,
        max: 255
    },

    address: {
        type: String,
        required: false,
        max: 255
    },

    profileImage: {
        type: String,
        required: false
    },

    isVerified: {
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

UserSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateJWT = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate());

  let payload = {
    id: this._id,
    email: this.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "43200m", //expires in 30d
  });
};

UserSchema.methods.generateJWTrefresh = function () {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  let payload = {
    id: this._id,
    email: this.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET_REFRESH, {
    expiresIn: "43200m", //expires in 30d
  });
};
UserSchema.methods.generatePasswordReset = function () {
  this.resetPasswordToken = crypto.randomBytes(64).toString("hex");
  this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

UserSchema.methods.generateVerificationToken = function () {
  let payload = {
    userId: this._id,
    token: crypto.randomBytes(64).toString("hex"),
  };

  return new Token(payload);
};

mongoose.set("useFindAndModify", false);
module.exports = mongoose.model("User", UserSchema); //ĐỪNG CÓ SỬA CÁI NÀY NỮA, T SỬA 3 LẦN RỒI
