import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { AuthUser } from "../../middlewares/authGuard";

const createReview = async (user: AuthUser, payload: any) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId }
  });

  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.touristId !== user.id) {
    throw new ApiError(403, "Only the tourist can review");
  }

  if (booking.status !== "COMPLETED") {
    throw new ApiError(400, "Cannot review until tour is completed");
  }

  return prisma.review.create({
    data: {
      rating: payload.rating,
      comment: payload.comment,
      touristId: user.id,
      guideId: booking.guideId,
      listingId: booking.listingId
    }
  });
};

export const reviewService = {
    createReview
}
