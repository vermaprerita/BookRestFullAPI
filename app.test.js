const request = require("supertest");
const app = require("./app");
const mongoose = require("mongoose");

beforeAll(async () => {
  await mongoose.connect(process.env.DB_URL);
});

describe("Test the book API endpoints", () => {
  // Existing test cases...

  it("should not create a new book without authorization", async () => {
    const newBook = {
      title: "aa",
      author: "aa",
      genre: "aa",
      year: 2012,
    };

    const response = await request(app).post("/books").send(newBook);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });

  it("should return an error when trying to get a non-existing book", async () => {
    const nonExistingBookId = "nonexistingbookid";

    const response = await request(app)
      .get(`/books/${nonExistingBookId}`)
      .set("Authorization", `Bearer ${testToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Book not found" });
  });

  it("should return an error when trying to update a non-existing book", async () => {
    const nonExistingBookId = "nonexistingbookid";
    const updatedBook = {
      title: "Updated Book",
      author: "Updated Author",
      genre: "Updated Genre",
      year: 2024,
    };

    const response = await request(app)
      .put(`/books/${nonExistingBookId}`)
      .set("Authorization", `Bearer ${testToken}`)
      .send(updatedBook);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Book not found" });
  });

  it("should return an error when trying to delete a non-existing book", async () => {
    const nonExistingBookId = "nonexistingbookid";

    const response = await request(app)
      .delete(`/books/${nonExistingBookId}`)
      .set("Authorization", `Bearer ${testToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Book not found" });
  });

  it("should return an error when the request to list books has invalid pagination parameters", async () => {
    const response = await request(app)
      .get("/books")
      .set("Authorization", `Bearer ${testToken}`)
      .query({
        page: -1,
        limit: -2,
        sortBy: "title",
        sortOrder: "asc",
        search: "Book",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid pagination parameters",
    });
  });
});

afterEach(async () => {
  await mongoose.connection.close();
});
