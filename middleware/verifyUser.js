require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyUser = (headers) => {
  const authHeader = headers;
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      message: "A token is require for authentication!!!",
    };
  }
  // 'Beaer [token]'
  const token = authHeader.split(" ")[1];

  const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
  const email = decodedToken.UserInfo.email;
  return email;
};

module.exports = { verifyUser };
