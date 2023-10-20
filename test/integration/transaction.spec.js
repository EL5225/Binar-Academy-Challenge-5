import supertest from "supertest";
import app from "../../app.js";
import { prisma } from "../../prisma/client/index.js";

const listen = app.listen(3007);

afterAll(async () => {
  await prisma.users.delete({ where: { email: "test@example.com" } });
});

describe("Test POST /api/v1/transaction endpoint", () => {
  const name = "Test transaction";
  const email = "test@example.com";
  const password = "password123";
  const confirm_password = "password123";
  const account_name = "Test account name";
  const balance = 1000000;
  let sourceAccountNumber = "";
  let destinationAccountNumber = "";
  let tokenAuth = "";
  beforeAll(async () => {
    await supertest(listen).post("/api/v1/auth/register").send({
      name,
      email,
      password,
      confirm_password,
      phoneNumber: "081299567890",
    });

    const res = await supertest(listen).post("/api/v1/auth/login").send({
      email,
      password,
    });
    const { token } = await res.body.data;
    tokenAuth = token;

    const source = await supertest(listen)
      .post("/api/v1/accounts")
      .set("Authorization", token)
      .send({
        name: account_name,
        balance,
      });
    const resSource = await source.body.data;
    sourceAccountNumber = resSource.accountNumber;

    const destination = await supertest(listen)
      .post("/api/v1/accounts")
      .set("Authorization", token)
      .send({
        name: account_name,
        balance,
      });
    const resDestination = await destination.body.data;
    destinationAccountNumber = resDestination.accountNumber;
  });
  test("Test create transaction success", async () => {
    const { statusCode, body } = await supertest(listen)
      .post("/api/v1/transactions")
      .set("Authorization", tokenAuth)
      .send({
        sourceAccountNumber,
        destinationAccountNumber,
        amount: 100000,
      });

    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("data");
    expect(body.status).toBe(true);
    expect(body.message).toBe("Transaction was successfull");
    expect(body.data).toHaveProperty("id");
    expect(body.data).toHaveProperty("sourceAccountNumber");
    expect(body.data).toHaveProperty("destinationAccountNumber");
    expect(body.data).toHaveProperty("amount");
    expect(body.data).toHaveProperty("createdAt");
    expect(body.data).toHaveProperty("sourceAccount");
    expect(body.data).toHaveProperty("destinationAccount");
    expect(body.data.sourceAccountNumber).toBe(sourceAccountNumber);
    expect(body.data.destinationAccountNumber).toBe(destinationAccountNumber);
    expect(body.data.amount).toBe(100000);
    expect(body.data.sourceAccount).toHaveProperty("name");
    expect(body.data.destinationAccount).toHaveProperty("name");
  });

  test("Test create transaction failed same account number", async () => {
    const { statusCode, body } = await supertest(listen)
      .post("/api/v1/transactions")
      .set("Authorization", tokenAuth)
      .send({
        sourceAccountNumber: destinationAccountNumber,
        destinationAccountNumber,
        amount: 100000,
      });

    expect(statusCode).toBe(400);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("error");
    expect(body.status).toBe(false);
    expect(body.message).toBe("Bad Request");
    expect(body.error).toBe(
      "Source and destination account cannot be the same"
    );
  });

  test("Test create transaction failed invalid account number", async () => {
    const { statusCode, body } = await supertest(listen)
      .post("/api/v1/transactions")
      .set("Authorization", tokenAuth)
      .send({
        sourceAccountNumber: "invalid",
        destinationAccountNumber,
        amount: 100000,
      });
    expect(statusCode).toBe(400);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("error");
    expect(body.status).toBe(false);
    expect(body.message).toBe("Bad Request");
    expect(body.error).toBe(
      "Source account number does not exist in your user account"
    );
  });

  test("Test create transaction failed invalid amount", async () => {
    const { statusCode, body } = await supertest(listen)
      .post("/api/v1/transactions")
      .set("Authorization", tokenAuth)
      .send({
        sourceAccountNumber,
        destinationAccountNumber,
        amount: -100000,
      });
    expect(statusCode).toBe(400);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("error");
    expect(body.error).toHaveProperty("name");
    expect(body.error).toHaveProperty("detail");
    expect(body.status).toBe(false);
    expect(body.message).toBe("Bad Request");
    expect(body.error.detail).toBe("Amount cannot be empty");
  });
});

describe("Test GET /api/v1/transactions endpoint", () => {
  let id;
  test("Test get all transactions success", async () => {
    const { statusCode, body } = await supertest(listen).get(
      "/api/v1/transactions"
    );
    id = body.data[0].id;

    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("data");
    expect(body.data[0]).toHaveProperty("id");
    expect(body.data[0]).toHaveProperty("sourceAccount");
    expect(body.data[0]).toHaveProperty("destinationAccount");
    expect(body.data[0]).toHaveProperty("amount");
    expect(body.data[0]).toHaveProperty("createdAt");
    expect(body.data[0].sourceAccount).toHaveProperty("name");
    expect(body.data[0].sourceAccount).toHaveProperty("accountNumber");
    expect(body.data[0].destinationAccount).toHaveProperty("name");
    expect(body.data[0].destinationAccount).toHaveProperty("accountNumber");
  });

  test("Test get transactions by id", async () => {
    const { statusCode, body } = await supertest(listen).get(
      `/api/v1/transactions/${id}`
    );

    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("data");
    expect(body.data).toHaveProperty("id");
    expect(body.data).toHaveProperty("sourceAccount");
    expect(body.data).toHaveProperty("destinationAccount");
    expect(body.data).toHaveProperty("amount");
    expect(body.data).toHaveProperty("createdAt");
  });
});
