const bodyParser = require("body-parser");
const Order = require("../models/Order");
const dotenv = require("dotenv");
const crypto = require("crypto");
dotenv.config({ path: "./.env" });
module.exports.index = async (req, res) => {
  try {
    const existOrder = await Order.findById(req.body.orderId);
    if (!existOrder) res.status(400).json("Không thể tìm thấy đơn hàng");
    else {
      console.log(existOrder._id);
      console.log(existOrder.total);
      const partnerCode = `${process.env.PARTNER_CODE}`;
      const accessKey = `${process.env.ACCESS_KEY}`;
      const requestType = "captureMoMoWallet";
      const notifyUrl = "https://amadeuss.herokuapp.com/resolve";
      const returnUrl = "http://amadeushop.herokuapp.com/cam-on";
      const orderId = `${existOrder._id}`;
      const amount = `${existOrder.total}`;
      const orderInfo = "Thanh toán mua hàng trên Amadeus shop";
      const requestId = "MM1540456472575";
      const extraData = "email=abc@gmail.com";
      let signaturePre = `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&returnUrl=${returnUrl}&notifyUrl=${notifyUrl}&extraData=${extraData}`;

      //hash
      const secretKey = `${process.env.SECRET_KEY}`;
      const hmac = crypto.createHmac("sha256", secretKey);
      data = hmac.update(signaturePre);
      gen_hmac = data.digest("hex");
      //send https to momo
      const axios = require("axios").default;
      await axios
        .post("https://test-payment.momo.vn/gw_payment/transactionProcessor", {
          partnerCode: `${process.env.PARTNER_CODE}`,
          accessKey: `${process.env.ACCESS_KEY}`,
          requestType: requestType,
          notifyUrl: notifyUrl,
          returnUrl: returnUrl,
          orderId: orderId,
          amount: amount,
          orderInfo: orderInfo,
          requestId: requestId,
          extraData: extraData,
          signature: gen_hmac,
        })
        .then(function (resp) {
          if (resp.data.errorCode) {
            const errMessage = resp.data.localMessage;
            res.status(400).json({ message: errMessage });
          } else {
            const payUrl = resp.data.payUrl;
            res.json({ payUrl: payUrl });
          }
        })
        .catch(function (error) {
          console.log(error);
        });
      res.json("Sorry, something wrong here!");
    }
  } catch (error) {
    res.status(500).json("Something was worng");
  }
};

module.exports.resolve = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.body.orderId },
      { paid: true }
      // { new: true }
    );
    res.status(200).json("oke");
  } catch (error) {
    res.status(500).json("Something was worng");
  }
};
