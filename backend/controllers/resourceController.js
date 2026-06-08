import Blog from "../models/Blog.js";
import Course from "../models/Course.js";
import Event from "../models/Event.js";
import Product from "../models/Product.js";
import TeamMember from "../models/TeamMember.js";
import asyncHandler from "../utils/asyncHandler.js";

const models = {
  courses: Course,
  blogs: Blog,
  events: Event,
  products: Product,
  team: TeamMember,
};

export function listResources(type) {
  return asyncHandler(async (req, res) => {
    const Model = models[type];
    const items = await Model.find({}).sort({ createdAt: -1 });
    res.json({ data: items });
  });
}

export function getResourceBySlug(type) {
  return asyncHandler(async (req, res) => {
    const Model = models[type];
    const item = await Model.findOne({ slug: req.params.slug });

    if (!item) {
      res.status(404);
      throw new Error("Item not found");
    }

    res.json({ data: item });
  });
}
