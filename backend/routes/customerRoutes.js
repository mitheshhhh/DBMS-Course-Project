import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";

const router = Router();

router.get("/", asyncHandler(getCustomers));
router.get("/:id", asyncHandler(getCustomerById));
router.post("/", asyncHandler(createCustomer));
router.put("/:id", asyncHandler(updateCustomer));
router.delete("/:id", asyncHandler(deleteCustomer));

export default router;
