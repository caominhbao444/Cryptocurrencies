const express = require("express");
const {
  allUsers,
  editUser,
  deleteUser,
  responseFunding,
  responseSpot,
} = require("../controllers/adminController");

const router = express.Router();

//get all users
router.get("/all-users/review", allUsers);

// edit user information
router.patch("/user-management/update", editUser);

//delete user
router.delete("/user-management/delete", deleteUser);

//response request funding
router.patch("/response/update/funding", responseFunding);

//response request recharge
router.patch("/response/update/spot", responseSpot);

module.exports = router;
