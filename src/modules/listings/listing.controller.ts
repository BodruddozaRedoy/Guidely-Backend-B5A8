// src/modules/listings/listing.controller.ts
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/ApiResponse";
import * as listingService from "./listing.service";

export const getListings = catchAsync(async (req, res) => {
  const listings = await listingService.getListings(req.query);
  return sendSuccess(res, listings, "Listings fetched");
});

export const getListingById = catchAsync(async (req, res) => {
  const listing = await listingService.getListingById(req.params.id!);
  return sendSuccess(res, listing, "Listing details");
});

// ⬅️ REQUIRED FOR GUIDE DASHBOARD
export const getListingsByGuide = catchAsync(async (req, res) => {
  const listings = await listingService.getListingsByGuide(req.params.guideId!);
  return sendSuccess(res, listings, "Guide listings fetched");
});

export const createListing = catchAsync(async (req, res) => {
  const listing = await listingService.createListing(req.user!.id, req.body);
  return sendSuccess(res, listing, "Listing created", 201);
});

export const updateListing = catchAsync(async (req, res) => {
  const listing = await listingService.updateListing(
    req.user!,
    req.params.id!,
    req.body
  );
  return sendSuccess(res, listing, "Listing updated");
});

export const deleteListing = catchAsync(async (req, res) => {
  await listingService.deleteListing(req.user!, req.params.id!);
  return sendSuccess(res, null, "Listing deleted");
});

export const toggleListingStatus = catchAsync(async (req, res) => {
  const listing = await listingService.toggleListing(req.user!, req.params.id);
  return sendSuccess(res, listing, "Listing status updated");
});


