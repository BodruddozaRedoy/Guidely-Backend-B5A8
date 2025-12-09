// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/ApiResponse";
import * as authService from "./auth.service";

/**
 * Register controller
 */
export const register = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const userOrResult = await authService.registerUser(req.body);
    return sendSuccess(res, userOrResult, "User registered successfully", 201);
  }
);

/**
 * Login controller
 */
export const login = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await authService.loginUser(req.body);
    return sendSuccess(res, result, "Login successful");
  }
);

/**
 * Google sign-in controller
 * Expects body: { id_token: string }
 */
export const google = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await authService.googleSignIn(req.body);
    return sendSuccess(res, result, "Google sign-in successful");
  }
);
