import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/ApiResponse";
import { userService } from "./user.service";

export const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id!);
  return sendSuccess(res, user, "User profile fetched");
});

export const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(
    req.user!,
    req.params.id!,
    req.body
  );
  return sendSuccess(res, user, "Profile updated");
});
