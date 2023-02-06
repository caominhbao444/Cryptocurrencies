const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
  userID: {
    type: String,
  },
  currencyID: {
    type: String,
  },
  amount: {
    type: Number,
  },
  type: {
    type: String,
  },
});

module.exports = Wallet = mongoose.model("Wallet", WalletSchema);
