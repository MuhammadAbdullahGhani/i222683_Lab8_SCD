const request = require("supertest");
const app = require("../Server"); 

describe("Event Planner API", () => {
  test("User Registration", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "abdullah",
      email: "abd@example.com",
      password: "123456",
    });
    expect(res.statusCode).toBe(201);
  });

  test("User Login", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "abd@example.com",
      password: "123456",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("Create Event", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "abd@example.com",
      password: "123456",
    });

    const token = login.body.token;

    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Meeting",
        description: "Project discussion",
        date: "2025-03-15T10:00:00Z",
        category: "Work",
        reminder: true,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  test("Fetch Events", async () => {
    const login = await request(app).post("/api/auth/login").send({
      email: "abd@example.com",
      password: "123456",
    });

    const token = login.body.token;

    const res = await request(app)
      .get("/api/events")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
