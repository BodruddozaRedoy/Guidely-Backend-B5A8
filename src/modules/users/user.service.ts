import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { AuthUser } from "../../middlewares/authGuard";

 const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      listings: true,
      bookingsAsTourist: true,
      bookingsAsGuide: true,
      reviewsWritten: true
    }
  });

  if (!user) throw new ApiError(404, "User not found");
  return user;
};

 const updateUser = async (
  auth: AuthUser,
  userId: string,
  payload: any
) => {
  if (auth.id !== userId && auth.role !== "ADMIN") {
    throw new ApiError(403, "You cannot update this user");
  }

  return prisma.user.update({
    where: { id: userId },
    data: payload
  });
};


export const userService = {
    updateUser, 
    getUserById
}