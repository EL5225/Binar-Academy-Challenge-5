import supertest, { agent } from "supertest";
import app from "../../app.js";
import { prisma } from "../../prisma/client/index.js";

const listen = app.listen(3000);

afterAll(async () => {
  await prisma.users.delete({ where: { email: "test@example.com" } });
});

describe("Test POST /api/v1/auth/register endpoint", () => {
  test("Test register success", async () => {
    const name = "Test register";
    const email = "test@example.com";
    const phoneNumber = "081234567890";
    const password = "password123";
    const confirm_password = "password123";

    const { statusCode, body } = await supertest(listen)
      .post("/api/v1/auth/register")
      .send({
        name,
        email,
        phoneNumber,
        password,
        confirm_password,
      });

    expect(statusCode).toBe(201);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("data");
    expect(body.status).toBe(true);
    expect(body.message).toBe("Register successfull");
    expect(body.data.id).toBeDefined();
    expect(body.data.name).toBe(name);
    expect(body.data.email).toBe(email);
    expect(body.data.Profile.phoneNumber).toBe(phoneNumber);
  });

  test("Test register failed", async () => {
    const name = "Test register";
    const email = "test@example.com";
    const phoneNumber = "0867890";
    const password = "password12";
    const confirm_password = "password123";

    const { statusCode, body } = await supertest(listen)
      .post("/api/v1/auth/register")
      .send({
        name,
        email,
        phoneNumber,
        password,
        confirm_password,
      });

    expect(statusCode).toBe(400);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("error");
    expect(body.status).toBe(false);
  });
});

describe("Test POST /api/v1/auth/login endpoint", () => {
  test("Test login success", async () => {
    const email = "test@example.com";
    const password = "password123";

    const { statusCode, body } = await supertest(listen)
      .post("/api/v1/auth/login")
      .send({
        email,
        password,
      });

    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("data");
    expect(body.status).toBe(true);
    expect(body.message).toBe("Login successfull");
    expect(body.data.user).toBeDefined();
    expect(body.data.user.id).toBeDefined();
    expect(body.data.user.name).toBeDefined();
    expect(body.data.user.email).toBe(email);
    expect(body.data.user.Profile).toBeDefined();
    expect(body.data.token).toBeDefined();
  });

  test("Test login failed email bad request", async () => {
    const email = "test123@example.com";
    const password = "password123";

    const { statusCode, body } = await supertest(listen)
      .post("/api/v1/auth/login")
      .send({
        email,
        password,
      });

    expect(statusCode).toBe(400);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("error");
    expect(body.status).toBe(false);
    expect(body.message).toBe("Bad Request");
    expect(body.error).toBe("email or password is invalid");
  });

  test("Test login failed password bad request", async () => {
    const email = "test@example.com";
    const password = "password12";

    const { statusCode, body } = await supertest(listen)
      .post("/api/v1/auth/login")
      .send({
        email,
        password,
      });

    expect(statusCode).toBe(400);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("error");
    expect(body.status).toBe(false);
    expect(body.message).toBe("Bad Request");
    expect(body.error).toBe("email or password is invalid");
  });
});

describe("Test GET /api/v1/auth/authenticate endpoint", () => {
  test("Test authenticate user successfull", async () => {
    const email = "test@example.com";
    const password = "password123";

    const data = await fetch("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),

      credentials: "include",
    });

    const response = await data.json();
    const { token } = response.data;

    const { statusCode, body } = await supertest(listen)
      .get("/api/v1/auth/authenticate")
      .set("Authorization", token);

    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("data");
    expect(body.status).toBe(true);
    expect(body.data.id).toBeDefined();
    expect(body.data.name).toBeDefined();
    expect(body.data.email).toBeDefined();
    expect(body.data.Profile).toBeDefined();
    expect(body.data.BankAccount).toBeDefined();
  });

  test("Test authenticate user failed", async () => {
    const { statusCode, body } = await supertest(listen).get(
      "/api/v1/auth/authenticate"
    );

    expect(statusCode).toBe(401);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("error");
    expect(body.status).toBe(false);
    expect(body.message).toBe("Unauthorized");
    expect(body.error).toBe("missing token");
  });
});
