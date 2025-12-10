// src/modules/listings/listing.routes.ts
import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard";
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getListingsByGuide,
  toggleListingStatus, // ⬅️ add this
} from "./listing.controller";

const router = Router();

// Public search / filter
router.get("/", getListings);
router.get("/:id", getListingById);

// Guide-specific listings (PUBLIC)
router.get("/guide/:guideId", getListingsByGuide); // ⬅️ IMPORTANT
router.patch("/:id/toggle", authGuard(["GUIDE"]), toggleListingStatus);

// Guide-only actions
router.post("/", authGuard(["GUIDE"]), createListing);
router.patch("/:id", authGuard(["GUIDE"]), updateListing);
router.delete("/:id", authGuard(["GUIDE", "ADMIN"]), deleteListing);

export { router as listingRouter };
