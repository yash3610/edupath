import { DashboardDataset } from "../models/index.js";
import { validateDashboardFormat } from "../services/dashboardDataService.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const ok = (res, data, message = "OK") => res.json({ success: true, message, data });

function requestedRole(req) {
  const role = req.params.role || req.user.role;
  if (req.user.role !== "admin" && role !== req.user.role) {
    throw new ApiError(403, "You cannot access another dashboard role");
  }
  return role;
}

export const listDashboardDatasets = asyncHandler(async (req, res) => {
  const role = requestedRole(req);
  const datasets = await DashboardDataset.find({ role }).select("role key valueType source version updatedAt").sort({ key: 1 }).lean();
  ok(res, datasets);
});

export const getDashboardDataset = asyncHandler(async (req, res) => {
  const role = requestedRole(req);
  const dataset = await DashboardDataset.findOne({ role, key: req.params.key }).lean();
  if (!dataset) throw new ApiError(404, "Dashboard dataset not found");
  ok(res, dataset.data);
});

export const updateDashboardDataset = asyncHandler(async (req, res) => {
  const role = requestedRole(req);
  const dataset = await DashboardDataset.findOne({ role, key: req.params.key });
  if (!dataset) throw new ApiError(404, "Dashboard dataset not found");
  validateDashboardFormat(req.body.data, dataset.format);
  dataset.data = req.body.data;
  dataset.version += 1;
  await dataset.save();
  ok(res, dataset.data, "Dashboard dataset updated");
});

export const appendDashboardDatasetItem = asyncHandler(async (req, res) => {
  const role = requestedRole(req);
  const dataset = await DashboardDataset.findOne({ role, key: req.params.key });
  if (!dataset) throw new ApiError(404, "Dashboard dataset not found");
  if (dataset.valueType !== "array") throw new ApiError(400, "Items can only be added to array datasets");
  const next = [...dataset.data, req.body];
  validateDashboardFormat(next, dataset.format);
  dataset.data = next;
  dataset.version += 1;
  await dataset.save();
  ok(res, req.body, "Dashboard item added");
});
