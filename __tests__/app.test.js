const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
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

describe("User Registration", () => {
  test("should register a new user", async () => {
    const response = await request(app).post("/register").send({
      username: testUser.username,
      password: testUser.password,
    });

    // Assert the response status code and body
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User registered successfully");

    // Assert that the user is saved in the database
    const user = await User.findOne({ username: testUser.username });
    expect(user).toBeDefined();
    expect(user.username).toBe(testUser.username);
    expect(user.password).not.toBe(testUser.password);
  });

  test("should return validation error for missing username", async () => {
    const response = await request(app).post("/register").send({
      password: testUser.password,
    });

    // Assert the response status code and body
    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].param).toBe("username");
    expect(response.body.errors[0].msg).toBe("Username is required");
  });

  test("should return validation error for missing password", async () => {
    const response = await request(app).post("/register").send({
      username: testUser.username,
    });

    // Assert the response status code and body
    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].param).toBe("password");
    expect(response.body.errors[0].msg).toBe("Password is required");
  });

  test("should return validation error for invalid password length", async () => {
    const response = await request(app).post("/register").send({
      username: testUser.username,
      password: "12345",
    });

    // Assert the response status code and body
    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].param).toBe("password");
    expect(response.body.errors[0].msg).toBe(
      "Password must be at least 6 characters long"
    );
  });

  // Add more test cases for different scenarios
});
afterAll(async () => {
  // Clean up the test database and close the connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
