const Review = require("../models/Review");
const Users = require("../models/user");
const bodyParser = require("body-parser");
module.exports.index = async (req, res) => {
  res.send("ReviewController");
};
module.exports.post = async (req, res) => {
  const review = new Review({
    title: req.body.title,
    vote: req.body.vote,
    content: req.body.content,
    productId: req.body.productId,
    userId: req.user._id,
  });
  try {
    const saveReview = await review.save();
    res.json(saveReview);
  } catch (err) {
    res.json({ message: err });
  }
};
//lấy tất cả review của 1 sản phẩm
module.exports.get = async (req, res) => {
  const reviews = await Review.find({
    productId: req.params.ReviewId,
  })
    .populate({ path: "userId", select: "username", model: Users })
    .exec((err, review) => {
      if (err) console.log(err);
      res.status(200).json(review);
    });
};
