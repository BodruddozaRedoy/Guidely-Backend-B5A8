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
  role: Role;
};

type LoginPayload = {
  email: string;
  password: string;
};

// --------------------------------------
// REGISTER USER (CUSTOM EMAIL/PASSWORD)
// --------------------------------------
export const registerUser = async (payload: RegisterPayload) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existing) throw new ApiError(400, "Email already registered");

  const hashed = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      passwordHash: hashed, // <-- FIXED
    },
  });

  return user;
};

// --------------------------------------
// LOGIN USER (CUSTOM EMAIL/PASSWORD)
// --------------------------------------
export const loginUser = async (payload: LoginPayload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) throw new ApiError(401, "Invalid credentials");

  if (!user.passwordHash) {
    throw new ApiError(
      401,
      "This account was created with Google. Please use Google Login."
    );
  }

  const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

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

// --------------------------------------
// GOOGLE AUTH
// --------------------------------------
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

type GooglePayload = {
  id_token: string;
};

export const googleSignIn = async (payload: GooglePayload) => {
  const { id_token } = payload;
  if (!id_token) throw new ApiError(400, "id_token is required");

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

  // 1) Check if this Google account is already linked
  const existingAccount = await prisma.account.findFirst({
    where: { provider: "google", providerAccountId },
  });

  let user = null;

  if (existingAccount) {
    user = await prisma.user.findUnique({
      where: { id: existingAccount.userId },
    });
    if (!user) throw new ApiError(500, "Linked user not found");
  } else {
    // 2) Check for existing user by email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      await prisma.account.create({
        data: {
          userId: existingUserByEmail.id,
          type: "oauth",
          provider: "google",
          providerAccountId,
          id_token,
        },
      });

      user = existingUserByEmail;
    } else {
      // 3) Create new user
      user = await prisma.user.create({
        data: {
          name: name ?? undefined,
          email,
          emailVerified: email_verified ? new Date() : null,
          profilePic: picture ?? undefined,
          passwordHash: null, // <---- IMPORTANT: GOOGLE USERS HAVE NO PASSWORD
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

  // Create JWT for your custom auth system
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
