const request = require("supertest");
const app = require("./app");
require("./server");
const bcrypt = require("bcrypt");
const User = require("./models/UserModel");

jest.mock("./models/UserModel");

describe("User Registration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should register a new user", async () => {
    // Mocking the request body
    const reqBody = {
      username: "testuser",
      password: "testpassword",
    };

    // Mocking the bcrypt functions
    bcrypt.genSalt = jest.fn().mockImplementationOnce(async () => "salt");
    bcrypt.hash = jest
      .fn()
      .mockImplementationOnce(async () => "hashedPassword");

    // Mocking the user save function
    const saveMock = jest.fn().mockResolvedValueOnce({});
    User.mockReturnValueOnce({ save: saveMock });

    // Sending the registration request
    const response = await request(app).post("/register").send(reqBody);

    // Asserting the response
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: "User registered successfully" });

    // Verifying the user creation
    expect(User).toHaveBeenCalledTimes(1);
    expect(User).toHaveBeenCalledWith({
      username: reqBody.username,
      password: "hashedPassword",
    });
    expect(saveMock).toHaveBeenCalledTimes(1);

    // Verifying the bcrypt mock functions
    expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith("testpassword", "salt");
  });
  test("should log in a user with valid credentials", async () => {
    // Mock the request body
    const reqBody = {
      username: "testuser",
      password: "testpassword",
    };

    // Mock the User.findOne function
    const findOneMock = jest.fn().mockResolvedValueOnce({
      username: "testuser",
      password: "hashedPassword",
    });
    User.findOne = findOneMock;

    // Mock the bcrypt.compare function
    const compareMock = jest.fn().mockResolvedValueOnce(true);
    bcrypt.compare = compareMock;

    // Send the login request
    const response = await request(app).post("/login").send(reqBody);

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");

    // Verify the User.findOne mock
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(User.findOne).toHaveBeenCalledWith({ username: reqBody.username });

    // Verify the bcrypt.compare mock
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      reqBody.password,
      "hashedPassword"
    );
  });

  test("should return error with invalid credentials", async () => {
    // Mock the request body
    const reqBody = {
      username: "testuser",
      password: "wrongpassword",
    };

    // Mock the User.findOne function
    const findOneMock = jest.fn().mockResolvedValueOnce(null);
    User.findOne = findOneMock;

    // Send the login request
    const response = await request(app).post("/login").send(reqBody);

    // Assert the response
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid credentials" });

    // Verify the User.findOne mock
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(User.findOne).toHaveBeenCalledWith({ username: reqBody.username });
  });
});
