import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { payForBooking, webhookHandler } from "./payment.controller";

const router = Router();

router.post("/booking", authGuard(["TOURIST"]), payForBooking);
router.post("/webhook", webhookHandler);

export { router as paymentRouter };
