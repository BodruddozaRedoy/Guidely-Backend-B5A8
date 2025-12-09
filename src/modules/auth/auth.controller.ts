import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/ApiResponse";
import * as authService from "./auth.service";
import { googleSignIn } from "./auth.service";

export const register = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await authService.registerUser(req.body);
    return sendSuccess(res, user, "User registered successfully", 201);
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await authService.loginUser(req.body);
    return sendSuccess(res, result, "Login successful");
  }
);

export const google = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await googleSignIn(req.body); // expects { id_token }
    return sendSuccess(res, result, "Google sign-in successful");
  }
);
