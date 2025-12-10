// src/modules/listings/listing.service.ts
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { AuthUser } from "../../middlewares/authGuard";

export const getListings = async (query: any) => {
  return prisma.listing.findMany({
    where: {
      isActive: true,
      city: query.city || undefined,
      language: query.language || undefined,
      category: query.category || undefined,
      tourFee: {
        gte: query.minPrice ? Number(query.minPrice) : undefined,
        lte: query.maxPrice ? Number(query.maxPrice) : undefined,
      },
    },
    include: {
      guide: true,
      reviews: true,
    },
  });
};

export const getListingById = async (id: string) => {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      guide: true,
      reviews: true,
    },
  });

  if (!listing) throw new ApiError(404, "Listing not found");
  return listing;
};

// ⬅️ REQUIRED FOR GUIDE DASHBOARD
export const getListingsByGuide = async (guideId: string) => {
  return prisma.listing.findMany({
    where: { guideId },
    include: {
      guide: true,
      reviews: true,
    },
  });
};

export const createListing = async (guideId: string, payload: any) => {
  return prisma.listing.create({
    data: {
      guideId,
      title: payload.title,
      description: payload.description,
      itinerary: payload.itinerary,
      tourFee: payload.tourFee,
      durationDays: payload.durationDays,
      meetingPoint: payload.meetingPoint,
      maxGroupSize: payload.maxGroupSize,
      city: payload.city,
      country: payload.country,
      language: payload.language,
      category: payload.category,
      images: payload.images ?? [],
    },
  });
};

export const updateListing = async (
  user: AuthUser,
  listingId: string,
  payload: any
) => {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new ApiError(404, "Listing not found");

  if (user.role !== "ADMIN" && listing.guideId !== user.id) {
    throw new ApiError(403, "You cannot update this listing");
  }

  return prisma.listing.update({
    where: { id: listingId },
    data: payload,
  });
};

export const deleteListing = async (user: AuthUser, listingId: string) => {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) throw new ApiError(404, "Listing not found");

  if (user.role !== "ADMIN" && listing.guideId !== user.id) {
    throw new ApiError(403, "You cannot delete this listing");
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: { isActive: false },
  });
};
