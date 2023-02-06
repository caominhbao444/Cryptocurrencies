const express = require("express");
const {
  signup,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPasswordRequest,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

//signup
router.post("/signup", signup);

//verify
router.get("/verify/:userID/:token", verifyEmail);

//login
router.post("/login", login);

//logout
router.post("/logout", logout);

//forgot password
router.post("/forgot-password", forgotPassword);

//reset password request
router.get("/reset-password/:email", resetPasswordRequest);

//reset password
router.patch("/reset-password/:email", resetPassword);

module.exports = router;
