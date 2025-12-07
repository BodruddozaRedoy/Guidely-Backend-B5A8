import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import {
  createBooking,
  updateBookingStatus,
  getBookingById,
  getMyBookings
} from "./booking.controller";

const router = Router();

// Tourist creates booking
router.post("/", authGuard(["TOURIST"]), createBooking);

// Guide accepts/rejects
router.patch("/:id", authGuard(["GUIDE"]), updateBookingStatus);

// Fetch single booking
router.get("/:id", authGuard(), getBookingById);

// My bookings (tourist or guide)
router.get("/", authGuard(), getMyBookings);

export { router as bookingRouter };
