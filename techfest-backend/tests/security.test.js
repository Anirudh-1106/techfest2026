const request = require("supertest");
const app = require("../app");

describe("API basics", () => {
  test("health check returns healthy", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
  });

  test("unknown route returns 404", async () => {
    const res = await request(app).get("/api/nothing-here");
    expect(res.status).toBe(404);
  });
});

describe("Security headers (Helmet)", () => {
  test("sets CSP, nosniff and frame protection", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["content-security-policy"]).toContain("default-src 'self'");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("NoSQL injection", () => {
  test("login with operator object is rejected", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: { $gt: "" }, password: { $gt: "" } });
    expect(res.status).toBe(400);
  });

  test("register with operator object is rejected", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "x", email: { $ne: null }, password: "secret1" });
    expect(res.status).toBe(400);
  });
});

describe("Input validation", () => {
  test("register with bad email fails", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "not-an-email", password: "secret1" });
    expect(res.status).toBe(400);
  });

  test("empty feedback is rejected", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({ name: "Test", comment: "" });
    expect(res.status).toBe(400);
  });
});

describe("Auth and CSRF", () => {
  test("protected route needs a token", async () => {
    const res = await request(app).get("/api/registrations/my");
    expect(res.status).toBe(401);
  });

  test("session check returns no user for guests", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });

  test("POST from another website is blocked", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .set("Origin", "https://evil.example.com")
      .send({ name: "x", comment: "y" });
    expect(res.status).toBe(403);
  });
});
