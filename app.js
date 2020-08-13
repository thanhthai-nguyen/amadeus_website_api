const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const productRouter = require("./routes/product");
const reviewRoute = require("./routes/review");
const orderRoute = require("./routes/order");
const paymentRoute = require("./routes/payment");
const bodyParser = require("body-parser");
const cros = require("cors");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require('cookie-parser');

dotenv.config({ path: "./.env" });

const app = express();
app.use(bodyParser.json());
app.use(cros());
// 1) GLOBAL MIDDLEWARES

//Serving static files
app.use(express.static(path.join(__dirname, "public")));

// 2) ROUTES
app.get("/", (req, res) => {
  return res.send("Welcome to Amadeus v5!");
});
app.use("/products", productRouter);
app.use("/reviews", reviewRoute);
app.use("/order", orderRoute);
app.use("/payment", paymentRoute);
//=== 1 - CREATE APP
// Creating express app and configuring middleware needed for authentication
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cookieParser()); //Parse cookie

//=== 3 - INITIALIZE PASSPORT MIDDLEWARE
app.use(passport.initialize());
require("./middlewares/jwt")(passport);
require('./config/passport')(passport);

//=== 4 - CONFIGURE ROUTES
//Configure Route
require("./routes/index")(app);

module.exports = app;
