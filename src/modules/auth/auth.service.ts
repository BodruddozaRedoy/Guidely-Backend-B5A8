import { prisma } from "../../config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";
import { Role } from "../../../generated/prisma/client";
import { OAuth2Client } from "google-auth-library";

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

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

type GooglePayload = {
  id_token: string;
};

export const googleSignIn = async (payload: GooglePayload) => {
  const { id_token } = payload;
  if (!id_token) throw new ApiError(400, "id_token is required");

  // verify id_token
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (err) {
    throw new ApiError(400, "Invalid Google id_token");
  }

  const tokenPayload = ticket.getPayload();
  if (!tokenPayload) throw new ApiError(400, "Invalid Google token payload");

  const {
    sub: providerAccountId,
    email,
    name,
    picture,
    email_verified,
  } = tokenPayload as any;

  if (!providerAccountId)
    throw new ApiError(400, "Google token missing subject (sub)");
  if (!email) throw new ApiError(400, "Google account has no email");

  // 1) Try to find an Account for this google provider id
  const existingAccount = await prisma.account.findFirst({
    where: { provider: "google", providerAccountId },
  });

  let user = null;

  if (existingAccount) {
    // load the associated user
    user = await prisma.user.findUnique({
      where: { id: existingAccount.userId },
    });
    if (!user) throw new ApiError(500, "Linked user not found");
  } else {
    // No account record for this google account
    // 2) See if a user exists with same email -> link account
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      // Optionally: require existingUserByEmail.emailVerified before linking
      // Link google account to existing user
      await prisma.account.create({
        data: {
          userId: existingUserByEmail.id,
          type: "oauth",
          provider: "google",
          providerAccountId,
          id_token,
          // optionally store other token fields if available, e.g., access_token
        },
      });
      user = existingUserByEmail;
    } else {
      // 3) Create new user + account
      user = await prisma.user.create({
        data: {
          name: name ?? undefined,
          email,
          emailVerified: email_verified ? new Date() : null,
          image: picture ?? undefined,
          // role will default to TOURIST per your schema
          accounts: {
            create: {
              type: "oauth",
              provider: "google",
              providerAccountId,
              id_token,
            },
          },
        },
      });
    }
  }

  // issue JWT token compatible with your loginUser
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
