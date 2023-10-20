import { prisma } from "../../prisma/client/index.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.users.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        Profile: {
          select: {
            id: true,
            phoneNumber: true,
            identityType: true,
            identityNumber: true,
            gender: true,
            religion: true,
            address: true,
          },
        },
      },
    });

    if (users.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Not Found",
        error: "No users were found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Users data retrieved successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
