const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
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
  },
  requestOf: {
    type: String,
  },
  date: {
    type: Date,
  },
});

module.exports = Transaction = mongoose.model(
  "Transaction",
  TransactionSchema
);
