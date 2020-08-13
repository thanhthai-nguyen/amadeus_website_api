const mongoose = require("mongoose");
const ReviewSchema = mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  vote: {
    type: Number,
    require: true,
  },
  content: {
    type: String,
    require: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

ReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "userId",
    select: "username",
  });
  next();
});

module.exports = mongoose.model("Review", ReviewSchema);
