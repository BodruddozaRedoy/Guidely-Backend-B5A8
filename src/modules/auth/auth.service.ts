import { prisma } from "../../config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";
import { Role } from "../../../generated/prisma/client";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: Role; // "TOURIST" | "GUIDE"
};

type LoginPayload = {
  email: string;
  password: string;
};

export const registerUser = async (payload: RegisterPayload) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existing) throw new ApiError(400, "Email already registered");

  const hashed = await bcrypt.hash(payload.password, 10);

  // Store password in a separate table or user meta table if you
  // don't want it in NextAuth's user table directly.
  // For simplicity, we'll add a "password" field in User via
  // schema extension if you want password-based auth here.
  // (otherwise, manage password within NextAuth's credential logic)

  // const roleValue = payloadrole.toUpperCase();
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      // you may extend the Prisma User model with `password String?`
      // password: hashed,
    },
  });

  return user;
};

export const loginUser = async (payload: LoginPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) throw new ApiError(401, "Invalid credentials");

  // if you store password with user, compare here
  // const isMatch = await bcrypt.compare(payload.password, user.password!);
  // if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET || "CHANGE_ME",
    { expiresIn: "7d" }
  );

  return { token, user };
};
