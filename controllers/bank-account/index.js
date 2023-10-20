import { prisma } from "../../prisma/client/index.js";
import { VSCreateAccount } from "../../validation-schema/index.js";

export const createBankAccount = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, balance } = req.body;

    VSCreateAccount.parse(req.body);

    const bankAccount = await prisma.bankAccounts.create({
      data: {
        name,
        balance,
        userId: user.id,
      },
    });

    res.status(201).json({
      status: true,
      message: "Bank account was created successfully",
      data: bankAccount,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBankAccounts = async (req, res, next) => {
  try {
    const bankAccounts = await prisma.bankAccounts.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
        accountNumber: true,
        balance: true,
        createdAt: true,
        TransactionAsReceiver: {
          select: {
            id: true,
            amount: true,
          },
        },
        TransactionAsSender: {
          select: {
            id: true,
            amount: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (bankAccounts.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Not Found",
        error: "No bank accounts were found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Bank accounts data was retrieved successfully",
      data: bankAccounts,
    });
  } catch (error) {
    next(error);
  }
};
