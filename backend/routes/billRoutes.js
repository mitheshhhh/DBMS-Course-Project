import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { getBills, getBillById } from "../controllers/billController.js";

const router = Router();

router.get("/", asyncHandler(getBills));
router.get("/:id", asyncHandler(getBillById));

export default router;
