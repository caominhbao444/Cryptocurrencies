require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./config/dbConn");
const corsOptions = require("./config/corsOptions");
const PORT = process.env.PORT || 5000;
//create app express
const app = express();
connectDB();

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(cookieParser());

//auth
app.use("/api/auth", require("./routes/authRoute"));

//coins
app.use("/api/coins", require("./routes/coinsRoute"));

//verify
app.use(require("./middleware/verifyJWT"));

//user
app.use("/api/user", require("./routes/userRoutes"));

//admin
app.use("/api/admin", require("./routes/adminRoute"));

app.use("*", (req, res) => {
  res.status(404).send({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

mongoose.connection
  .once("open", () => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .on("error", (err) => {
    console.log(err);
  });
