import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, Mail, Phone, Plus, Save, X } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import DashboardSkeleton from "@/components/luma/DashboardSkeleton";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { normalizeProfile, profileApi } from "@/services/profileApi";
import { toast } from "sonner";

const emptyForm = { name: "", email: "", phone: "", bio: "" };

function rankFrom(stats = {}) {
  stats = stats || {};
  const completed = Number(stats.completedCourses || 0);
  const average = Number(stats.quizAverage || 0);
  if (completed >= 10 || average >= 90) return "Master";
  if (completed >= 4 || average >= 75) return "Achiever";
  if (completed >= 1) return "Explorer";
  return "Starter";
}

function levelFrom(stats = {}) {
  stats = stats || {};
  const completed = Number(stats.completedCourses || 0);
  const enrolled = Number(stats.enrolledCourses || 0);
  return Math.max(1, completed * 2 + enrolled);
}

export default function ProfilePage() {
  const auth = useAuth() || {};
  const { user: sessionUser, updateUser = () => {} } = auth;
  const [form, setForm] = useState(emptyForm);
  const [skills, setSkills] = useState([]);
  const [avatar, setAvatar] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [skillDlg, setSkillDlg] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    try {
      if (sessionUser) {
        setForm({
          name: sessionUser.name || "",
          email: sessionUser.email || "",
          phone: sessionUser.phone || "",
          bio: sessionUser.bio || "",
        });
        setAvatar(sessionUser.avatar || "");
      }

      const profileResult = await profileApi.me();
      const next = normalizeProfile(profileResult.data);
      setForm({ name: next.name, email: next.email, phone: next.phone, bio: next.bio });
      setSkills(next.skills);
      setAvatar(next.avatar);
      updateUser(next.user);
    } catch (error) {
      toast.error(error.message || "Unable to load profile.");
      if (sessionUser) {
        setForm({
          name: sessionUser.name || "",
          email: sessionUser.email || "",
          phone: sessionUser.phone || "",
          bio: sessionUser.bio || "",
        });
        setAvatar(sessionUser.avatar || "");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    api.dashboardStats()
      .then((result) => setStats(result.data || {}))
      .catch(() => setStats({}));
  }, []);

  const badges = useMemo(() => ({
    level: levelFrom(stats),
    rank: rankFrom(stats),
  }), [stats]);

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

  const addSkill = () => {
    const skill = newSkill.trim();
    if (!skill) return;
    if (skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      toast.error("Skill already added.");
      return;
    }
    setSkills((current) => [...current, skill]);
    setNewSkill("");
    setSkillDlg(false);
  };

  const removeSkill = (skill) => setSkills((current) => current.filter((item) => item !== skill));

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
        skills,
      });
      const next = normalizeProfile(result.data);
      setForm({ name: next.name, email: next.email, phone: next.phone, bio: next.bio });
      setSkills(next.skills);
      setAvatar(next.avatar);
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
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        eyebrow="You"
        title="Profile"
        description="Keep your learning profile, skills, and contact details up to date."
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border shadow-elegant"
      >
        <div className="h-40 gradient-hero md:h-56" />
        <div className="relative px-6 pb-8 md:px-10">
          <div className="-mt-14 flex flex-wrap items-end gap-4 md:-mt-20">
            <div className="relative">
              <Avatar className="h-28 w-28 ring-4 ring-background md:h-36 md:w-36">
                <AvatarImage src={avatar} alt={form.name} />
                <AvatarFallback>{form.name?.[0]?.toUpperCase() || "S"}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-1 right-1 grid h-9 w-9 cursor-pointer place-items-center rounded-full gradient-primary shadow-glow">
                {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" /> : <Camera className="h-4 w-4 text-primary-foreground" />}
                <input type="file" accept="image/*" className="hidden" onChange={onAvatar} disabled={uploadingAvatar} />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl font-semibold md:text-3xl">{form.name || "Student"}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {form.email || "No email"}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {form.phone || "No phone added"}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="border-0 gradient-primary text-primary-foreground">
                Lv {badges.level}
              </Badge>
              <Badge className="border-0 gradient-accent text-accent-foreground">
                {badges.rank}
              </Badge>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <Field label="Full name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
              <Field label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
              <Field label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
              <div>
                <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Bio</div>
                <textarea
                  value={form.bio}
                  onChange={(event) => setForm({ ...form, bio: event.target.value })}
                  className="min-h-28 w-full rounded-xl border border-border bg-muted/30 p-3 text-sm"
                  placeholder="Tell instructors and classmates a little about your learning goals."
                />
              </div>
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="rounded-full border-border/60 bg-muted/30 pl-3 pr-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 grid h-5 w-5 place-items-center rounded-full hover:bg-destructive/15 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Badge
                    variant="outline"
                    className="rounded-full border-dashed cursor-pointer hover:border-primary hover:text-primary"
                    onClick={() => setSkillDlg(true)}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add skill
                  </Badge>
                </div>
              </div>
              <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save changes
              </Button>
            </div>

            <div className="space-y-3">
              <Stat k="Courses" v={stats?.enrolledCourses || 0} />
              <Stat k="Completed" v={stats?.completedCourses || 0} />
              <Stat k="Certificates" v={stats?.certificates || 0} />
              <Stat k="Learning hours" v={stats?.learningHours || 0} />
              <Stat k="Quiz average" v={`${stats?.quizAverage || 0}%`} />
            </div>
          </div>
        </div>
      </motion.div>

      <Dialog open={skillDlg} onOpenChange={setSkillDlg}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Add skill</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Skill name</Label>
            <Input
              autoFocus
              value={newSkill}
              onChange={(event) => setNewSkill(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addSkill()}
              placeholder="e.g. GraphQL"
              className="mt-1 rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-xl" onClick={() => setSkillDlg(false)}>Cancel</Button>
            <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={addSkill}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-xl" />
    </div>
  );
}

function Stat({ k, v }) {
  return (
    <div className="flex items-center justify-between rounded-xl card-premium px-4 py-3">
      <div className="text-sm text-muted-foreground">{k}</div>
      <div className="font-display text-lg font-semibold">{v}</div>
    </div>
  );
}
