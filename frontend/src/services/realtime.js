import { io } from "socket.io-client";
import { API_BASE_URL, getAccessToken } from "@/services/api";

let socket = null;

export function getSocket() {
  const token = getAccessToken();
  if (!token) return null;
  if (!socket) {
    socket = io(API_BASE_URL, {
      autoConnect: false,
      withCredentials: true,
      auth: { token },
      transports: ["websocket", "polling"],
    });
  }
  socket.auth = { token };
  if (!socket.connected) socket.connect();
  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("edupath:token-updated", () => {
    if (!socket) return;
    socket.auth = { token: getAccessToken() };
    if (socket.connected) {
      socket.disconnect();
      socket.connect();
    }
  });
  window.addEventListener("edupath:session-expired", disconnectSocket);
}
