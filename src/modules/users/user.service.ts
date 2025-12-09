import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { AuthUser } from "../../middlewares/authGuard";

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      profilePic: true,
      languages: true,
      expertise: true,
      dailyRate: true,
      travelPreferences: true,
      createdAt: true,
      updatedAt: true,

      // All listings by this guide
      listings: {
        select: {
          id: true,
          title: true,
          description: true,
          images: true,
          tourFee: true,
          durationDays: true,
          meetingPoint: true,
          city: true,
          country: true,
          category: true,
        },
      },

      // All reviews given to THIS GUIDE
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          tourist: {
            select: {
              id: true,
              name: true,
              profilePic: true,
            },
          },
        },
      },
    },
  });

  if (!user) throw new ApiError(404, "User not found");

  // ------------------------------------------
  // COMPUTED FIELDS (frontend needs these)
  // ------------------------------------------
  const totalTours = user.listings.length;
  const totalReviews = user.reviews.length;

  const rating =
    totalReviews > 0
      ? user.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  return {
    ...user,
    totalTours,
    totalReviews,
    rating,
  };
};

const updateUser = async (auth: AuthUser, userId: string, payload: any) => {
  // Only own profile or admin
  if (auth.id !== userId && auth.role !== "ADMIN") {
    throw new ApiError(403, "You cannot update this user");
  }

  // Allowed editable fields
  const allowedFields = [
    "name",
    "bio",
    "profilePic",
    "languages",
    "expertise",
    "dailyRate",
    "travelPreferences",
  ];

  const data: any = {};

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      data[field] = payload[field];
    }
  });

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return updated;
};

export const userService = {
  getUserById,
  updateUser,
};
