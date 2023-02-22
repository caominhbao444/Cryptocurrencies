const config = require("../config/APIs");
const axios = require("axios");
const Coins = require("../models/coins");
const Transaction = require("../models/transaction");

const axiosOptions = {
  headers: {
    accept: "application/json",
    "Content-Type": "application/json; utf-8",
  },
};

//fetch coin info - 1
const getCoinInfo = async (vs_currency, ids) => {
  try {
    const res = await axios
      .get(config.COIN_INFO_URL(vs_currency, ids), axiosOptions)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        //console.log(err);
      });
    return res.data;
  } catch (err) {
    //console.log(err);
  }
};
const coinParser = async (req, res) => {
  if (!req.query.vs_currency || !req.query.ids) {
    return res.status(403).json({ error: "missing something" });
  }
  const CoinInfo = await getCoinInfo(req.query.vs_currency, req.query.ids);
  return res.status(200).json(CoinInfo);
};
//coin info - 2
//------------------------
const getCoinInfoDetails = async (ids) => {
  try {
    const res = await axios
      .get(config.COIN_INFO_DETAILS_URL(ids), axiosOptions)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        //console.log(err);
      });
    return res.data;
  } catch (err) {
    //console.log(err);
  }
};
const coinDetailsParse = async (req, res) => {
  if (!req.query.ids) {
    return res.status(403).json({ error: "missing something" });
  }
  const CoinInfoDetails = await getCoinInfoDetails(req.query.ids);
  return res.status(200).json(CoinInfoDetails);
};
//------------------------
//get Categories
const getCategories = async () => {
  try {
    const res = await axios
      .get(config.CATEGORIES_URL(), axiosOptions)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        //console.log(err);
      });
    return res.data;
  } catch (err) {
    //console.log(err);
  }
};

const categoriresParse = async (req, res) => {
  const CoinInfoDetails = await getCategories();
  return res.status(200).json(CoinInfoDetails);
};
//------------------------
//------------------------
const getderivativesInfo = async (perPage, page) => {
  try {
    const res = await axios
      .get(config.DERIVATIVES_URL(perPage, page), axiosOptions)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        //console.log(err);
      });
    return res.data;
  } catch (err) {
    //console.log(err);
  }
};
const derivativesParse = async (req, res) => {
  if (!req.query.perPage || !req.query.page) {
    return res.status(403).json({ error: "missing something" });
  }
  const derivativesInfo = await getderivativesInfo(
    req.query.perPage,
    req.query.page
  );
  return res.status(200).json(derivativesInfo);
};
//------------------------
const getExchangesInfo = async (perPage, page) => {
  try {
    const res = await axios
      .get(config.EXCHANGES_URL(perPage, page), axiosOptions)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        //console.log(err);
      });
    return res.data;
  } catch (err) {
    //console.log(err);
  }
};
const ExchangesParse = async (req, res) => {
  if (!req.query.perPage || !req.query.page) {
    return res.status(403).json({ error: "missing something" });
  }
  const derivativesInfo = await getExchangesInfo(
    req.query.perPage,
    req.query.page
  );
  return res.status(200).json(derivativesInfo);
};
//------------------------
//------------------------
const getCoinImage = async (req, res) => {
  const coin = await Coins.find({
    id: req.query.ids,
  });
  if (!coin) {
    return res.status(404).send({
      message: "Not Found",
    });
  }
  return res.status(200).send({
    coin,
  });
};

const getAllCoinImage = async (req, res) => {
  const page = req.query.page;
  //console.log(page);
  let skip = 0;
  if (parseInt(page) <= 1 || !page) {
    skip = 0;
  } else {
    skip = (parseInt(page) - 1) * 50;
  }
  const coins = await Coins.find({}).skip(skip).limit(50);
  return res.status(200).send({
    coins,
  });
};

const createCoinImage = async (req, res) => {
  const { id, symbol, name, image } = req.body;
  if (!name || !symbol || !id || !image) {
    return res.status(403).json({ error: "missing something" });
  }
  const coins = await Coins.find({}).sort({ createAt: -1 });
  if (coins.name == name || coins.symbol == symbol) {
    return res.status(400).json({ error: "Coins already exists" });
  } else {
    try {
      await Coins.create({
        id,
        symbol,
        name,
        image,
      });
      res.status(200).send({
        message: "Create coin success",
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }
};

//delete a coin
const deleteCoinImage = async (req, res) => {
  const coin = await Coins.findOne({
    id: req.body.ids,
  });
  if (!coin) {
    return res.status(404).send({
      message: "Not found",
    });
  }

  const existingCoin = await Coins.findOneAndDelete({ _id: id });

  if (!existingCoin) {
    return res.status(404).send({
      message: "Not found",
    });
  }
  res.status(200).send({
    message: "Delete coin success",
  });
};
//update a coin
const updateCoinImage = async (req, res) => {
  const coin = await Coins.findOne({
    id: req.body.ids,
  });
  if (!coin) {
    return res.status(404).send({
      message: "Not found",
    });
  }

  const existingCoin = await Coins.findOneAndUpdate(
    { id: req.body.ids },
    {
      symbol: req.body.symbol ? req.body.symbol : coin.symbol,
      name: req.body.name ? req.body.name : coin.name,
      image: req.body.image ? req.body.image : coin.image,
    }
  );

  if (!existingCoin) {
    return res.status(404).send({
      message: "Not found",
    });
  }

  res.status(200).send({
    message: "Update success",
    existingCoin,
  });
};

const searchCoinsImage = async (req, res) => {
  const wordEntered = req.query.wordEntered;
  //console.log(wordEntered);

  const cursor = await Coins.find({
    symbol: wordEntered,
  });

  if (!cursor) {
    return res.status(404).send({
      message: "Not found",
    });
  }
  //console.log(cursor);

  return res.status(200).send({
    cursor,
  });
};
//------------------------
//------------------------
// get all currency
const getAllCurrencies = async (req, res) => {
  const currency = await Currency.find({}).sort({ createAt: -1 });

  res.status(200).json(currency);
};

//get a currency
const getCurrency = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Not found" });
  }

  const currency = await Currency.findById(id);

  if (!currency) {
    return res.status(404).json({ error: "Not found" });
  }

  res.status(200).json(currency);
};

//create new currency
const createCurrency = async (req, res) => {
  const { name, symbol, category } = req.body;
  if (!name || !symbol || !category) {
    return res.status(403).json({ error: "missing something" });
  }
  const currency = await Currency.find({}).sort({ createAt: -1 });
  if (currency.name == name || currency.symbol == symbol) {
    return res.status(400).json({ error: "Currencies already exists" });
  } else {
    try {
      const currency = await Currency.create({
        name,
        symbol,
        category,
      });
      res.status(200).json(currency);
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }
};

//delete a currency
const deleteCurrency = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Not found" });
  }

  const currency = await Currency.findOneAndDelete({ _id: id });

  if (!currency) {
    return res.status(404).json({ error: "Not found" });
  }
  res.status(200).json(currency);
};
//update a currency
const updateCurrency = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Not found" });
  }

  const currency = await Currency.findOneAndUpdate(
    { _id: id },
    {
      ...req.body,
    }
  );

  if (!currency) {
    return res.status(404).json({ error: "Not found" });
  }

  res.status(200).json(currency);
};
//get currencies by category
const getByCategory = async (req, res) => {
  const { category } = req.params;

  if (!mongoose.Types.ObjectId.isValid(category)) {
    return res.status(404).json({ error: "Not found" });
  }
  const currency = await Currency.find({ category: category });

  if (!currency) {
    return res.status(404).json({ error: "Not found" });
  }

  res.status(200).json(currency);
};
//------------------------
//------------------------
//Exchange rates
// const getExchangRates = async (vs_currency, ids) => {
//   const res = await axios
//     .get(config.EXCHANGE_RATES(vs_currency, ids), axiosOptions)
//     .then((response) => {
//       return response;
//     })
//     .catch((err) => {
//       //console.log(err);
//     });

//   return res.data;
// };
// const exchangeRatesParser = async (req, res) => {
//   if ((!req.query.vs_currency, !req.query.ids)) {
//     return res.status(403).json({ error: "missing something" });
//   }
//   const exchangeRatesData = await getExchangRates(
//     req.query.vs_currency,
//     req.query.ids
//   );
//   return res.status(200).json(exchangeRatesData);
// };
//------------------------
//------------------------
//Coins history chart
const getHistoryChartInfo = async (coinID, days) => {
  const res = await axios
    .get(config.HISTORY_CHART(coinID, days), axiosOptions)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      //console.log(err);
    });

  return res.data;
};
const historyChartInfoParser = async (req, res) => {
  if ((!req.query.coinID, !req.query.days)) {
    return res.status(403).json({ error: "missing something" });
  }
  const historyChartInfo = await getHistoryChartInfo(
    req.query.coinID,
    req.query.days
  );
  return res.status(200).json(historyChartInfo);
};
//------------------------
//------------------------
//Markets
const getMarkets = async (vs_currency, category, order, perPage, page) => {
  const res = await axios
    .get(
      config.MARKET_URL(vs_currency, category, order, perPage, page),
      axiosOptions
    )
    .then((response) => {
      return response;
    })
    .catch((err) => {
      //console.log(err);
    });
  return res.data;
};
const getMarketsAll = async (vs_currency, order, perPage, page) => {
  const res = await axios
    .get(config.MARKET_URL_ALL(vs_currency, order, perPage, page), axiosOptions)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      //console.log(err);
    });
  return res.data;
};
const marketsParser = async (req, res) => {
  if (
    (!req.query.vs_currency,
    !req.query.page,
    !req.query.perPage,
    !req.query.order)
  ) {
    return res.status(403).json({ error: "missing something" });
  }
  if (
    req.query.category === "all" ||
    req.query.category === "" ||
    !req.query.category
  ) {
    let marketsData = await getMarketsAll(
      req.query.vs_currency,
      req.query.order,
      req.query.perPage,
      req.query.page
    );

    return res.status(200).json(marketsData);
  } else {
    let marketsData = await getMarkets(
      req.query.vs_currency,
      req.query.category,
      req.query.order,
      req.query.perPage,
      req.query.page
    );
    return res.status(200).json(marketsData);
  }
};
//------------------------
//------------------------
//Markets
const getTrendingCoins = async () => {
  try {
    const res = await axios
      .get(config.TRENDING_COIN_URL(), axiosOptions)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        //console.log(err);
      });
    return res.data;
  } catch (err) {
    //console.log(err);
  }
};
const TredingCoinsParser = async (req, res) => {
  const TredingCoinsData = await getTrendingCoins();
  return res.status(200).json(TredingCoinsData);
};

//Get all transactions
const getTransactions = async (req, res) => {
  try {
    const transaction = await Transaction.find({});

    return res.status(200).send({
      transaction,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  //coin info - 1
  coinParser,
  //coin info -2
  coinDetailsParse,
  //catefories
  categoriresParse,
  //exchanges transactions
  derivativesParse,
  ExchangesParse,
  //coin image
  getCoinImage,
  getAllCoinImage,
  createCoinImage,
  deleteCoinImage,
  updateCoinImage,
  searchCoinsImage,
  //currencies
  getAllCurrencies,
  getCurrency,
  createCurrency,
  deleteCurrency,
  updateCurrency,
  getByCategory,
  //Exchange rates
  // exchangeRatesParser,
  //Coins history chart
  historyChartInfoParser,
  //Markets
  marketsParser,
  //Trending coins
  TredingCoinsParser,
  //Transaction
  getTransactions,
};
