const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const app = express();
const PORT = process.env.PORT;
const Book = require("./models/BooksModel");
const User = require("./models/UserModel");
const authMiddleware = require("./middlewares/checkUserAuthorization");
const { body, validationResult } = require("express-validator");
const db = require("./config/dbconfig");

// Middleware for parsing JSON data
app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

// Routes

app.listen(PORT, () => {
  console.log(`Server start on port : ${PORT}`);
});
