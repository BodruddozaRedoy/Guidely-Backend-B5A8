import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

/* ---------------- USERS ---------------- */
export const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const banUser = async (id: string) => {
  const user = await prisma.user.update({
    where: { id },
    data: { role: "BANNED" as any }, // If no banned role, add one or create `isBanned`
  });
  return user;
};

/* ---------------- TOURS ---------------- */
export const getAllTours = async () => {
  return prisma.listing.findMany({
    include: {
      guide: true,
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getTourById = async (id: string) => {
  const tour = await prisma.listing.findUnique({
    where: { id },
    include: { guide: true, reviews: true },
  });

  if (!tour) throw new ApiError(404, "Tour not found");
  return tour;
};

export const deleteTour = async (id: string) => {
  await prisma.listing.delete({ where: { id } });
};

export const toggleTourStatus = async (id: string) => {
  const tour = await prisma.listing.findUnique({ where: { id } });
  if (!tour) throw new ApiError(404, "Tour not found");

  return prisma.listing.update({
    where: { id },
    data: { isActive: !tour.isActive },
  });
};

/* ---------------- BOOKINGS ---------------- */
export const getAllBookings = async () => {
  return prisma.booking.findMany({
    include: {
      listing: true,
      tourist: true,
      guide: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const cancelBooking = async (id: string) => {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new ApiError(404, "Booking not found");

  return prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
};
