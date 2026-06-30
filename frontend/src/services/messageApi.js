import { apiFormRequest, apiRequest } from "./api";

export const messageApi = {
  conversations: () => apiRequest("/api/messages/conversations"),
  contacts: () => apiRequest("/api/messages/contacts"),
  startConversation: (participantId) =>
    apiRequest("/api/messages/conversations", {
      method: "POST",
      body: JSON.stringify({ participantId }),
    }),
  messages: (conversationId) =>
    apiRequest(`/api/messages/conversation/${encodeURIComponent(conversationId)}`),
  send: (payload) =>
    apiRequest("/api/messages/send", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  uploadAttachment: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFormRequest("/api/messages/upload-attachment", formData);
  },
};
