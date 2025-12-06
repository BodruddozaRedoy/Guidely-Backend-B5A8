export class ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;

  constructor(data: T, message = "Success") {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}

export const sendSuccess = <T>(
  res: import("express").Response,
  data: T,
  message?: string,
  statusCode = 200
) => {
  return res.status(statusCode).json(new ApiResponse(data, message));
};
