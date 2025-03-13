const request = require("supertest");
const app = require("../Server"); // Import your Express app

describe("Event Planner API", () => {
  let server;

  beforeAll(() => {
    server = app.listen();
  });

  afterAll(() => {
    server.close();
  });

  test("User Registration", async () => {
    const res = await request(server).post("/api/auth/register").send({
      username: "abdullah",
      email: "abd@example.com",
      password: "123456",
    });
    expect(res.statusCode).toBe(201);
  });

  test("User Login", async () => {
    const res = await request(server).post("/api/auth/login").send({
      email: "abd@example.com",
      password: "123456",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("Create Event", async () => {
    const login = await request(server).post("/api/auth/login").send({
      email: "abd@example.com",
      password: "123456",
    });

    const token = login.body.token;

    const res = await request(server)
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
    const login = await request(server).post("/api/auth/login").send({
      email: "abd@example.com",
      password: "123456",
    });

    const token = login.body.token;

    const res = await request(server)
      .get("/api/events")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
