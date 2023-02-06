const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CoinsSchema = new Schema({
  id: {
    type: String,
  },
  symbol: {
    type: String,
  },
  name: {
    type: String,
  },
  image: {
    type: String,
  },
});

module.exports = Coins = mongoose.model("Coins", CoinsSchema);
