export function notFound(req, res, next) {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (error.name === "ValidationError") {
    res.status(400).json({
      message: Object.values(error.errors)
        .map((item) => item.message)
        .join(", "),
    });
    return;
  }

  if (error.name === "MongoNotConnectedError" || error.message?.includes("before initial connection")) {
    res.status(503).json({
      message: "Database is not connected. Start MongoDB and retry.",
    });
    return;
  }

  res.status(statusCode).json({
    message: error.message || "Server error",
  });
}
