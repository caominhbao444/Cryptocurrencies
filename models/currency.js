const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CurrencySchema = new Schema({
    name: {
        type: String,
        require: true
    },
    symbol: {
        type: String,
        require: true
    },
    category: {
        type: String,
        require: true
    }
});

module.exports = Currency = mongoose.model('Currency', CurrencySchema);