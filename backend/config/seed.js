import Blog from "../models/Blog.js";
import Course from "../models/Course.js";
import Event from "../models/Event.js";
import Product from "../models/Product.js";
import TeamMember from "../models/TeamMember.js";
import { blogs, courses, events, products, teamMembers } from "../data/seedData.js";

async function seedCollection(Model, data) {
  const count = await Model.countDocuments();
  if (count === 0) {
    await Model.insertMany(data);
  }
}

export default async function seedDatabase() {
  await Promise.all([
    seedCollection(Course, courses),
    seedCollection(Blog, blogs),
    seedCollection(Event, events),
    seedCollection(Product, products),
    seedCollection(TeamMember, teamMembers),
  ]);
}
