import { DashboardDataset } from "../models/index.js";
import { validateDashboardFormat } from "../services/dashboardDataService.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const ok = (res, data, message = "OK") => {
  res.set("Cache-Control", "no-store");
  return res.json({ success: true, message, data });
};
const allowedRoles = new Set(["admin", "instructor", "student"]);

function requestedRole(req) {
  const role = req.params.role || req.user.role;
  if (!allowedRoles.has(role)) throw new ApiError(400, "Invalid dashboard role");
  if (req.user.role !== "admin" && role !== req.user.role) {
    throw new ApiError(403, "You cannot access another dashboard role");
  }
  return role;
}

function requestedKey(req) {
  const key = String(req.params.key || "");
  if (!/^[A-Za-z][A-Za-z0-9]{0,63}$/.test(key)) throw new ApiError(400, "Invalid dashboard dataset key");
  return key;
}

export const listDashboardDatasets = asyncHandler(async (req, res) => {
  const role = requestedRole(req);
  const datasets = await DashboardDataset.find({ role }).select("role key valueType source version updatedAt").sort({ key: 1 }).lean();
  ok(res, datasets);
});

export const getDashboardSnapshot = asyncHandler(async (req, res) => {
  const role = requestedRole(req);
  const datasets = await DashboardDataset.find({ role }).select("key data version updatedAt").sort({ key: 1 }).lean();
  ok(res, {
    role,
    datasets: Object.fromEntries(datasets.map((dataset) => [dataset.key, dataset.data])),
    versions: Object.fromEntries(datasets.map((dataset) => [dataset.key, dataset.version])),
  });
});

export const getDashboardDataset = asyncHandler(async (req, res) => {
  const role = requestedRole(req);
  const dataset = await DashboardDataset.findOne({ role, key: requestedKey(req) }).lean();
  if (!dataset) throw new ApiError(404, "Dashboard dataset not found");
  ok(res, dataset.data);
});

export const updateDashboardDataset = asyncHandler(async (req, res) => {
  const role = requestedRole(req);
  if (!Object.prototype.hasOwnProperty.call(req.body, "data")) throw new ApiError(400, "data is required");
  const dataset = await DashboardDataset.findOne({ role, key: requestedKey(req) });
  if (!dataset) throw new ApiError(404, "Dashboard dataset not found");
  validateDashboardFormat(req.body.data, dataset.format);
  dataset.data = req.body.data;
  dataset.version += 1;
  dataset.updatedBy = req.user._id;
  await dataset.save();
  ok(res, dataset.data, "Dashboard dataset updated");
});

export const appendDashboardDatasetItem = asyncHandler(async (req, res) => {
  const role = requestedRole(req);
  const dataset = await DashboardDataset.findOne({ role, key: requestedKey(req) });
  if (!dataset) throw new ApiError(404, "Dashboard dataset not found");
  if (dataset.valueType !== "array") throw new ApiError(400, "Items can only be added to array datasets");
  const next = [...dataset.data, req.body];
  validateDashboardFormat(next, dataset.format);
  dataset.data = next;
  dataset.version += 1;
  dataset.updatedBy = req.user._id;
  await dataset.save();
  ok(res, req.body, "Dashboard item added");
});
