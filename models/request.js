const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RequestSchema = new Schema(
  {
    userID: {
      type: String,
    },
    requestType: {
      type: String,
    },
    type: {
      type: String,
    },
    firstUnit: {
      type: String,
    },
    secondUnit: {
      type: String,
    },
    amount: {
      type: Number,
    },
    total: {
      type: Number,
    },
    senderAddress: {
      type: String,
    },
    recieverAddress: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
    },
    requestOf: {
      type: String,
    },
    requestBy: {
      type: String,
    },
    date: {
      type: Date,
    },
  },
  {
    expireAfterSeconds: 60 * 60 * 24 * 30,
  }
);

module.exports = Request = mongoose.model("Request", RequestSchema);
