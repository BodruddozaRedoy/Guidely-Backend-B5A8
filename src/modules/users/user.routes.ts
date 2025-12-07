import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { getUserById, updateUser } from "./user.controller";

const router = Router();

// Public user profile
router.get("/:id", getUserById);

// Logged-in user can update own profile
router.patch("/:id", authGuard(), updateUser);

export { router as userRouter };
