require("dotenv").config();
const { json } = require("express");
const jwt = require("jsonwebtoken");

/**
 * User Authentication
 */
const checkUserAuthorization = async (req, res, next) => {
  if (
    req.headers["authorization"] &&
    req.headers["authorization"].startsWith("Bearer")
  ) {
    try {
      let token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
        if (!err) {
          res.send({
            token: decode._id,
          });
        } else {
          return err;
        }
      });
      // console.log(decoded);
      // req.user = decoded.id;
      next();
    } catch (error) {
      res.status(401).send("Token Authorized Token");
    }
  } else {
    res.status(401).send("Not Authorized Token");
  }
};

module.exports = checkUserAuthorization;
