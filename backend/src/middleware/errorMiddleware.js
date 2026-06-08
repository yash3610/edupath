export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(error.errors).map((item) => item.message).join(", "),
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: "Duplicate record found" });
  }

  if (error.name === "MongoNotConnectedError" || error.message?.includes("before initial connection")) {
    return res.status(503).json({ success: false, message: "Database is not connected. Start MongoDB and retry." });
  }

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Server error",
  });
}
