require("dotenv").config();
const { verifyUser } = require("../middleware/verifyUser");
const User = require("../models/User");
const Wallet = require("../models/wallet");
const Request = require("../models/request");
const Currency = require("../models/currency");
const account = require("../models/account");
const Transaction = require("../models/transaction");

//get all users
const allUsers = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });

    if (!user && user.role !== "admin") {
      return res.status(400).send({
        message: "Invalid link",
      });
    }

    const members = await User.find({});

    return res.status(200).send({ members });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error,
    });
  }
};

//edit user
const editUser = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });
    // const user = await User.findOne({
    //   email: req.params.email,
    // });

    if (!user || user.role !== "admin") {
      return res.status(400).send({
        message: "Invalid link",
      });
    }

    const member = await User.findOneAndUpdate(
      {
        email: req.body.email,
      },
      {
        fullname: req.body.fullname,
      }
    );

    if (!member) {
      return res.status(400).send({
        message: "Invalid link",
      });
    }
    return res.status(200).send({
      message: "Edit user success!!",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

//delete user
const deleteUser = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });
    // const user = await User.findOne({
    //   email: req.params.email,
    // });

    if (!user || user.role !== "admin") {
      return res.status(400).send({
        message: "Invalid link",
      });
    }

    await User.findOneAndDelete({
      email: req.body.email,
    });

    await account.findOneAndDelete({
      email: req.body.email,
    });

    return res.status(200).json({
      message: "Delete success",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

//response funding
const responseFunding = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });

    if (!user || user.role !== "admin") {
      return res.status(400).send({
        message: "Invalid link",
      });
    }

    if (!req.body.requestID || !req.body.status) {
      return res.status(401).send({
        message: "Missing something",
      });
    }
    //response request
    await Request.findOneAndUpdate(
      {
        _id: req.body.requestID,
      },
      {
        status: req.body.status,
      }
    );

    const request = await Request.findOne({
      _id: req.body.requestID,
    });

    if (request.status === "approved") {
      const existsWallet = await Wallet.findOne({
        userID: request.userID,
        currencyID: request.firstUnit,
      });

      if (existsWallet) {
        let amount =
          parseFloat(existsWallet.amount) + parseFloat(request.amount);

        const wallet = await Wallet.findOneAndUpdate(
          {
            _id: existsWallet.id,
          },
          {
            amount: amount.toString(),
          }
        );
        return res.status(200).send({
          message: "Recharge success!!!!",
          wallet,
        });
      }

      if (!existsWallet) {
        const currency = await Currency.findOne({
          symbol: request.firstUnit,
        });

        if (
          currency.category === "Suggested Currencies" ||
          currency.category === "Fiat Currencies"
        ) {
          type = "Fiat Currencies";
        } else {
          type = "Cryptocurrencies";
        }

        const wallet = await Wallet.create({
          userID: request.userID,
          currencyID: request.firstUnit,
          amount: request.amount,
          type: type,
        });

        return res.status(200).send({
          message: "Recharge success!!",
          wallet,
        });
      }
    }
    return res.status(200).send({
      message: "Recharge denided!!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const responseSpot = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    //
    const user = await User.findOne({
      email: verifyUser(authHeader),
    });

    if (!user || user.role !== "admin") {
      return res.status(400).send({
        message: "Invalid link",
      });
    }

    await Request.findOneAndUpdate(
      {
        _id: req.body.requestID,
      },
      {
        status: req.body.status,
      }
    );

    const request = await Request.findOne({
      _id: req.body.requestID,
    });

    if (request.type === "buy" && request.status === "approved") {
      const existsWallet = await Wallet.findOne({
        userID: request.userID,
        currencyID: request.secondUnit,
      });

      if (existsWallet) {
        let amount =
          parseFloat(existsWallet.amount) - parseFloat(request.total);

        if (amount < 0) {
          await Request.findOneAndUpdate(
            {
              _id: req.body.requestID,
            },
            {
              status: "pending",
            }
          );
          return res.status(401).send({
            message: "Not enough amount",
          });
        }
        await Wallet.findOneAndUpdate(
          {
            _id: existsWallet.id,
          },
          {
            amount: amount,
          }
        );
        const wallet = await Wallet.findOne({
          userID: request.userID,
          currencyID: request.firstUnit,
        });
        if (wallet) {
          let amount = parseFloat(wallet.amount) + parseFloat(request.amount);

          await Wallet.findOneAndUpdate(
            {
              _id: wallet.id,
            },
            {
              amount: amount,
            }
          );

          return res.status(200).send({
            message: "Success!!",
          });
        }

        if (!wallet) {
          console.log("hello5");

          let name =
            request.firstUnit.charAt(0).toUpperCase() +
            request.firstUnit.slice(1);
          const currency = await Currency.findOne({
            name: name,
          });
          console.log(currency);
          console.log(request.firstUnit);
          console.log(name);
          if (currency) {
            if (
              currency.category === "Suggested Currencies" ||
              currency.category === "Fiat Currencies"
            ) {
              type = "Fiat Currencies";
            } else {
              type = "Cryptocurrencies";
            }
            const wallet = await Wallet.create({
              userID: request.userID,
              currencyID: request.firstUnit,
              amount: request.amount,
              type: type,
            });

            console.log("hello7");

            return res.status(200).send({
              message: "Success!!",
              wallet,
            });
          } else {
            type = "Cryptocurrencies";
          }

          const wallet = await Wallet.create({
            userID: request.userID,
            currencyID: request.firstUnit,
            amount: request.amount,
            type: type,
          });

          console.log("hello7");

          return res.status(200).send({
            message: "Success!!",
            wallet,
          });
        }
      }

      if (!existsWallet) {
        console.log("hello8");
        return res.status(401).send({
          message: "Not enough amount",
        });
      }
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

const requestInfo = async (req, res) => {
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

module.exports = {
  allUsers,
  editUser,
  deleteUser,
  responseFunding,
  responseSpot,
};
