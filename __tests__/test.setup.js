const mongoose = require("mongoose");

// Connect to the test database
async function connectToDatabase() {
  await mongoose.connect(process.env.DB_URL_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Export the connected mongoose instance
module.exports = { mongoose, connectToDatabase };
