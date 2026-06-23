import { apiRequest } from "./api.js";

const moduleLoaders = {
  admin: () => import("@/features/admin/data/admin"),
  instructor: () => import("@/features/instructor/data/instructor"),
  student: () => import("@/features/student/data/mock"),
};

export async function hydrateDashboardData(role) {
  const loader = moduleLoaders[role];
  if (!loader) throw new Error("Unsupported dashboard role");

  const [module, result] = await Promise.all([
    loader(),
    apiRequest(`/api/dashboard-data/${role}/snapshot`),
  ]);
  const datasets = result.data?.datasets || {};

  Object.entries(datasets).forEach(([key, value]) => {
    const target = module[key];
    if (Array.isArray(target) && Array.isArray(value)) {
      target.splice(0, target.length, ...value);
    } else if (isPlainObject(target) && isPlainObject(value)) {
      Object.keys(target).forEach((field) => delete target[field]);
      Object.assign(target, value);
    }
  });

  return datasets;
}

export async function saveDashboardDataset(role, key, data) {
  const result = await apiRequest(`/api/dashboard-data/${role}/${key}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
  await updateDashboardCache(role, key, result.data);
  return result.data;
}

export async function appendDashboardDatasetItem(role, key, item) {
  const result = await apiRequest(`/api/dashboard-data/${role}/${key}/items`, {
    method: "POST",
    body: JSON.stringify(item),
  });
  return result.data;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function updateDashboardCache(role, key, value) {
  const loader = moduleLoaders[role];
  if (!loader) return;
  const module = await loader();
  const target = module[key];
  if (Array.isArray(target) && Array.isArray(value)) {
    target.splice(0, target.length, ...value);
  } else if (isPlainObject(target) && isPlainObject(value)) {
    Object.keys(target).forEach((field) => delete target[field]);
    Object.assign(target, value);
  }
}
