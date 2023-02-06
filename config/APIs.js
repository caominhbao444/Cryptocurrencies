const MARKET_URL = (vs_currency, category, order, perPage, page) =>
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&category=${category}&order=${order}&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=1h%2C24h%2C7d`;

const MARKET_URL_ALL = (vs_currency, order, perPage, page) =>
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&order=${order}&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=1h%2C24h%2C7d`;

const TRENDING_COIN_URL = () =>
  `https://api.coingecko.com/api/v3/search/trending`;

const COIN_INFO_URL = (vs_currency, ids) =>
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&ids=${ids}&order=market_cap_desc&sparkline=false`;

const COIN_INFO_DETAILS_URL = (ids) =>
  `https://api.coingecko.com/api/v3/coins/${ids}?sparkline=true`;

const CATEGORIES_URL = () =>
  `https://api.coingecko.com/api/v3/coins/categories`;

const EXCHANGE_RATES = (vs_currency, ids) =>
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
// `https://currency-exchange.p.rapidapi.com/exchange`

const HISTORY_CHART = (coinID, days) =>
  `https://api.coingecko.com/api/v3/coins/${coinID}/market_chart?vs_currency=usd&days=${days}`;

const DERIVATIVES_URL = (perPage, page) =>
  `https://api.coingecko.com/api/v3/derivatives/exchanges?per_page=${perPage}&page=${page}`;

const EXCHANGES_URL = (perPage, page) =>
  `https://api.coingecko.com/api/v3/exchanges?per_page=${perPage}&page=${page}`;

const NFT_LIST_URL = (perPage, page) =>
  `https://api.coingecko.com/api/v3/nfts/list?per_page=${perPage}&page=${page}`;

const NFT_INFO_URL = (id) => `https://api.coingecko.com/api/v3/nfts/${id}`;

module.exports = {
  MARKET_URL_ALL,
  MARKET_URL,
  TRENDING_COIN_URL,
  COIN_INFO_URL,
  COIN_INFO_DETAILS_URL,
  CATEGORIES_URL,
  EXCHANGE_RATES,
  HISTORY_CHART,
  DERIVATIVES_URL,
  EXCHANGES_URL,
  NFT_LIST_URL,
  NFT_INFO_URL,
};
