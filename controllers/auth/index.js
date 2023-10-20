import { getAllProfiles, getAllUsers } from "../../helpers/index.js";
import { prisma } from "../../prisma/client/index.js";
import { VSCreateUsers, VSLogin } from "../../validation-schema/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const { JWT_SECRET_KEY } = process.env;
export const register = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password, confirm_password } = req.body;

    VSCreateUsers.parse(req.body);

    if (password !== confirm_password) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        error: "Passwords do not match",
      });
    }

    const users = await getAllUsers();
    if (users.find((user) => user.email === email)) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        error: "Email already exists",
      });
    }

    const profiles = await getAllProfiles();
    if (profiles.find((profile) => profile.phoneNumber === phoneNumber)) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        error: "Phone number already exists",
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: encryptedPassword,
        Profile: {
          create: {
            phoneNumber,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        Profile: true,
      },
    });

    res.status(201).json({
      status: true,
      message: "Register successfull",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    VSLogin.parse(req.body);

    const user = await prisma.users.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        Profile: true,
      },
    });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        error: "email or password is invalid",
      });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        error: "email or password is invalid",
      });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET_KEY);

    res.status(200).json({
      status: true,
      message: "Login successfull",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          Profile: user.Profile,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const authenticateUser = (req, res, next) => {
  try {
    const user = req.user;

    res.status(200).json({
      status: true,
      message: "Authenticated",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
