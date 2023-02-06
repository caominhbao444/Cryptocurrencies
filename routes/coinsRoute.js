const express = require("express");
const router = express.Router();

const {
  coinParser,
  coinDetailsParse,
  categoriresParse,
  derivativesParse,
  ExchangesParse,
  getCoinImage,
  getAllCoinImage,
  createCoinImage,
  deleteCoinImage,
  updateCoinImage,
  searchCoinsImage,
  getAllCurrencies,
  getCurrency,
  createCurrency,
  deleteCurrency,
  updateCurrency,
  getByCategory,
  // exchangeRatesParser,
  historyChartInfoParser,
  marketsParser,
  TredingCoinsParser,
  getTransactions,
} = require("../controllers/coinsController");
//------------------------
//------------------------
//Coins info
router.get("/", coinParser);

router.get("/details/review", coinDetailsParse);
//------------------------
//------------------------
//Coins by categories
router.get("/categories/review", categoriresParse);
//------------------------
//------------------------
//Exchange
router.get("/derivatives/review", derivativesParse);

router.get("/exchanges/review", ExchangesParse);
//------------------------
//------------------------
//Coins image
router.get("/coin-image/review", getCoinImage);

router.get("/all-coins-image/review", getAllCoinImage);

router.post("/coin-image/create", createCoinImage);

router.delete("/coin-image/delete", deleteCoinImage);

router.patch("/coin-image/update", updateCoinImage);

router.get("/search-coin-image/review", searchCoinsImage);
//------------------------
//------------------------
//Currencies
router.get("/currencies/review", getAllCurrencies);

router.get("/currencies/review/:id", getCurrency);

router.post("/currencies/create", createCurrency);

router.delete("/currencies/delete/:id", deleteCurrency);

router.patch("/currencies/update/:id", updateCurrency);

router.get("/currencies/review/:category", getByCategory);
//------------------------
//------------------------
//Exchange rates
// router.post("/exchange-rates", exchangeRatesParser);
//------------------------
//------------------------
//Coins history chart
router.get("/history-chart/review", historyChartInfoParser);
//------------------------
//------------------------
//Markets
router.get("/markets/review", marketsParser);
//------------------------
//------------------------
//Trending coins
router.get("/trending-coins/review", TredingCoinsParser);
//------------------------
//------------------------
//transactions coin
router.get("/transactions/review", getTransactions);

module.exports = router;
