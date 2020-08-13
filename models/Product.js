const mongoose = require("mongoose");
const ProductSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    nameURL: {
      type: String,
      require: true,
    },
    vote: {
      type: Number,
      default: 0,
    },
    img: {
      type: String,
      require: true,
    },
    imgHD: {
      type: String,
      require: true,
    },
    decription: {
      type: String,
      require: true,
    },
    conf: {
      //configuration
      type: String,
      require: true,
    },
    category: {
      type: Array,
      require: true,
    },
    producer: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    priceFake: {
      type: Number,
      require: true,
      default: 0,
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
    number: {
      type: Number,
      require: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate
ProductSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "productId",
  localField: "_id",
});

module.exports = mongoose.model("Product", ProductSchema);
