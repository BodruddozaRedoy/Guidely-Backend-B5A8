// src/modules/listings/listing.controller.ts
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/ApiResponse";
import * as listingService from "./listing.service";

export const getListings = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const listings = await listingService.getListings(req.query);
    return sendSuccess(res, listings, "Listings fetched");
  }
);

export const getListingById = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const listing = await listingService.getListingById(req.params.id);
    return sendSuccess(res, listing, "Listing details");
  }
);

export const createListing = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const listing = await listingService.createListing(req.user!.id, req.body);
    return sendSuccess(res, listing, "Listing created", 201);
  }
);

export const updateListing = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const listing = await listingService.updateListing(
      req.user!,
      req.params.id,
      req.body
    );
    return sendSuccess(res, listing, "Listing updated");
  }
);

export const deleteListing = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    await listingService.deleteListing(req.user!, req.params.id);
    return sendSuccess(res, null, "Listing deleted");
  }
);
