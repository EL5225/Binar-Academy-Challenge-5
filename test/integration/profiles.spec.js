import supertest from "supertest";
import app from "../../app.js";
import { prisma } from "../../prisma/client/index.js";

const listen = app.listen(3005);

afterAll(async () => {
  await prisma.users.delete({ where: { email: "test@example.com" } });
});

describe("Test PUT /api/v1/profiles endpoint", () => {
  test("Test update profiles", async () => {
    const name = "Test profile";
    const email = "test@example.com";
    const password = "password123";
    const confirm_password = "password123";
    const identityType = "KTP";
    const identityNumber = "12345678910";
    const gender = "Laki-laki";
    const religion = "Islam";
    const address = "Jl. Raya";

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
        phoneNumber: "081299567890",
      }),

      credentials: "include",
    });

    const data = await fetch("http://localhost:3005/api/v1/auth/login", {
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
    const { token, user } = await response.data;

    const { statusCode, body } = await supertest(listen)
      .put("/api/v1/profiles")
      .set("Authorization", token)
      .send({
        identityType,
        identityNumber,
        gender,
        religion,
        address,
      });

    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("data");
    expect(body.status).toBe(true);
    expect(body.message).toBe(
      `Profile updated successfully with id ${user.Profile.id}`
    );
    expect(body.data).toHaveProperty("id");
    expect(body.data).toHaveProperty("phoneNumber");
    expect(body.data).toHaveProperty("identityType");
    expect(body.data).toHaveProperty("identityNumber");
    expect(body.data).toHaveProperty("gender");
    expect(body.data).toHaveProperty("religion");
    expect(body.data).toHaveProperty("address");
    expect(body.data).toHaveProperty("createdAt");
    expect(body.data).toHaveProperty("updatedAt");
    expect(body.data).toHaveProperty("userId");
    expect(body.data.identityType).toBe(identityType);
    expect(body.data.identityNumber).toBe(identityNumber);
    expect(body.data.gender).toBe(gender);
    expect(body.data.religion).toBe(religion);
    expect(body.data.address).toBe(address);
    expect(body.data.userId).toBe(user.id);
  });

  test("Test update profiles failed unauthorized", async () => {
    const identityType = "KTP";
    const identityNumber = "12345678910";
    const gender = "Laki-laki";
    const religion = "Islam";
    const address = "Jl. Raya";

    const { statusCode, body } = await supertest(listen)
      .put("/api/v1/profiles")
      .send({
        identityType,
        identityNumber,
        gender,
        religion,
        address,
      });

    expect(statusCode).toBe(401);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("error");
    expect(body.status).toBe(false);
    expect(body.message).toBe("Unauthorized");
  });

  test("Test update profiles failed", async () => {
    const email = "test@example.com";
    const password = "password123";
    const gender = "Laki-laki";
    const religion = "Islam";
    const address = "Jl. Raya";

    const data = await fetch("http://localhost:3005/api/v1/auth/login", {
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
    const { token } = await response.data;

    const { statusCode, body } = await supertest(listen)
      .put("/api/v1/profiles")
      .set("Authorization", token)
      .send({
        gender,
        religion,
        address,
      });

    expect(statusCode).toBe(400);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("error");
    expect(body.status).toBe(false);
    expect(body.message).toBe("Bad Request");
  });
});
