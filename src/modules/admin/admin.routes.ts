import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import * as adminController from "./admin.controller";

const router = Router();

// Allow only ADMIN
router.use(authGuard(["ADMIN"]));

/* ---------------- USERS ---------------- */
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.patch("/users/:id/ban", adminController.banUser);

/* ---------------- TOURS ---------------- */
router.get("/tours", adminController.getAllTours);
router.get("/tours/:id", adminController.getTourById);
router.delete("/tours/:id", adminController.deleteTour);
router.patch("/tours/:id/toggle", adminController.toggleTourStatus);

/* ---------------- BOOKINGS ---------------- */
router.get("/bookings", adminController.getAllBookings);
router.patch("/bookings/:id/cancel", adminController.cancelBooking);

export { router as adminRouter };
