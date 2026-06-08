import express from "express";
import { getResourceBySlug, listResources } from "../controllers/resourceController.js";

export default function resourceRoutes(type) {
  const router = express.Router();

  router.get("/", listResources(type));
  router.get("/:slug", getResourceBySlug(type));

  return router;
}
