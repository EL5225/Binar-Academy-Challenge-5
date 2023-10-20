import supertest from "supertest";
import app from "../../app.js";
import { prisma } from "../../prisma/client/index.js";

const listen = app.listen(3001);

beforeAll(async () => {
  await prisma.users.create({
    data: {
      name: "Test users",
      email: "test@example.com",
      password: "password123",
      Profile: {
        create: {
          phoneNumber: "081299567890",
        },
      },
    },
  });
});

afterAll(async () => {
  await prisma.users.delete({ where: { email: "test@example.com" } });
});

describe("Test GET /api/v1/users endpoint", () => {
  test("Test get all users", async () => {
    const name = "Test users";
    const email = "test@example.com";
    const password = "password123";
    const confirm_password = "password123";

    await fetch("http://localhost:3005/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        confirm_password,
      }),

      credentials: "include",
    });

    const { statusCode, body } = await supertest(listen).get("/api/v1/users");

    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("data");
    expect(body.status).toBe(true);
    expect(body.message).toBe("Users data retrieved successfully");
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty("id");
    expect(body.data[0]).toHaveProperty("name");
    expect(body.data[0]).toHaveProperty("email");
    expect(body.data[0]).toHaveProperty("Profile");
    expect(body.data[0].Profile).toHaveProperty("id");
    expect(body.data[0].Profile).toHaveProperty("phoneNumber");
    expect(body.data[0].Profile).toHaveProperty("identityType");
    expect(body.data[0].Profile).toHaveProperty("identityNumber");
    expect(body.data[0].Profile).toHaveProperty("gender");
    expect(body.data[0].Profile).toHaveProperty("religion");
    expect(body.data[0].Profile).toHaveProperty("address");
  });
});
