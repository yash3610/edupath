import ApiError from "../utils/ApiError.js";

const primitiveTypes = new Set(["string", "number", "boolean"]);

export function inferDashboardFormat(value) {
  if (value === null) return { type: "nullable", allowed: ["null"] };
  if (Array.isArray(value)) {
    const samples = value.filter((item) => item !== null && item !== undefined);
    return {
      type: "array",
      item: samples.length ? mergeFormats(samples.map(inferDashboardFormat)) : { type: "any" },
    };
  }
  if (typeof value === "object") {
    if (Object.keys(value).length === 0) return { type: "record", value: { type: "any" } };
    return {
      type: "object",
      fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, inferDashboardFormat(item)])),
    };
  }
  return { type: primitiveTypes.has(typeof value) ? typeof value : "any" };
}

export function validateDashboardFormat(value, format, path = "data") {
  rejectUnsafeKeys(value, path);
  const errors = [];
  validateValue(value, format, path, errors);
  if (errors.length) throw new ApiError(400, `Dashboard data format mismatch: ${errors.slice(0, 5).join("; ")}`);
  return true;
}

function rejectUnsafeKeys(value, path) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectUnsafeKeys(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (["__proto__", "prototype", "constructor"].includes(key) || key.startsWith("$") || key.includes(".")) {
      throw new ApiError(400, `Unsafe field name at ${path}.${key}`);
    }
    rejectUnsafeKeys(child, `${path}.${key}`);
  }
}

function validateValue(value, format, path, errors) {
  if (format.type === "any") return;
  if (value === null && format.nullable) return;
  if (format.type === "nullable") {
    if (value !== null) errors.push(`${path} must be null`);
    return;
  }
  if (format.type === "array") {
    if (!Array.isArray(value)) {
      errors.push(`${path} must be an array`);
      return;
    }
    value.forEach((item, index) => validateValue(item, format.item, `${path}[${index}]`, errors));
    return;
  }
  if (format.type === "record") {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      errors.push(`${path} must be an object map`);
      return;
    }
    Object.entries(value).forEach(([key, item]) => validateValue(item, format.value, `${path}.${key}`, errors));
    return;
  }
  if (format.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      errors.push(`${path} must be an object`);
      return;
    }
    const expected = Object.keys(format.fields).sort();
    const received = Object.keys(value).sort();
    const missing = expected.filter((key) => !format.fields[key].optional && !received.includes(key));
    const extra = received.filter((key) => !expected.includes(key));
    if (missing.length) errors.push(`${path} missing fields: ${missing.join(", ")}`);
    if (extra.length) errors.push(`${path} has unknown fields: ${extra.join(", ")}`);
    expected.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        validateValue(value[key], format.fields[key], `${path}.${key}`, errors);
      }
    });
    return;
  }
  if (typeof value !== format.type) errors.push(`${path} must be ${format.type}`);
}

function mergeFormats(formats) {
  const first = formats[0];
  if (formats.every((format) => JSON.stringify(format) === JSON.stringify(first))) return first;

  const nonNull = formats.filter((format) => format.type !== "nullable");
  if (nonNull.length && nonNull.length !== formats.length) {
    const merged = mergeFormats(nonNull);
    return { ...merged, nullable: true };
  }

  if (formats.every((format) => format.type === "object")) {
    const allKeys = [...new Set(formats.flatMap((format) => Object.keys(format.fields)))];
    return {
      type: "object",
      fields: Object.fromEntries(allKeys.map((key) => {
        const present = formats.map((format) => format.fields[key]).filter(Boolean);
        const merged = mergeFormats(present);
        return [key, { ...merged, optional: present.length !== formats.length || Boolean(merged.optional) }];
      })),
    };
  }

  return { type: "any" };
}
