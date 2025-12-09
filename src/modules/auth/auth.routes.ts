import { Router } from "express";
import { register, login, google } from "./auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export { router as authRouter };

router.post("/google", google);
