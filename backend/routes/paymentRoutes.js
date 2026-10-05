import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import { getPayments, getPaymentById } from "../controllers/paymentController.js";

const router = Router();

router.get("/", asyncHandler(getPayments));
router.get("/:id", asyncHandler(getPaymentById));

export default router;
