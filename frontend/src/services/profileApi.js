import { apiFormRequest, apiRequest, assetUrl } from "./api";

export function normalizeProfile(payload = {}) {
  const user = payload.user || {};
  const profile = payload.profile || {};
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const expertise = Array.isArray(profile.expertise) ? profile.expertise : [];
  const socialLinks = profile.socialLinks && typeof profile.socialLinks === "object" ? profile.socialLinks : {};
  return {
    user,
    profile,
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || profile.phone || "",
    bio: user.bio || profile.bio || "",
    headline: profile.headline || "",
    avatar: assetUrl(user.avatar || profile.avatar) || "",
    skills,
    expertise,
    socialLinks,
    website: socialLinks.website || "",
    rating: profile.rating || 0,
    learningGoalMinutes: profile.learningGoalMinutes || 60,
  };
}

export const profileApi = {
  me: () => apiRequest("/api/profile/me"),
  update: (payload) =>
    apiRequest("/api/profile/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiFormRequest("/api/profile/avatar", formData, { method: "PATCH" });
  },
};
