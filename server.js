const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./utils/db");
dotenv.config({ path: "./.env" });

// 0) HANDLE UNCAUGHT EXCEPTION

// 1) CONNECT DATABASE
connectDB();
// 2) SETTING PORT AND LISTEN SEVER
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(
        `Server is running on port ${PORT} with environment ${process.env.NODE_ENV}`
    );
});

// 3) HANDLE UNHANDLED REJECTION!
