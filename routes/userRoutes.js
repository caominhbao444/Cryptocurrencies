const express = require("express");
const router = express.Router();

const {
  getUserInfo,
  editUserInfo,
  uploadAvatar,
  getWallet,
  request,
  requestInfo,
  p2pRequest,
  p2pRequestInfo,
  p2pClientRequest,
  p2pOnwerResonse,
  getPortfolio,
  getApprovedRequest,
} = require("../controllers/userController");

//get user info
router.get("/user-info/review", getUserInfo);

//update user
router.patch("/user-info/update", editUserInfo);

//upload avatar
router.post("/user-info/update", uploadAvatar);

//
router.get("/wallet/review", getWallet);

//
router.post("/request/create/:type", request);

//
router.get("/request/review/:type", requestInfo);

//
router.post("/request-p2p/create", p2pRequest);

//
router.get("/request-p2p/review/:type", p2pRequestInfo);

//
router.post("/request-p2p/create/client-request", p2pClientRequest);

//
router.patch("/request-p2p/update", p2pOnwerResonse);
//
router.get("/portfolio/review", getPortfolio);
//
router.get("/approved-request/review/:requestType", getApprovedRequest);

module.exports = router;
