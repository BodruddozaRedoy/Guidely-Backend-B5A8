// src/modules/auth/auth.service.ts
import { prisma } from "../../config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../../utils/ApiError";
import { OAuth2Client } from "google-auth-library";
import fetch from "node-fetch"; // node 18+ has fetch global; keep for clarity

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  console.warn(
    "GOOGLE_CLIENT_ID not set. Google sign-in will fail until it's set."
  );
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Helper: issue JWT
 */
function issueJwt(user: any) {
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET || "CHANGE_ME",
    { expiresIn: "7d" }
  );
  return token;
}

/**
 * Register user (email/password)
 * Expects { name, email, password, role }
 */
type RegisterPayload = {
  name?: string;
  email: string;
  password: string;
  role?: string;
};

export const registerUser = async (payload: RegisterPayload) => {
  const { name, email, password, role } = payload;
  if (!email || !password)
    throw new ApiError(400, "Email and password required");

  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) throw new ApiError(400, "Email already registered");

  const hashed = await bcrypt.hash(password, 10);

  // Create user and store hashed password in passwordHash field (assuming your schema has it)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashed,
      role: (role as any) || undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // issue token for convenience similar to login
  const token = issueJwt(user);
  return { token, user };
};

/**
 * Login user (email/password)
 * Expects { email, password }
 */
type LoginPayload = {
  email: string;
  password: string;
};

export const loginUser = async (payload: LoginPayload) => {
  const { email, password } = payload;
  if (!email || !password)
    throw new ApiError(400, "Email and password required");

  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user || !user.passwordHash)
    throw new ApiError(401, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const token = issueJwt(user);
  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
};

/**
 * Google Sign-in
 * Expects { id_token }
 *
 * Verifies ID token with google-auth-library.
 * If the Account exists -> sign-in as that user.
 * Else if a User with same email exists -> link account and sign-in.
 * Else -> create new User + Account and sign-in.
 */
type GooglePayload = {
  id_token: string;
};

export const googleSignIn = async (payload: GooglePayload) => {
  const { id_token } = payload;
  if (!id_token) throw new ApiError(400, "id_token is required");

  // Verify token with google-auth-library and log detailed errors on failure
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID,
    });
  } catch (err: any) {
    // Detailed server-side logging to help debugging
    console.error(
      "[auth.service] verifyIdToken failed:",
      err?.name,
      err?.message
    );
    try {
      // fallback to Google's tokeninfo endpoint for more info
      const infoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
          id_token
        )}`
      );
      const infoJson = await infoRes.json();
      console.error(
        "[auth.service] tokeninfo response:",
        infoJson,
        "status:",
        infoRes.status
      );
    } catch (fetchErr) {
      console.error("[auth.service] tokeninfo fetch failed:", fetchErr);
    }
    throw new ApiError(400, "Invalid Google id_token");
  }

  const payloadData = ticket.getPayload();
  if (!payloadData) throw new ApiError(400, "Invalid Google token payload");

  const providerAccountId = payloadData.sub;
  const email = payloadData.email;
  const name = payloadData.name ?? undefined;
  const picture = payloadData.picture ?? undefined;
  const email_verified = payloadData.email_verified ?? false;

  if (!providerAccountId) throw new ApiError(400, "Google token missing sub");
  if (!email) throw new ApiError(400, "Google account has no email");

  // 1) find existing account by provider id
  let account = await prisma.account.findFirst({
    where: { provider: "google", providerAccountId },
  });

  let user: any = null;

  if (account) {
    // load user
    user = await prisma.user.findUnique({ where: { id: account.userId } });
    if (!user) throw new ApiError(500, "Linked user not found");
  } else {
    // no account linked: see if a user exists with same email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      // Link provider account to existing user
      // Optionally require existingUserByEmail.emailVerified === true before linking
      account = await prisma.account.create({
        data: {
          userId: existingUserByEmail.id,
          type: "oauth",
          provider: "google",
          providerAccountId,
          id_token, // store for reference (optional)
        },
      });
      user = existingUserByEmail;
    } else {
      // Create a fresh user + account
      user = await prisma.user.create({
        data: {
          name,
          email,
          emailVerified: email_verified ? new Date() : null,
          image: picture,
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

  // issue JWT
  const token = issueJwt(user);

  // return shaped response similar to loginUser
  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
};
