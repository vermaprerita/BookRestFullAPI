const jwt = require("jsonwebtoken");

/**
 * Return JWT token
 * @param {user id} id
 * @returns {jwt token}
 */
const genrateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};

module.exports = genrateToken;
