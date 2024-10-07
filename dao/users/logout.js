const jwt = require("jsonwebtoken");
const redisClient = require("../../config/redis_conn_handler");

module.exports.logout = (token) => {
  return new Promise((resolve, reject) => {
    // Decode the token to get the user information
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject("INVALID_TOKEN");
      }

      // Add the token to a blacklist in Redis with an expiration time
      const expirationTime = decoded.exp - Math.floor(Date.now() / 1000);
      redisClient.setex(token, expirationTime, "blacklisted", (err) => {
        if (err) {
          return reject("LOGOUT_FAILED");
        }
        resolve("LOGOUT_SUCCESS");
      });
    });
  });
};
