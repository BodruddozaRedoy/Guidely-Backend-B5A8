// src/routes/index.ts
import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { userRouter } from "../modules/users/user.routes";
import { listingRouter } from "../modules/listings/listing.routes";
import { bookingRouter } from "../modules/bookings/booking.routes";
import { reviewRouter } from "../modules/reviews/review.routes";
import { paymentRouter } from "../modules/payments/payment.routes";
import { adminRouter } from "../modules/admin/admin.routes";
import { guidesRouter } from "../modules/guide/guides.route";

const router = Router();

// From your docs
router.use("/auth", authRouter); // /api/auth/register, /api/auth/login
router.use("/users", userRouter); // /api/users/:id
router.use("/listings", listingRouter); // /api/listings...
router.use("/bookings", bookingRouter); // /api/bookings...
router.use("/reviews", reviewRouter); // /api/reviews...
router.use("/payments", paymentRouter); // /api/payments/booking etc.
router.use("/admin", adminRouter);
router.use("/guides", guidesRouter);

export default router;
