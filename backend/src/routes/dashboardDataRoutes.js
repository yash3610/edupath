import express from "express";
import {
  appendDashboardDatasetItem,
  getDashboardDataset,
  listDashboardDatasets,
  updateDashboardDataset,
} from "../controllers/dashboardDataController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/:role", listDashboardDatasets);
router.get("/:role/:key", getDashboardDataset);
router.put("/:role/:key", updateDashboardDataset);
router.post("/:role/:key/items", appendDashboardDatasetItem);

export default router;
