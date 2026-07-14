import { useEffect, useMemo, useState } from "react";
import { Camera, Loader2, Plus, Save, X } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardSkeleton from "@/components/luma/DashboardSkeleton";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { instructor } from "@/features/instructor/data/instructor";
import { normalizeProfile, profileApi } from "@/services/profileApi";
import { toast } from "sonner";

const emptyForm = { name: "", email: "", phone: "", headline: "", website: "", bio: "" };

export default function InstructorProfilePage() {
  const auth = useAuth() || {};
  const { user: sessionUser, updateUser = () => {} } = auth;
  const [form, setForm] = useState(emptyForm);
  const [avatar, setAvatar] = useState("");
  const [expertise, setExpertise] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [expertiseDlg, setExpertiseDlg] = useState(false);
  const [newExpertise, setNewExpertise] = useState("");

  const initials = useMemo(() => (form.name || "Instructor").slice(0, 2).toUpperCase(), [form.name]);

  const applySessionFallback = () => {
    if (!sessionUser) return;
    setForm((current) => ({
      ...current,
      name: sessionUser.name || current.name,
      email: sessionUser.email || current.email,
      phone: sessionUser.phone || current.phone,
      bio: sessionUser.bio || current.bio,
    }));
    setAvatar(sessionUser.avatar || "");
  };

  const loadProfile = async () => {
    setLoading(true);
    applySessionFallback();
    try {
      const result = await profileApi.me();
      const next = normalizeProfile(result.data);
      setForm({
        name: next.name,
        email: next.email,
        phone: next.phone,
        headline: next.headline,
        website: next.website,
        bio: next.bio,
      });
      setAvatar(next.avatar);
      setExpertise(next.expertise);
      updateUser(next.user);
    } catch (error) {
      toast.error(error.message || "Unable to load instructor profile.");
      applySessionFallback();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    api.instructorStats()
      .then((result) => setStats(result.data || {}))
      .catch(() => setStats({}));
  }, []);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const onAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const result = await profileApi.updateAvatar(file);
      const nextAvatar = result.data?.avatar || result.data?.user?.avatar || "";
      setAvatar(nextAvatar);
      updateUser(result.data?.user || { avatar: nextAvatar });
      toast.success("Profile photo updated.");
    } catch (error) {
      toast.error(error.message || "Unable to update profile photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const addExpertise = () => {
    const value = newExpertise.trim();
    if (!value) return;
    if (expertise.some((item) => item.toLowerCase() === value.toLowerCase())) {
      toast.error("Expertise already added.");
      return;
    }
    setExpertise((current) => [...current, value]);
    setNewExpertise("");
    setExpertiseDlg(false);
  };

  const saveProfile = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setSaving(true);
    try {
      const result = await profileApi.update({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        headline: form.headline.trim(),
        expertise,
        socialLinks: { website: form.website.trim() },
      });
      const next = normalizeProfile(result.data);
      setForm({
        name: next.name,
        email: next.email,
        phone: next.phone,
        headline: next.headline,
        website: next.website,
        bio: next.bio,
      });
      setAvatar(next.avatar);
      setExpertise(next.expertise);
      updateUser(next.user);
      toast.success("Profile saved successfully.");
    } catch (error) {
      toast.error(error.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="mx-auto max-w-[1100px]">
      <LmsPageHeader
        eyebrow="Account"
        title="Profile"
        description="How you appear to learners across the platform."
      />

      <div className="overflow-hidden rounded-2xl card-premium">
        <div className="relative h-44 overflow-hidden">
          <img src={instructor.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        </div>

        <div className="-mt-12 px-6 pb-6 md:px-8">
          <div className="flex flex-wrap items-end gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-card">
                <AvatarImage src={avatar} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 grid h-8 w-8 cursor-pointer place-items-center rounded-full gradient-primary shadow-glow">
                {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" /> : <Camera className="h-4 w-4 text-primary-foreground" />}
                <input type="file" accept="image/*" className="hidden" onChange={onAvatar} disabled={uploadingAvatar} />
              </label>
            </div>
            <div className="min-w-0 pb-1">
              <h2 className="font-display text-2xl font-semibold">{form.name || "Instructor"}</h2>
              <div className="text-sm text-muted-foreground">{form.headline || "Instructor"}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={(value) => updateForm("name", value)} />
              <Field label="Email" value={form.email} onChange={(value) => updateForm("email", value)} />
              <Field label="Phone" value={form.phone} onChange={(value) => updateForm("phone", value)} />
              <Field label="Website" value={form.website} onChange={(value) => updateForm("website", value)} placeholder="https://your-site.com" />
              <div className="md:col-span-2">
                <Label>Headline</Label>
                <Input value={form.headline} onChange={(event) => updateForm("headline", event.target.value)} className="mt-1 rounded-xl" placeholder="React mentor, product engineer, career coach" />
              </div>
              <div className="md:col-span-2">
                <Label>Bio</Label>
                <Textarea rows={4} value={form.bio} onChange={(event) => updateForm("bio", event.target.value)} className="mt-1 rounded-xl" />
              </div>
              <div className="md:col-span-2">
                <Label>Expertise</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {expertise.map((item) => (
                    <Badge key={item} variant="outline" className="rounded-full border-border/60 bg-muted/30 pl-3 pr-1">
                      {item}
                      <button type="button" onClick={() => setExpertise((current) => current.filter((skill) => skill !== item))} className="ml-1 grid h-5 w-5 place-items-center rounded-full hover:bg-destructive/15 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Badge variant="outline" className="cursor-pointer rounded-full border-dashed hover:border-primary hover:text-primary" onClick={() => setExpertiseDlg(true)}>
                    <Plus className="mr-1 h-3 w-3" /> Add expertise
                  </Badge>
                </div>
              </div>
              <div className="md:col-span-2">
                <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={saveProfile} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save changes
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Stat label="Courses" value={stats.courses || 0} />
              <Stat label="Published" value={stats.publishedCourses || 0} />
              <Stat label="Students" value={stats.students || 0} />
              <Stat label="Enrollments" value={stats.enrollments || 0} />
              <Stat label="Pending reviews" value={stats.pendingAssignmentReviews || 0} />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={expertiseDlg} onOpenChange={setExpertiseDlg}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Add expertise</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Expertise</Label>
            <Input
              autoFocus
              value={newExpertise}
              onChange={(event) => setNewExpertise(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addExpertise()}
              placeholder="e.g. React"
              className="mt-1 rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-xl" onClick={() => setExpertiseDlg(false)}>Cancel</Button>
            <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={addExpertise}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 rounded-xl" placeholder={placeholder} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl card-premium px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-display text-lg font-semibold">{value}</span>
    </div>
  );
}
