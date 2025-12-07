import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { createReview } from "./review.controller";

const router = Router();

router.post("/", authGuard(["TOURIST"]), createReview);

export { router as reviewRouter };
