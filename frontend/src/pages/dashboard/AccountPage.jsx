import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Icon, MotionCard, SectionHeading } from "../../components/dashboard/DashboardPrimitives.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { apiFormRequest, apiRequest, assetUrl } from "../../services/api.js";

const defaultPreferences = {
  emailNotifications: true,
  communityMentions: true,
  learningReminders: true,
  aiRecommendations: true,
};

export default function AccountPage() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    headline: "",
    skills: "",
    expertise: "",
    avatar: "",
  });
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const dashboardRoot = useMemo(() => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "instructor") return "/instructor/dashboard";
    return "/dashboard";
  }, [user?.role]);

  useEffect(() => {
    Promise.all([apiRequest("/api/profile/me"), apiRequest("/api/settings")])
      .then(([accountResult, settingsResult]) => {
        const account = accountResult.data || {};
        const accountUser = account.user || {};
        const roleProfile = account.profile || {};
        setProfile({
          name: accountUser.name || "",
          email: accountUser.email || "",
          phone: accountUser.phone || roleProfile.phone || "",
          bio: accountUser.bio || roleProfile.bio || "",
          headline: roleProfile.headline || "",
          skills: (roleProfile.skills || []).join(", "),
          expertise: (roleProfile.expertise || []).join(", "),
          avatar: accountUser.avatar || roleProfile.avatar || "",
        });
        setPreferences({ ...defaultPreferences, ...(settingsResult.data || {}) });
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  function setProfileField(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    try {
      setSaving("profile");
      const payload = {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        bio: profile.bio.trim(),
      };
      if (user.role === "student") payload.skills = splitList(profile.skills);
      if (user.role === "instructor") {
        payload.headline = profile.headline.trim();
        payload.expertise = splitList(profile.expertise);
      }
      const result = await apiRequest("/api/profile/me", { method: "PATCH", body: JSON.stringify(payload) });
      updateUser(result.data.user);
      toast.success("Account details updated.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving("");
    }
  }

  function selectAvatar(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please select a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Profile photo must be smaller than 10 MB.");
      return;
    }

    setAvatarFile(file);
  }

  function cancelAvatarUpload() {
    if (saving === "avatar") return;
    setAvatarFile(null);
  }

  async function uploadAvatar() {
    if (!avatarFile) return;
    try {
      setSaving("avatar");
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const result = await apiFormRequest("/api/profile/avatar", formData, { method: "PATCH" });
      const nextUser = result.data?.user;
      const avatar = result.data?.avatar || nextUser?.avatar;
      if (!avatar) throw new Error("The server did not return the uploaded photo.");

      setProfile((current) => ({ ...current, avatar }));
      if (nextUser) updateUser(nextUser);
      setAvatarFile(null);
      toast.success("Profile photo updated.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving("");
    }
  }

  async function savePreferences() {
    try {
      setSaving("preferences");
      const result = await apiRequest("/api/settings", { method: "PATCH", body: JSON.stringify(preferences) });
      setPreferences({ ...defaultPreferences, ...(result.data || {}) });
      toast.success("Preferences updated.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving("");
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    try {
      setSaving("password");
      await apiRequest("/api/profile/change-password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving("");
    }
  }

  async function deleteAccount() {
    if (!window.confirm("Deactivate your account? You will be logged out immediately.")) return;
    try {
      setSaving("delete");
      await apiRequest("/api/settings/delete-account", { method: "DELETE" });
      logout();
      navigate(user.role === "student" ? "/login" : "/staff/login", { replace: true });
    } catch (error) {
      toast.error(error.message);
      setSaving("");
    }
  }

  if (loading) {
    return <MotionCard className="flex min-h-64 items-center justify-center"><span className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-[#ff723a]" /></MotionCard>;
  }

  const initials = profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "EP";

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Account" title="Profile, preferences and security" />

      <section className="min-w-0 space-y-6">
        <MotionCard className="w-full">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-br from-[#ff723a] to-[#fec961] text-2xl font-extrabold text-white shadow-[0_14px_30px_rgba(255,114,58,.2)] sm:h-28 sm:w-28">
                <span>{initials}</span>
                {profile.avatar && <img src={assetUrl(profile.avatar)} alt={profile.name} onError={(event) => { event.currentTarget.style.display = "none"; }} className="absolute inset-0 h-full w-full object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#ff723a]">Your account</p>
                <h2 className="mt-1 truncate text-xl font-extrabold text-[#1f1c35] sm:text-2xl">{profile.name}</h2>
                <p className="mt-1 break-all text-sm text-slate-500">{profile.email}</p>
                <span className="mt-3 inline-flex rounded-full bg-[#fff1e8] px-3 py-1 text-xs font-extrabold capitalize text-[#ff723a]">{user.role}</span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-44">
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={selectAvatar} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={saving === "avatar"} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-extrabold text-[#1f1c35] hover:border-[#ff723a] disabled:opacity-50">
                <Icon name="Camera" className="h-4 w-4" /> Change photo
              </button>
              <button type="button" onClick={() => navigate(dashboardRoot)} className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-600">Back to dashboard</button>
            </div>
          </div>
        </MotionCard>

        <div className="min-w-0 space-y-6">
          <MotionCard className="w-full">
            <SectionHeading eyebrow="Personal details" title="Your profile" />
            <form onSubmit={saveProfile} className="mt-5 grid min-w-0 gap-4 lg:grid-cols-2">
              <Field label="Full name"><input required name="name" value={profile.name} onChange={setProfileField} className="account-input" /></Field>
              <Field label="Email address"><input value={profile.email} readOnly className="account-input cursor-not-allowed bg-slate-50 text-slate-400" /></Field>
              <Field label="Phone number"><input name="phone" value={profile.phone} onChange={setProfileField} className="account-input" placeholder="+91 98765 43210" /></Field>
              {user.role === "instructor" && <Field label="Professional headline"><input name="headline" value={profile.headline} onChange={setProfileField} className="account-input" placeholder="Senior frontend instructor" /></Field>}
              <Field label="Bio" wide><textarea name="bio" value={profile.bio} onChange={setProfileField} className="account-input min-h-28 resize-y" placeholder="Tell learners a little about yourself." /></Field>
              {user.role === "student" && <Field label="Skills (comma separated)" wide><input name="skills" value={profile.skills} onChange={setProfileField} className="account-input" placeholder="React, UI/UX, Communication" /></Field>}
              {user.role === "instructor" && <Field label="Expertise (comma separated)" wide><input name="expertise" value={profile.expertise} onChange={setProfileField} className="account-input" placeholder="React, Node.js, System Design" /></Field>}
              <div className="lg:col-span-2"><PrimaryButton saving={saving === "profile"} label="Save profile" /></div>
            </form>
          </MotionCard>

          <MotionCard className="w-full">
            <SectionHeading eyebrow="Preferences" title="Notifications and learning" />
            <div className="mt-5 grid min-w-0 gap-3 lg:grid-cols-2">
              {[
                ["emailNotifications", "Email notifications", "Important account and course updates"],
                ["communityMentions", "Community mentions", "Replies and mentions in discussions"],
                ["learningReminders", "Learning reminders", "Class, quiz and assignment reminders"],
                ["aiRecommendations", "AI recommendations", "Personalized course suggestions"],
              ].map(([key, label, description]) => (
                <label key={key} className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-orange-200 hover:bg-[#fffaf6]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1e8] text-[#ff723a]"><Icon name="Bell" className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><strong className="block text-sm text-[#1f1c35]">{label}</strong><span className="mt-0.5 block text-xs text-slate-500">{description}</span></span>
                  <input type="checkbox" checked={Boolean(preferences[key])} onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))} className="h-5 w-5 accent-[#ff723a]" />
                </label>
              ))}
            </div>
            <button type="button" onClick={savePreferences} disabled={saving === "preferences"} className="mt-5 rounded-xl bg-[#1f1c35] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50">{saving === "preferences" ? "Saving..." : "Save preferences"}</button>
          </MotionCard>

          <MotionCard className="w-full">
            <SectionHeading eyebrow="Security" title="Password and account access" />
            <form onSubmit={changePassword} className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Current password"><input required type="password" value={passwords.currentPassword} onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))} className="account-input" /></Field>
              <Field label="New password"><input required minLength={8} type="password" value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} className="account-input" /></Field>
              <Field label="Confirm password"><input required minLength={8} type="password" value={passwords.confirmPassword} onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))} className="account-input" /></Field>
              <div className="md:col-span-2 xl:col-span-3"><PrimaryButton saving={saving === "password"} label="Change password" /></div>
            </form>
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-extrabold text-rose-700">Deactivate account</p><p className="mt-1 text-xs text-rose-600">This immediately blocks login and ends the current session.</p></div>
              <button type="button" onClick={deleteAccount} disabled={saving === "delete"} className="shrink-0 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-extrabold text-rose-700 disabled:opacity-50">Deactivate</button>
            </div>
          </MotionCard>
        </div>
      </section>

      {avatarFile && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-slate-950/55 p-4 pt-8 sm:items-center sm:pt-4" role="dialog" aria-modal="true" aria-labelledby="avatar-upload-title">
          <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#ff723a]">Profile photo</p>
                <h2 id="avatar-upload-title" className="mt-1 text-xl font-extrabold text-[#1f1c35]">Preview your photo</h2>
              </div>
              <button type="button" onClick={cancelAvatarUpload} disabled={saving === "avatar"} className="rounded-xl border border-slate-200 p-2 text-slate-500 disabled:opacity-50" aria-label="Close photo preview">
                <Icon name="X" className="h-5 w-5" />
              </button>
            </div>

            <div className="mx-auto mt-6 h-52 w-52 overflow-hidden rounded-[32px] bg-slate-100">
              <img src={avatarPreview} alt="Selected profile preview" className="h-full w-full object-cover" />
            </div>
            <p className="mt-4 truncate text-center text-sm font-bold text-slate-500">{avatarFile.name}</p>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={saving === "avatar"} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-extrabold text-[#1f1c35] disabled:opacity-50">
                Choose another
              </button>
              <button type="button" onClick={uploadAvatar} disabled={saving === "avatar"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff723a] px-4 py-3 text-sm font-extrabold text-white disabled:opacity-60">
                {saving === "avatar" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Icon name="Upload" className="h-4 w-4" />}
                {saving === "avatar" ? "Uploading..." : "Upload photo"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function Field({ label, wide = false, children }) {
  return <label className={`min-w-0 text-sm font-extrabold text-[#1f1c35] ${wide ? "lg:col-span-2" : ""}`}>{label}{children}</label>;
}

function PrimaryButton({ saving, label }) {
  return <button disabled={saving} className="w-full rounded-xl bg-[#ff723a] px-5 py-3 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(255,114,58,.2)] disabled:opacity-50 sm:w-auto">{saving ? "Saving..." : label}</button>;
}

function splitList(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}
