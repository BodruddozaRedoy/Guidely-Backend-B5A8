import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/ApiResponse";
import * as bookingService from "./booking.service";

export const createBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.createBooking(req.user!, req.body);
  return sendSuccess(res, booking, "Booking request created", 201);
});

export const updateBookingStatus = catchAsync(async (req, res) => {
  const booking = await bookingService.updateBookingStatus(
    req.user!,
    req.params.id!,
    req.body.status
  );
  return sendSuccess(res, booking, "Booking updated");
});

export const getBookingById = catchAsync(async (req, res) => {
  const booking = await bookingService.getBookingById(req.user!, req.params.id!);
  return sendSuccess(res, booking, "Booking fetched");
});

export const getMyBookings = catchAsync(async (req, res) => {
  const bookings = await bookingService.getMyBookings(req.user!);
  return sendSuccess(res, bookings, "My bookings fetched");
});
