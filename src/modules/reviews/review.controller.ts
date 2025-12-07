import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/ApiResponse";
import { reviewService } from "./review.service";

export const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(req.user!, req.body);
  return sendSuccess(res, review, "Review submitted", 201);
});
