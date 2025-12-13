// guides.routes.ts
import { Router } from "express";
import { getAllGuides } from "./guides.controller";

const router = Router();

router.get("/", getAllGuides);

export { router as guidesRouter };
