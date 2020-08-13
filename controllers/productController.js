const Product = require("../models/Product");
const bodyParser = require("body-parser");
const CartItem = require("../models/cartItem");
module.exports.index = async (req, res) => {
  try {
    if (!req.body.page) {
      const product = await Product.find();
      res.status(200).json(product);
    } else {
      console.log(req.body.page);

      const product = await Product.find()
        .limit(18)
        .skip((req.body.page - 1) * 18);
      res.status(200).json(product);
    }
  } catch (err) {
    res.json({ message: err });
  }
};
//========Chuyển dạng
const toSlug = str => {
  str = str.toLowerCase();
  str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, "a");
  str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, "e");
  str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, "i");
  str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, "o");
  str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, "u");
  str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, "y");
  str = str.replace(/(đ)/g, "d");
  // Xóa ký tự đặc biệt
  str = str.replace(/([^0-9a-z-\s])/g, "");
  // Xóa khoảng trắng thay bằng ký tự -
  str = str.replace(/(\s+)/g, "-");
  // xóa phần dự - ở đầu
  str = str.replace(/^-+/g, "");
  // xóa phần dư - ở cuối
  str = str.replace(/-+$/g, "");
  // return
  return str;
};
//===================
module.exports.post = async (req, res) => {
  const nameURL = toSlug(req.body.name);
  const product = new Product({
    name: req.body.name,
    nameURL: nameURL,
    img: req.body.img,
    imgHD: req.body.imgHD,
    decription: req.body.decription,
    conf: req.body.conf,
    category: req.body.category,
    producer: req.body.producer,
    price: req.body.price,
    priceFake: req.body.priceFake,
    number: req.body.number,
  });
  try {
    const saveProduct = await product.save();
    res.json(saveProduct);
  } catch (err) {
    res.json({ message: err });
  }
};
module.exports.delete = async (req, res) => {
  try {
    const removeAllCart = await CartItem.deleteMany({
      productId: req.params.prodID,
    });
    const removeProduct = await Product.remove({ _id: req.params.prodID });
    // res.json(removeProduct);
  } catch (err) {
    res.json({ message: err });
  }
};

module.exports.update = async (req, res) => {
  try {
    const updateProduct = await Product.findOneAndUpdate(
      { _id: req.params.prodID },
      req.body,
      { new: true }
    );
    console.log(updateProduct.priceFake);

    res.json(updateProduct);
  } catch (err) {
    res.json({ message: err });
  }
};

module.exports.getOne = async (req, res) => {
  try {
    let product = await Product.findOne({
      nameURL: req.params.prodID,
    }).populate("reviews");
    if (!product) {
      res.status(404).json({ message: "Not found" });
    } else {
      const reviews = product.reviews;
      let vote = reviews.reduce((a, b) => {
        return a + b.vote;
      }, 0);
      vote = vote / reviews.length;
      vote = Math.round(vote * 100) / 100;
      let productRes = product;
      productRes.vote = vote;
      res.json(productRes);
    }
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

module.exports.search = async (req, res) => {
  const keySearch2 = toSlug(req.body.keySearch);
  const products = await Product.find({
    nameURL: { $regex: keySearch2 },
  });
  res.send(products);
};
