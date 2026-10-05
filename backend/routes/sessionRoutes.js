import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
} from "../controllers/sessionController.js";

const router = Router();

router.get("/", asyncHandler(getSessions));
router.get("/:id", asyncHandler(getSessionById));
router.post("/", asyncHandler(createSession));
router.put("/:id", asyncHandler(updateSession));

export default router;
