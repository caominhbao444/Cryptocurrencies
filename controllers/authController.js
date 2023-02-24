require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");

const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const Token = require("../models/token");
const Account = require("../models/account");

const generateMD5 = (input) => {
  const expire = Math.ceil(Date.now() / 1000) + 25200;
  const hash = CryptoJS.MD5(expire + process.env.HASH_SECRET_KEY + input);
  const base64 = hash
    .toString(CryptoJS.enc.Base64)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return base64;
};

const encoded = (value) => {
  var encrypted = CryptoJS.AES.encrypt(value, ` cntt@da&)dUybAo`);
  return encrypted.toString();
};
const decoded = (encrypted) => {
  var bytes = CryptoJS.AES.decrypt(encrypted, ` cntt@da&)dUybAo`);
  var decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
};

//signup
const signup = async (req, res) => {
  try {
    let account = await Account.findOne({ email: req.body.email });
    let user = await User.findOne({ email: req.body.email });
    if (user || account) {
      return res
        .status(409)
        .send({ message: "User with given email already Exist!" });
    }
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    let newAccount = await Account.create({
      email: req.body.email,
      password: hashPassword,
    });

    await User.create({
      fullname: req.body.fullname,
      email: req.body.email,
    });
    const token = await Token.create({
      userID: newAccount._id,
      token: generateMD5(newAccount._id),
    });

    const url = `${process.env.BASE_URL}api/auth/verify/${newAccount.id}/${token.token}`;
    const msg = `<p>Vui lòng click vào link để hoàn thành đăng ký tài khoản: <a href="${url}">Verify Account</a> </p>`;

    await sendEmail(newAccount.email, "Verify Email", msg);
    res.status(201).send({
      message: "An Email sent to your account please verify",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
};

//verify email
const verifyEmail = async (req, res) => {
  try {
    const user = await Account.findOne({
      _id: req.params.userID,
    });

    if (!user)
      return res.status(400).send({
        message: "Invalid link",
      });

    const token = await Token.findOne({
      userID: user._id,
      token: req.params.token,
    });

    if (!token)
      return res.status(400).send({
        message: "Invalid link",
      });

    await Account.findOneAndUpdate({ _id: user._id }, { verified: true });
    res.status(200).send({
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error3",
    });
  }
};

//login
const login = async (req, res, next) => {
  try {
    const account = await Account.findOne({
      email: req.body.email,
    });
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user || !req.body.password)
      return res.status(401).send({
        message: "Invalid Email or Password",
      });

    const validPassword = await bcrypt.compare(
      req.body.password,
      account.password
    );

    if (!validPassword)
      return res.status(401).send({
        message: "Invalid Email or Password",
      });

    if (!account.verified) {
      let token = await Token.findOne({ userID: account._id });
      if (!token) {
        token = await Token.create({
          userID: account._id,
          token: generateMD5(),
        });
        const url = `${process.env.BASE_URL}api/user/verify/${account.id}/${token.token}`;
        await sendEmail(user.email, "Verify Email", url);
      }

      return res
        .status(400)
        .send({ message: "An Email sent to your account please verify" });
    }
    const accessToken = jwt.sign(
      {
        UserInfo: {
          email: user.email,
          role: user.role,
        },
      },
      process.env.JWT_ACCESS_TOKEN,
      {
        expiresIn: "7d",
      }
    );

    //create secure cookie with access token
    res.cookie("jwt", accessToken, {
      // httpOnly: true, //accessible only by web server
      // secure: true, //https
      // sameSite: "None", //cross-site cookie
      // maxAge: 7 * 24 * 60 * 60 * 1000, //cookie exp
    });

    res.status(200).json({
      message: "logged in successfully",
      accessToken,
      user,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const logout = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204);

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  res.json({
    message: "Cookie cleared",
  });
};

//forgot password
const forgotPassword = async (req, res) => {
  try {
    let user = await Account.findOne({ email: req.body.email });
    if (!user) return res.status(409).send({ message: "User Not Exist!" });

    const url = `${process.env.BASE_URL}api/auth/reset-password/${user.email}`;
    const msg = `<p>Vui lòng click vào link để hoàn thành thay đổi password: <a href="${url}">Reset Password</a> </p>`;

    await sendEmail(user.email, "Password Reset", msg);

    res
      .status(201)
      .send({ message: "An Email sent to your account please check" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//get - reset password
const resetPasswordRequest = async (req, res) => {
  try {
    const user = await Account.findOne({
      _id: req.params.email,
    });

    if (!user)
      return res.status(400).send({
        message: "Invalid link",
      });

    res.status(200).send({
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

//reset password
const resetPassword = async (req, res) => {
  try {
    const user = await Account.findOne({
      email: req.params.email,
    });

    if (!user)
      return res.status(400).send({
        message: "Invalid link",
      });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.newpassword, salt);
    await Account.findOneAndUpdate(
      { email: req.params.email },
      {
        password: hashPassword,
      }
    );

    res.status(201).send({ message: "Reset password successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = {
  signup,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPasswordRequest,
  resetPassword,
};
