require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).send({
      message: "A token is require for authentication!!",
    });
  }
  // 'Beaer [token]'
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
    if (err)
      return res.status(403).json({
        message: "Forbidden1",
      });
    req.email = decoded.UserInfo.email;
    req.role = decoded.UserInfo.role;
    next();
  });
};

module.exports = verifyJWT;
