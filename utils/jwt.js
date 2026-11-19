const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateAccessToken = (user) => {
    return jwt.sign(
      {
        id:user._id,
        email:user.email,
        role:user.role,
        tokenVersion:user.tokenVersion,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      }
    )
}

const generateRefreshToken = ({userId,sessionId,tokenVersion}) => {
   return jwt.sign(
    {
      userId,
      sessionId,
      tokenVersion,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    }
   )
}

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

const hashRefreshToken = (token) => {
     return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashRefreshToken,
}