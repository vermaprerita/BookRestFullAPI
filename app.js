const express = require("express");
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
const connectDB = require("./config/dbconfig");
const rateLimit = require("express-rate-limit");

// Middleware for parsing JSON data
app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

// Create a rate limiter middleware
// const limiter = rateLimit({
//   windowMs: 60 * 1000, // Time window in milliseconds
//   max: 100, // Maximum number of requests allowed within the time window
//   message: "Too many requests. Please try again later.",
// });
// app.use("/books", limiter);
// Routes

// Register a new user
app.post(
  "/register",
  body("username").notEmpty().withMessage("Username is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { username, password } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = new User({
        username,
        password: hashedPassword,
      });
      await user.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server Error" });
    }
  }
);

// Login and generate a JWT token
app.post(
  "/login",
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ userId: user._id }, "secretKey");
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server Error" });
    }
  }
);

// Books API endpoints

// Create a book
app.post(
  "/books",
  authMiddleware,
  body("title").notEmpty().withMessage("Title is required"),
  body("author").notEmpty().withMessage("Author is required"),
  body("genre").notEmpty().withMessage("Genre is required"),
  body("year")
    .notEmpty()
    .withMessage("Year is required")
    .isNumeric()
    .withMessage("Year must be a number"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, author, genre, year } = req.body;
      const book = new Book({
        title,
        author,
        genre,
        year,
      });
      await book.save();
      res.status(201).json(book);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server Error" });
    }
  }
);

// Read a single book
app.get("/books/:id", authMiddleware, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Update a book
app.put(
  "/books/:id",
  authMiddleware,
  body("title").notEmpty().withMessage("Title is required"),
  body("author").notEmpty().withMessage("Author is required"),
  body("genre").notEmpty().withMessage("Genre is required"),
  body("year")
    .notEmpty()
    .withMessage("Year is required")
    .isNumeric()
    .withMessage("Year must be a number"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server Error" });
    }
  }
);

// Delete a book
app.delete("/books/:id", authMiddleware, async (req, res) => {
  try {
    const book = await Book.findByIdAndRemove(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// List all books with pagination, sorting, and search
app.get("/books", authMiddleware, async (req, res) => {
  try {
    const {
      page,
      limit,
      sortBy = "title",
      sortOrder = "asc",
      search,
    } = req.query;

    // Parse page and limit parameters
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Parse sort parameter and set default sort field
    const sortField = ["title", "author", "genre", "year"].includes(sortBy)
      ? sortBy
      : "title";

    // Calculate skip value for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Build the search query
    const searchQuery = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
      searchQuery["$or"] = [
        { title: searchRegex },
        { author: searchRegex },
        { genre: searchRegex },
      ];
    }

    // Determine the sort order
    const sortOptions = {};
    sortOptions[sortField] = sortOrder === "desc" ? -1 : 1;

    // Fetch books with pagination, sorting, and search
    const books = await Book.find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    // Count total number of books
    const totalCount = await Book.countDocuments(searchQuery);

    res.json({
      data: books,
      page: pageNumber,
      limit: limitNumber,
      totalCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server start on port : ${PORT}`);
});
