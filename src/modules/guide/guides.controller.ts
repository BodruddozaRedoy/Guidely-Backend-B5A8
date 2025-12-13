// guides.controller.ts
import { prisma } from "../../config/prisma";
import { sendSuccess } from "../../utils/ApiResponse";
import { catchAsync } from "../../utils/catchAsync";

export const getAllGuides = catchAsync(async (req, res) => {
  const guides = await prisma.user.findMany({
    where: { role: "GUIDE" },
    select: {
      id: true,
      name: true,
      profilePic: true,
      languages: true,
      expertise: true,
      dailyRate: true,
      reviews: true,
      listings: true,
    },
  });

  return sendSuccess(res, guides, "Guides fetched");
});
