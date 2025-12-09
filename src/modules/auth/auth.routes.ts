// src/modules/auth/auth.routes.ts
import { Router } from "express";
import { register, login, google } from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", google); // POST /api/auth/google

export { router as authRouter };
