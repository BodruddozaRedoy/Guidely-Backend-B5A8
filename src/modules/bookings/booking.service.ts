import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { AuthUser } from "../../middlewares/authGuard";

export const createBooking = async (user: AuthUser, payload: any) => {
  const listing = await prisma.listing.findUnique({
    where: { id: payload.listingId }
  });

  if (!listing) throw new ApiError(404, "Listing not found");

  if (listing.guideId === user.id) {
    throw new ApiError(400, "You cannot book your own listing");
  }

  return prisma.booking.create({
    data: {
      listingId: payload.listingId,
      touristId: user.id,
      guideId: listing.guideId,
      requestedDate: new Date(payload.requestedDate),
      totalPrice: listing.tourFee
    }
  });
};

export const updateBookingStatus = async (
  user: AuthUser,
  bookingId: string,
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.guideId !== user.id) {
    throw new ApiError(403, "You cannot update this booking");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status }
  });
};

export const getBookingById = async (user: AuthUser, id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      listing: true,
      tourist: true,
      guide: true
    }
  });

  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.touristId !== user.id && booking.guideId !== user.id) {
    throw new ApiError(403, "Not authorized");
  }

  return booking;
};

export const getMyBookings = async (user: AuthUser) => {
  return prisma.booking.findMany({
    where: {
      OR: [
        { touristId: user.id },
        { guideId: user.id }
      ]
    },
    include: { listing: true }
  });
};
