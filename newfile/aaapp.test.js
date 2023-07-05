const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/UserModel");

// Create a test user for login testing
const testUser = {
  username: "newuser",
  password: "newpassword",
};
beforeAll(async () => {
  // Disconnect from the active connection, if any
  await mongoose.connection.close();

  // Connect to the test database
  await mongoose.connect(
    "mongodb+srv://vermaprerita:JO8cgIg8IzEFwmCh@books.lkfotex.mongodb.net/test?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
});

afterEach(async () => {
  // Clear the test user after each test
  await User.deleteMany({});
});

const request = require("supertest");
const app = require("./app");

describe("Test the book API endpoints", () => {
  let testToken;

  beforeAll(async () => {
    // Perform login to get the JWT token for authentication in protected routes
    const loginResponse = await request(app)
      .post("/login")
      .send({ username: "testuser", password: "testpassword" });
    testToken = loginResponse.body.token;
  });

  it("should create a new book", async () => {
    const newBook = {
      title: "Test Book",
      author: "Test Author",
      genre: "Test Genre",
      year: 2023,
    };

    const response = await request(app)
      .post("/books")
      .set("Authorization", `Bearer ${testToken}`)
      .send(newBook);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newBook);
  });
});

afterAll(async () => {
  // Clean up the test database and close the connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
