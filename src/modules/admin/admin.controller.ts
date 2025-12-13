import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/ApiResponse";
import * as adminService from "./admin.service";

/* ---------------- USERS ---------------- */
export const getAllUsers = catchAsync(async (_, res) => {
  const users = await adminService.getAllUsers();
  return sendSuccess(res, users, "Users fetched");
});

export const getUserById = catchAsync(async (req, res) => {
  const user = await adminService.getUserById(req.params.id);
  return sendSuccess(res, user, "User details fetched");
});

export const banUser = catchAsync(async (req, res) => {
  const updated = await adminService.banUser(req.params.id);
  return sendSuccess(res, updated, "User banned");
});

/* ---------------- TOURS ---------------- */
export const getAllTours = catchAsync(async (_, res) => {
  const tours = await adminService.getAllTours();
  return sendSuccess(res, tours, "Tours fetched");
});

export const getTourById = catchAsync(async (req, res) => {
  const tour = await adminService.getTourById(req.params.id);
  return sendSuccess(res, tour, "Tour details fetched");
});

export const deleteTour = catchAsync(async (req, res) => {
  await adminService.deleteTour(req.params.id);
  return sendSuccess(res, null, "Tour deleted");
});

export const toggleTourStatus = catchAsync(async (req, res) => {
  const updated = await adminService.toggleTourStatus(req.params.id);
  return sendSuccess(res, updated, "Tour status updated");
});

/* ---------------- BOOKINGS ---------------- */
export const getAllBookings = catchAsync(async (_, res) => {
  const bookings = await adminService.getAllBookings();
  return sendSuccess(res, bookings, "Bookings fetched");
});

export const cancelBooking = catchAsync(async (req, res) => {
  const updated = await adminService.cancelBooking(req.params.id);
  return sendSuccess(res, updated, "Booking cancelled");
});
