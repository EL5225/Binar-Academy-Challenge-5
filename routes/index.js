import { Router } from "express";
import {
  createBankAccount,
  getAllBankAccounts,
  getUsers,
  updateProfiles,
  createTransaction,
  getAllTransactions,
  register,
  login,
  authenticateUser,
  getTransactionById,
} from "../controllers/index.js";
import { authenticated } from "../middlewares/index.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Hello! Welcome to API",
  });
});

// Auth
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/authenticate", authenticated, authenticateUser);

// Users
router.get("/users", getUsers);

// Profiles
router.put("/profiles", authenticated, updateProfiles);

// Bank Accounts
router.post("/accounts", authenticated, createBankAccount);
router.get("/accounts", getAllBankAccounts);

// Transactions
router.post("/transactions", authenticated, createTransaction);
router.get("/transactions", getAllTransactions);
router.get("/transactions/:transaction", getTransactionById);

export default router;
