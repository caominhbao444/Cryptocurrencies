require("dotenv").config();
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const QRCode = require("qrcode");

const sendEmail = require("../utils/sendEmail");
const { verifyUser } = require("../middleware/verifyUser");
const User = require("../models/User");
const Token = require("../models/token");
const Wallet = require("../models/wallet");
const Request = require("../models/request");
const Transaction = require("../models/transaction");
const Account = require("../models/account");

const encoded = (value) => {
  var encrypted = CryptoJS.AES.encrypt(value, process.env.HASH_SECRET_KEY);
  return encrypted.toString();
};
const decoded = (encrypted) => {
  var bytes = CryptoJS.AES.decrypt(encrypted, process.env.HASH_SECRET_KEY);
  var decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
};

//get info
const getUserInfo = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });
    let account = await Account.findOne({
      email: verifyUser(authHeader),
    });

    // Creating the data
    let data = {
      email: account.email,
      password: account.password,
    };

    // Converting the data into String format
    let stringdata = JSON.stringify(data);

    // Print the QR code to terminal
    const QR = QRCode.toString(
      stringdata,
      { type: "svg" },
      function (err, QRcode) {
        if (err) return console.log("error occurred");
      }
    );

    if (!user)
      return res.status(400).send({
        message: "Invalid link",
      });

    return res.status(200).send({
      user,
      QR,
    });
  } catch (err) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

//update info
const editUserInfo = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    let user = await User.findOneAndUpdate(
      {
        email: verifyUser(authHeader),
      },
      {
        fullname: req.body.fullname,
      }
    );

    if (!user)
      return res.status(400).send({
        message: "Invalid link",
      });

    res.status(200).send({
      message: "Update user information successfully!!!",
    });
  } catch (err) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

//get wallet
const getWallet = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });
    // const user = await User.findOne({
    //   email: req.params.email,
    // });

    if (!user) {
      return res.status(400).send({
        message: "Invalid link",
      });
    }

    const wallet = await Wallet.find({
      userID: user.id,
    });

    return res.status(200).send({
      wallet,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error,
    });
  }
};

//create request
const request = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    console.log("hello");
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });
    console.log(verifyUser(authHeader));

    if (!user) {
      return res.status(400).send({
        message: "Invalid link",
      });
    }

    if (req.params.type === "spot") {
      const existWallet = await Wallet.findOne({
        userID: user.id,
        currencyID: req.body.secondUnit.toUpperCase(),
      });
      if (!existWallet) {
        return res.status(401).send({
          message: "Please use other currency units",
        });
      }
      let total = parseFloat(existWallet.amount) - parseFloat(req.body.total);
      if (total > 0) {
        await Request.create({
          userID: user._id,
          requestType: req.params.type,
          type: req.body.type ? req.body.type : null,
          firstUnit: req.body.firstUnit ? req.body.firstUnit : null,
          secondUnit: req.body.secondUnit
            ? req.body.secondUnit.toUpperCase()
            : null,
          amount: req.body.amount ? req.body.amount : null,
          total: req.body.total ? req.body.total : null,
          senderAddress: req.body.senderAddress
            ? encoded(req.body.senderAddress)
            : null,
          recieverAddress: req.body.recieverAddress
            ? encoded(req.body.recieverAddress)
            : null,
          date: new Date(),
        });

        // await Wallet.findOneAndUpdate(
        //   {
        //     userID: user._id,
        //     currencyID: req.body.secondUnit,
        //   },
        //   { amount: total }
        // );

        return res.status(200).send({
          message: "Your request has been sent",
        });
      }
      return res.status(401).send({
        message: "Your amount is not enough",
      });
    }
    const request = await Request.create({
      userID: user._id,
      requestType: req.params.type,
      type: req.body.type ? req.body.type : null,
      firstUnit: req.body.firstUnit ? req.body.firstUnit : null,
      secondUnit: req.body.secondUnit
        ? req.body.secondUnit.toUpperCase()
        : null,
      amount: req.body.amount ? req.body.amount : null,
      total: req.body.total ? req.body.total : null,
      senderAddress: req.body.senderAddress ? req.body.senderAddress : null,
      recieverAddress: req.body.recieverAddress
        ? encoded(req.body.recieverAddress)
        : null,
      date: new Date(),
    });

    return res.status(200).send({
      request,
      message: "Your request has been sent",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const requestInfo = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });

    if (!user) {
      return res.status(400).send({
        message: "Invalid link",
      });
    }
    const page = req.query.page;
    console.log(page);
    let skip = 0;
    if (parseInt(page) <= 1 || !page) {
      skip = 0;
    } else {
      skip = (parseInt(page) - 1) * 50;
    }

    if (user.role === "admin") {
      const request = await Request.find({
        requestType: req.params.type,
      });

      return res.status(200).send({
        request,
      });
    }

    const request = await Request.find({
      userID: user._id,
      requestType: req.params.type,
    });

    return res.status(200).send({
      request,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const p2pRequest = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });
    // const user = await User.findOne({
    //   email: req.params.email,
    // });

    if (!user) {
      return res.status(400).send({
        message: "Invalid link",
      });
    }

    if (req.body.type === "buy") {
      const existWallet = await Wallet.findOne({
        userID: user.id,
        currencyID: req.body.secondUnit.toUpperCase(),
      });
      // console.log(req.body.secondUnit.toUpperCase());
      // console.log(user.id);
      // console.log(existWallet);

      if (!existWallet) {
        return res.status(401).send({
          message: "Please use other currency units",
        });
      }
      let total = parseFloat(existWallet.amount) - parseFloat(req.body.total);
      if (total > 0) {
        await Request.create({
          userID: user._id,
          requestType: "p2p",
          type: req.body.type ? req.body.type : null,
          firstUnit: req.body.firstUnit ? req.body.firstUnit : null,
          secondUnit: req.body.secondUnit
            ? req.body.secondUnit.toUpperCase()
            : null,
          amount: req.body.amount ? req.body.amount : null,
          total: req.body.total ? req.body.total : null,
          senderAddress: req.body.senderAddress
            ? encoded(req.body.senderAddress)
            : null,
          recieverAddress: req.body.recieverAddress
            ? encoded(req.body.recieverAddress)
            : null,
          date: new Date(),
        });

        return res.status(200).send({
          message: "Your request has been sent",
        });
      }
      return res.status(401).send({
        message: "Your amount is not enough",
      });
    } else if (req.body.type === "sell") {
      const existWallet = await Wallet.findOne({
        userID: user._id,
        currencyID: req.body.firstUnit, // unit that in user wallet
      });
      // console.log(existWallet);

      if (!existWallet) {
        return res.status(401).send({
          message: "Please use other currency units",
        });
      }

      let total = parseFloat(existWallet.amount) - parseFloat(req.body.amount);
      if (total > 0) {
        await Request.create({
          userID: user._id,
          requestType: "p2p",
          type: req.body.type ? req.body.type : null,
          firstUnit: req.body.firstUnit ? req.body.firstUnit : null,
          secondUnit: req.body.secondUnit
            ? req.body.secondUnit.toUpperCase()
            : null,
          amount: req.body.amount ? req.body.amount : null,
          total: req.body.total ? req.body.total : null,
          senderAddress: req.body.senderAddress
            ? encoded(req.body.senderAddress)
            : null,
          recieverAddress: req.body.recieverAddress
            ? encoded(req.body.recieverAddress)
            : null,
          date: new Date(),
        });

        return res.status(200).send({
          message: "Your request has been sent",
        });
      }
      return res.status(401).send({
        message: "Your amount is not enough",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};
//
const p2pRequestInfo = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });
    // const user = await User.findOne({
    //   email: req.params.email,
    // });
    if (!user) {
      return res.status(400).send({
        message: "Invalid link",
      });
    }

    if (req.params.type === "own") {
      const request = await Request.find({
        userID: user.id,
        requestType: "p2pReq",
      });

      return res.status(200).send({
        request,
      });
    }
    const request = await Request.find({
      requestType: "p2p",
      type: req.params.type,
    });

    return res.status(200).send({
      request,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const p2pClientRequest = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });

    if (!user) {
      return res.status(400).send({
        message: "Invalid link",
      });
    }
    if (req.body.requestType === "p2pReq" && req.body.type === "buy") {
      const existWallet = await Wallet.findOne({
        userID: user._id,
        currencyID: req.body.secondUnit.toUpperCase(),
      });
      console.log(existWallet);

      if (!existWallet) {
        return res.status(401).send({
          message: "Please use other currency units",
        });
      }

      let total = parseFloat(existWallet.amount) - parseFloat(req.body.total);
      if (decoded(req.body.recieverAddress) === req.body.senderAddress) {
        return res.status(401).send({
          message: "This is your post!!",
        });
      }
      const publicRequest = await Request.findOne({
        _id: req.body.requestOf,
      });
      console.log(req.body.requestOf);
      console.log(publicRequest);
      if (total > 0) {
        await Request.create({
          userID: publicRequest.userID,
          requestType: "p2pReq",
          type: req.body.type ? req.body.type : null,
          firstUnit: req.body.firstUnit ? req.body.firstUnit : null,
          secondUnit: req.body.secondUnit
            ? req.body.secondUnit.toUpperCase()
            : null,
          amount: req.body.amount ? req.body.amount : null,
          total: req.body.total ? req.body.total : null,
          senderAddress: req.body.senderAddress
            ? encoded(req.body.senderAddress)
            : null,
          recieverAddress: req.body.recieverAddress
            ? req.body.recieverAddress
            : null,
          requestOf: req.body.requestOf,
          requestBy: user.id,
          date: new Date(),
        });
        return res.status(200).send({
          message: "Your request has been sent",
        });
      }
      return res.status(401).send({
        message: "Your amount is not enough",
      });
    } else if (req.body.requestType === "p2pReq" && req.body.type === "sell") {
      const existWallet = await Wallet.findOne({
        userID: user._id,
        currencyID: req.body.secondUnit.toUpperCase(),
      });

      if (!existWallet) {
        return res.status(401).send({
          message: "Please use other currency units",
        });
      }

      let total = parseFloat(existWallet.amount) - parseFloat(req.body.total);
      if (decoded(req.body.recieverAddress) === req.body.senderAddress) {
        return res.status(401).send({
          message: "This is your post!!",
        });
      }
      const publicRequest = await Request.findOne({
        _id: req.body.requestOf,
      });
      // console.log(req.body.requestOf);
      // console.log(publicRequest);
      if (total > 0) {
        await Request.create({
          userID: publicRequest.userID,
          requestType: "p2pReq",
          type: req.body.type ? req.body.type : null,
          firstUnit: req.body.firstUnit ? req.body.firstUnit : null,
          secondUnit: req.body.secondUnit
            ? req.body.secondUnit.toUpperCase()
            : null,
          amount: req.body.amount ? req.body.amount : null,
          total: req.body.total ? req.body.total : null,
          senderAddress: req.body.senderAddress
            ? encoded(req.body.senderAddress)
            : null,
          recieverAddress: req.body.recieverAddress
            ? req.body.recieverAddress
            : null,
          requestOf: req.body.requestOf,
          requestBy: user.id,
          date: new Date(),
        });
        return res.status(200).send({
          message: "Your request has been sent",
        });
      }
      return res.status(401).send({
        message: "Your amount is not enough",
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const p2pOnwerResonse = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const psOwner = await User.findOne({
      email: verifyUser(authHeader),
    });
    // const psOwner = await User.findOne({
    //   email: req.params.email,
    // });

    console.log("1");
    //CHECK VALID OWNER
    if (!psOwner) {
      return res.status(400).send({
        message: "Invalid link",
      });
    }

    //UPDATE STATUS
    await Request.findByIdAndUpdate(
      {
        _id: req.body.requestID,
      },
      {
        status: req.body.status,
      }
    );
    //
    const request = await Request.findOne({
      _id: req.body.requestID,
    });

    console.log("2");
    const requesterEmail = decoded(request.senderAddress);
    console.log("2.1");
    //CHECK VALID CLIENT
    const requester = await User.findOne({
      email: requesterEmail,
    });

    if (!requester) {
      return res.status(400).send({
        message: "Invalid link",
      });
    }
    //
    console.log(requester);
    console.log(requester.id);
    console.log("4");
    if (
      request.requestType === "p2pReq" &&
      request.type === "buy" &&
      request.status === "approved"
    ) {
      /******************************************************************/
      console.log("buy 001");
      const psOwnerFiatUnit = await Wallet.findOne({
        userID: request.userID,
        currencyID: request.secondUnit,
      });
      const psOwnerCryptoUnit = await Wallet.findOne({
        userID: request.userID,
        currencyID: request.firstUnit,
      });
      const requesterFiatUnit = await Wallet.findOne({
        userID: requester.id,
        currencyID: request.secondUnit,
      });
      const requesterCryptoUnit = await Wallet.findOne({
        userID: requester.id,
        currencyID: request.firstUnit,
      });
      console.log("buy 002");
      console.log("psOwnerFiatUnit", psOwnerFiatUnit);
      console.log("psOwnerCryptoUnit", psOwnerCryptoUnit);
      console.log("requesterFiatUnit", requesterFiatUnit);
      console.log("requesterCryptoUnit", requesterCryptoUnit);
      /******************************************************************/
      console.log("buy 003");
      //INVALID UNIT
      if (!psOwnerFiatUnit || !requesterCryptoUnit) {
        console.log("buy 1");
        await Request.findOneAndUpdate(
          {
            _id: req.body.requestID,
          },
          {
            status: "pending",
          }
        );
        return res.status(401).send({
          message: "Invalid currency.",
        });
      } else if (psOwnerFiatUnit && requesterCryptoUnit) {
        console.log("buy 2.2");
        if (!psOwnerCryptoUnit || !requesterFiatUnit) {
          console.log("buy 2");
          if (!psOwnerCryptoUnit) {
            console.log("buy 3");
            await Wallet.create({
              userID: psOwner.id,
              currencyID: request.firstUnit,
              amount: 0,
              type: "Cryptocurrencies",
            });
            console.log("buy 3.1");
          } else if (!requesterFiatUnit) {
            console.log("buy 4");
            console.log(requester);
            console.log(request);
            await Wallet.create({
              userID: requester.id,
              currencyID: request.secondUnit,
              amount: 0,
              type: "Fiat Currencies",
            });
            console.log("buy 4.1");
          }
        }
        console.log("buy 5");
        // const asyncFunction = async () => {
        const psOwnerFiatAmount =
          (await parseFloat(psOwnerFiatUnit.amount)) -
          parseFloat(request.total);
        const psOwnerCryptoAmount =
          (await parseFloat(psOwnerCryptoUnit.amount)) +
          parseFloat(request.amount);
        const requesterFiatAmount =
          (await parseFloat(requesterFiatUnit.amount)) +
          parseFloat(request.total);
        const requesterCryptoAmount =
          (await parseFloat(requesterCryptoUnit.amount)) -
          parseFloat(request.amount);
        // };
        // asyncFunction();

        console.log(psOwnerFiatAmount);
        console.log(psOwnerCryptoAmount);
        console.log(requesterFiatAmount);
        console.log(requesterCryptoAmount);
        console.log("buy 5.1");
        if (psOwnerFiatAmount < 0 || requesterCryptoAmount < 0) {
          console.log("buy 6");
          await Request.findOneAndUpdate(
            {
              _id: req.body.requestID,
            },
            {
              status: "pending",
            }
          );
          console.log("buy 6.1");
          return res.status(401).send({
            message: "Not enough amount.",
          });
        } else {
          console.log("buy 7.1");
          //
          await Wallet.findOneAndUpdate(
            {
              _id: psOwnerFiatUnit.id,
            },
            {
              amount: psOwnerFiatAmount,
            }
          );
          await Wallet.findOneAndUpdate(
            {
              _id: psOwnerCryptoUnit.id,
            },
            {
              amount: psOwnerCryptoAmount,
            }
          );
          await Wallet.findOneAndUpdate(
            {
              _id: requesterCryptoUnit.id,
            },
            {
              amount: requesterCryptoAmount,
            }
          );
          await Wallet.findOneAndUpdate(
            {
              _id: requesterFiatUnit.id,
            },
            {
              amount: requesterFiatAmount,
            }
          );
          console.log("buy 8");
          const originalRequest = await Request.findOne({
            _id: request.requestOf,
          });
          const lastAmount = originalRequest.amount - request.amount;
          // CHECK IF REQUESTER BUY ALL THE COIN, THE POST WILL BE DELETED.
          if (lastAmount <= 0) {
            console.log("buy 9");
            console.log("buy 7");

            await Request.findOneAndRemove({
              _id: request.requestOf,
            });
            await Transaction.create({
              userID: request.userID,
              requestType: request.requestType,
              type: request.type,
              firstUnit: request.firstUnit,
              secondUnit: request.secondUnit,
              amount: request.amount,
              total: request.total,
              senderAddress: request.senderAddress,
              recieverAddress: request.recieverAddress,
              status: req.body.status,
              requestOf: request.requestOf,
              requestBy: request.requestBy,
              date: request.date,
            });
            return res.status(200).send({
              message: "Success!!",
            });
          }
          console.log("buy 10");
          console.log("buy 7");
          // await Wallet.findOneAndUpdate(
          //   {
          //     _id: psOwnerFiatUnit.id,
          //   },
          //   {
          //     amount:
          //       psOwnerFiatUnit.amount -
          //       (request.total / originalRequest.amount) * request.amount,
          //   }
          // );
          // await Wallet.findOneAndUpdate(
          //   {
          //     _id: psOwnerCryptoUnit.id,
          //   },
          //   {
          //     amount: psOwnerCryptoAmount,
          //   }
          // );
          // await Wallet.findOneAndUpdate(
          //   {
          //     _id: requesterCryptoUnit.id,
          //   },
          //   {
          //     amount: requesterCryptoAmount,
          //   }
          // );
          // await Wallet.findOneAndUpdate(
          //   {
          //     _id: requesterFiatUnit.id,
          //   },
          //   {
          //     amount:
          //       requesterFiatUnit.amount -
          //       (request.total / originalRequest.amount) * request.amount,
          //   }
          // );
          await Request.findOneAndUpdate(
            {
              _id: request.requestOf,
            },
            {
              amount: lastAmount,
              status: "pending",
              total:
                (originalRequest.total / originalRequest.amount) * lastAmount,
            }
          );

          await Transaction.create({
            userID: request.userID,
            requestType: request.requestType,
            type: request.type,
            firstUnit: request.firstUnit,
            secondUnit: request.secondUnit,
            amount: request.amount,
            total: request.total,
            senderAddress: request.senderAddress,
            recieverAddress: request.recieverAddress,
            status: req.body.status,
            requestOf: request.requestOf,
            requestBy: request.requestBy,
            date: request.date,
          });

          console.log("buy 11");
          return res.status(200).send({
            message: "Success!!",
          });
        }
      }
      return res.status(401).send({
        message: "Something wrong. Please report this!!",
      });
    } else if (
      request.requestType === "p2pReq" &&
      request.type === "sell" &&
      request.status === "approved"
    ) {
      /******************************************************************/
      console.log("sell 1");
      const psOwnerFiatUnit = await Wallet.findOne({
        userID: request.userID,
        currencyID: request.secondUnit,
      });
      const psOwnerCryptoUnit = await Wallet.findOne({
        userID: request.userID,
        currencyID: request.firstUnit,
      });
      const requesterFiatUnit = await Wallet.findOne({
        userID: requester.id,
        currencyID: request.secondUnit,
      });
      const requesterCryptoUnit = await Wallet.findOne({
        userID: requester.id,
        currencyID: request.firstUnit,
      });
      console.log("psOwnerFiatUnit", psOwnerFiatUnit);
      console.log("psOwnerCryptoUnit", psOwnerCryptoUnit);
      console.log("requesterFiatUnit", requesterFiatUnit);
      console.log("requesterCryptoUnit", requesterCryptoUnit);
      console.log("sell 2");
      /******************************************************************/
      //INVALID UNIT
      if (!psOwnerCryptoUnit || !requesterFiatUnit) {
        console.log("sell 3");
        await Request.findOneAndUpdate(
          {
            _id: req.body.requestID,
          },
          {
            status: "pending",
          }
        );
        console.log("sell 4");
        return res.status(401).send({
          message: "Invalid currency.",
        });
      } else if (psOwnerCryptoUnit && requesterFiatUnit) {
        console.log("sell 5");
        if (!psOwnerFiatUnit || !requesterCryptoUnit) {
          console.log("sell 6");
          if (!psOwnerFiatUnit) {
            console.log("sell 7");
            await Wallet.create({
              userID: psOwner.id,
              currencyID: request.secondUnit,
              amount: 0,
              type: "Fiat Currencies",
            });
            console.log("sell 7.1");
          } else if (!requesterCryptoUnit) {
            console.log("sell 8");
            await Wallet.create({
              userID: requester.id,
              currencyID: request.firstUnit,
              amount: 0,
              type: "Cryptocurrencies",
            });
            console.log("sell 8.1");
          }
        }
        console.log("sell 9");

        const psOwnerFiatAmount =
          parseFloat(psOwnerFiatUnit.amount) + parseFloat(request.total);
        const psOwnerCryptoAmount =
          parseFloat(psOwnerCryptoUnit.amount) - parseFloat(request.amount);
        const requesterFiatAmount =
          parseFloat(requesterFiatUnit.amount) - parseFloat(request.total);
        const requesterCryptoAmount =
          parseFloat(requesterCryptoUnit.amount) + parseFloat(request.amount);

        // console.log(psOwnerFiatAmount);
        // console.log(psOwnerCryptoAmount);
        // console.log(requesterFiatAmount);
        // console.log(requesterCryptoAmount);
        console.log("sell 9.1");
        if (psOwnerCryptoAmount < 0 || requesterFiatAmount < 0) {
          console.log("sell 10");
          await Request.findOneAndUpdate(
            {
              _id: req.body.requestID,
            },
            {
              status: "pending",
            }
          );
          console.log("sell 10.1");
          return res.status(401).send({
            message: "Not enough amount.",
          });
        } else {
          console.log("sell 11");
          await Wallet.findOneAndUpdate(
            {
              _id: psOwnerFiatUnit.id,
            },
            {
              amount: psOwnerFiatAmount,
            }
          );
          await Wallet.findOneAndUpdate(
            {
              _id: psOwnerCryptoUnit.id,
            },
            {
              amount: psOwnerCryptoAmount,
            }
          );
          await Wallet.findOneAndUpdate(
            {
              _id: requesterCryptoUnit.id,
            },
            {
              amount: requesterCryptoAmount,
            }
          );
          await Wallet.findOneAndUpdate(
            {
              _id: requesterFiatUnit.id,
            },
            {
              amount: requesterFiatAmount,
            }
          );
          console.log("sell 11.1");
        }
        console.log("sell 12");
        const originalRequest = await Request.findOne({
          _id: request.requestOf,
        });
        console.log("sell 12.1");
        const lastAmount = originalRequest.amount - request.amount;
        // CHECK IF REQUESTER BUY ALL THE COIN, THE POST WILL BE DELETED.
        console.log(lastAmount);
        if (lastAmount <= 0) {
          console.log("sell 13");
          await Request.findOneAndRemove({
            _id: request.requestOf,
          });
          await Transaction.create({
            userID: request.userID,
            requestType: request.requestType,
            type: request.type,
            firstUnit: request.firstUnit,
            secondUnit: request.secondUnit,
            amount: request.amount,
            total: request.total,
            senderAddress: request.senderAddress,
            recieverAddress: request.recieverAddress,
            status: req.body.status,
            requestOf: request.requestOf,
            requestBy: request.requestBy,
            date: request.date,
          });
          return res.status(200).send({
            message: "success!!",
          });
        }
        await Request.findOneAndUpdate(
          {
            _id: request.requestOf,
          },
          {
            amount: lastAmount,
          }
        );
        await Transaction.create({
          userID: request.userID,
          requestType: request.requestType,
          type: request.type,
          firstUnit: request.firstUnit,
          secondUnit: request.secondUnit,
          amount: request.amount,
          total: request.total,
          senderAddress: request.senderAddress,
          recieverAddress: request.recieverAddress,
          status: req.body.status,
          requestOf: request.requestOf,
          requestBy: request.requestBy,
          date: request.date,
        });
        console.log("sell 14");
        return res.status(200).send({
          message: "Success!!",
        });
      }
      return res.status(401).send({
        message: "Something wrong. Please report this!!",
      });
    }
    return res.status(200).send({
      message: "Rejected!!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};
//Portfolio
const getPortfolio = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });
    const portfolio = await Wallet.find({
      userID: user.id,
      type: "Cryptocurrencies",
    });

    if (!user)
      return res.status(400).send({
        message: "Invalid link",
      });

    return res.status(200).send({
      portfolio,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

//get funding info
const getApprovedRequest = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });

    if (!user) {
      return res.status(400).send({
        message: "Invalid link",
      });
    }

    if (req.params.requestType === "spot") {
      const request = await Request.find({
        userID: user.id,
        requestType: req.params.requestType,
        status: "approved",
      });

      if (!request) {
        return res.status(400).send({
          message: "Invalid link",
        });
      }

      return res.status(200).send({
        request,
      });
    }

    const ownerRequest = await Request.find({
      userID: user.id,
      requestType: req.params.requestType,
      status: "approved",
    });

    const clientRequest = await Request.find({
      requestBy: user.id,
      requestType: req.params.requestType,
      status: "approved",
    });

    const request = [];

    clientRequest.forEach((obj) => {
      if (obj.type === "sell") {
        obj.total = obj.total * -1;
        request.push(obj);
      } else if (obj.type === "buy") {
        obj.amount = obj.amount * -1;
        request.push(obj);
      }
    });

    // console.log(request);

    ownerRequest.forEach((obj) => {
      if (obj.type === "sell") {
        obj.amount = obj.amount * -1;
      } else if (obj.type === "buy") {
        obj.total = obj.total * -1;
      }
      request.push(obj);
    });

    return res.status(200).send({
      request,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getUserInfo,
  editUserInfo,
  //wallet
  getWallet,
  //
  request,
  requestInfo,
  p2pRequest,
  p2pRequestInfo,
  p2pClientRequest,
  p2pOnwerResonse,
  //Portfolio
  getPortfolio,
  //user request info
  getApprovedRequest,
};
