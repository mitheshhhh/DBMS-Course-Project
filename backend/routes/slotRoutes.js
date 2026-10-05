import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { getSlots, getSlotById } from "../controllers/slotController.js";

const router = Router();

router.get("/", asyncHandler(getSlots));
router.get("/:id", asyncHandler(getSlotById));

export default router;
