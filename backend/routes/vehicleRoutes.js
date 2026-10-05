import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js";

const router = Router();

router.get("/", asyncHandler(getVehicles));
router.get("/:id", asyncHandler(getVehicleById));
router.post("/", asyncHandler(createVehicle));
router.put("/:id", asyncHandler(updateVehicle));
router.delete("/:id", asyncHandler(deleteVehicle));

export default router;
