import supertest from "supertest";
import app from "../../app.js";
import { prisma } from "../../prisma/client/index.js";

const listen = app.listen(3006);

afterAll(async () => {
  await prisma.users.delete({ where: { email: "test@example.com" } });
});

describe("Test /api/v1/accounts endpoint", () => {
  test("Test create bank account", async () => {
    const name = "Test bank account";
    const email = "test@example.com";
    const password = "password123";
    const confirm_password = "password123";
    const account_name = "Test account name";
    const balance = 1000000;

    await fetch("http://localhost:3006/api/v1/auth/register", {
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

    const data = await fetch("http://localhost:3006/api/v1/auth/login", {
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
      .post("/api/v1/accounts")
      .set("Authorization", token)
      .send({
        name: account_name,
        balance,
      });

    expect(statusCode).toBe(201);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("data");
    expect(body.status).toBe(true);
    expect(body.message).toBe("Bank account was created successfully");
    expect(body.data).toHaveProperty("id");
    expect(body.data).toHaveProperty("accountNumber");
    expect(body.data).toHaveProperty("name");
    expect(body.data).toHaveProperty("balance");
    expect(body.data).toHaveProperty("createdAt");
    expect(body.data).toHaveProperty("userId");
    expect(body.data.name).toBe(account_name);
    expect(body.data.balance).toBe(balance);
    expect(body.data.userId).toBe(user.id);
  });

  test("Test get all bank accounts", async () => {
    const { statusCode, body } = await supertest(listen).get(
      "/api/v1/accounts"
    );

    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("data");
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.status).toBe(true);
    expect(body.message).toBe("Bank accounts data was retrieved successfully");
    expect(body.data[0]).toHaveProperty("id");
    expect(body.data[0]).toHaveProperty("accountNumber");
    expect(body.data[0]).toHaveProperty("name");
    expect(body.data[0]).toHaveProperty("balance");
    expect(body.data[0]).toHaveProperty("createdAt");
    expect(body.data[0]).toHaveProperty("user");
    expect(body.data[0]).toHaveProperty("TransactionAsReceiver");
    expect(body.data[0]).toHaveProperty("TransactionAsSender");
  });
});
