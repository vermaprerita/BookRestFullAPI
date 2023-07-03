require("dotenv").config();
const { json } = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/BooksModel");

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.id;
      next();
    } catch (error) {
      res.status(401).send("Token Authorized Token");
    }
  } else {
    res.status(401).send("Not Authorized Token");
  }
};

module.exports = checkUserAuthorization;
