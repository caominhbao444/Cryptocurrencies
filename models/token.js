const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
    uquire: true,
  },
  token: {
    type: String,
    required: true,
  },
  id: {
    type: String
  },
  createAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  },
});

module.exports = Token = mongoose.model("token", tokenSchema);