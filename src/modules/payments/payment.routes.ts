import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import { payForBooking } from "./payment.controller";

const router = Router();

router.post("/booking", authGuard(["TOURIST"]), payForBooking);

export { router as paymentRouter };
