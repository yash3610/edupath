import Newsletter from "../models/Newsletter.js";

export async function subscribeNewsletter(req, res, next) {
  try {
    const { email } = req.body;
    const subscription = await Newsletter.create({ email });

    res.status(201).json({
      message: "You have been subscribed successfully.",
      data: subscription,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ message: "This email is already subscribed." });
      return;
    }
    next(error);
  }
}
