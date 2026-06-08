import Contact from "../models/Contact.js";

export async function createContact(req, res, next) {
  try {
    const { name, email, phone, message, subject } = req.body;
    const contact = await Contact.create({ name, email, phone, message, subject });

    res.status(201).json({
      message: "Thank you. Your message has been submitted.",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
}
