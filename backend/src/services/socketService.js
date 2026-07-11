import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { Conversation, User } from "../models/index.js";

let ioInstance = null;

const userRoom = (userId) => `user:${userId}`;
const conversationRoom = (conversationId) => `conversation:${conversationId}`;

function serializeMessage(message) {
  const source = typeof message?.toObject === "function" ? message.toObject() : message;
  return source;
}

async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) return next(new Error("Authentication required"));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.type === "refresh") return next(new Error("Invalid access token"));
    const user = await User.findById(payload.sub).select("_id name role status");
    if (!user || user.status !== "active") return next(new Error("Invalid or inactive account"));
    socket.user = user;
    next();
  } catch {
    next(new Error("Invalid access token"));
  }
}

async function joinConversation(socket, conversationId) {
  if (!conversationId) return;
  const conversation = await Conversation.findOne({ _id: conversationId, participants: socket.user._id }).select("_id");
  if (!conversation) return;
  socket.join(conversationRoom(conversation._id));
}

export function setupSocket(server) {
  const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",");
  const io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true },
  });
  ioInstance = io;

  io.use(authenticateSocket);
  io.on("connection", (socket) => {
    socket.join(userRoom(socket.user._id));

    socket.on("conversation:join", async ({ conversationId } = {}) => {
      await joinConversation(socket, conversationId);
    });

    socket.on("typing:start", async ({ conversationId } = {}) => {
      await joinConversation(socket, conversationId);
      socket.to(conversationRoom(conversationId)).emit("typing:start", {
        conversationId,
        user: { _id: socket.user._id, name: socket.user.name, role: socket.user.role },
      });
    });

    socket.on("typing:stop", ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.to(conversationRoom(conversationId)).emit("typing:stop", {
        conversationId,
        user: { _id: socket.user._id, name: socket.user.name, role: socket.user.role },
      });
    });
  });

  return io;
}

export function emitMessageToConversation(conversation, message) {
  if (!ioInstance || !conversation?._id) return;
  const payload = {
    conversationId: String(conversation._id),
    conversation,
    message: serializeMessage(message),
  };
  conversation.participants?.forEach((participant) => {
    ioInstance.to(userRoom(participant)).emit("message:new", payload);
  });
  ioInstance.to(conversationRoom(conversation._id)).emit("message:new", payload);
}
