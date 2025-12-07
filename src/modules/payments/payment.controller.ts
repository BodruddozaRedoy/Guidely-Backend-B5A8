import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/ApiResponse";
import * as paymentService from "./payment.service";

export const payForBooking = catchAsync(async (req, res) => {
  const data = await paymentService.payForBooking(req.user!, req.body.bookingId);
  return sendSuccess(res, data, "Payment initiated");
});
