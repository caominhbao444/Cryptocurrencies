require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOURI, { useNewUrlParser: true });
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
