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
  test("Test create transaction", async () => {
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
});
