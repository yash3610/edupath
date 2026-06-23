import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Mail, Phone, Plus, Save, X } from "lucide-react";
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
import { student, stats } from "@/features/student/data/mock";
import { toast } from "sonner";
export default function ProfilePage() {
  const [form, setForm] = useState({
    name: student.name,
    email: student.email,
    phone: student.phone,
    bio: student.bio,
  });
  const [skills, setSkills] = useState(student.skills);
  const [avatar, setAvatar] = useState(student.avatar);
  const [skillDlg, setSkillDlg] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const onAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatar(url);
    toast.success("Avatar updated");
  };
  const addSkill = () => {
    const s = newSkill.trim();
    if (!s) return;
    if (skills.includes(s)) {
      toast.error("Skill already added");
      return;
    }
    setSkills((x) => [...x, s]);
    setNewSkill("");
    setSkillDlg(false);
    toast.success(`Added "${s}"`);
  };
  const removeSkill = (s) => setSkills((x) => x.filter((k) => k !== s));
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        eyebrow="You"
        title="Profile"
        description="Make it yours. Add skills, story, and links."
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
                <AvatarFallback>{form.name[0]}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-1 right-1 grid h-9 w-9 cursor-pointer place-items-center rounded-full gradient-primary shadow-glow">
                <Camera className="h-4 w-4 text-primary-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl font-semibold md:text-3xl">{form.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {form.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {form.phone}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className="border-0 gradient-primary text-primary-foreground">
                Lv {student.level}
              </Badge>
              <Badge className="border-0 gradient-accent text-accent-foreground">
                {student.rank}
              </Badge>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <Field
                label="Full name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Field
                label="Email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
              <Field
                label="Phone"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
              <div>
                <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Bio
                </div>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="min-h-28 w-full rounded-xl border border-border bg-muted/30 p-3 text-sm"
                />
              </div>
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Skills
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="rounded-full border-border/60 bg-muted/30 pl-3 pr-1"
                    >
                      {s}
                      <button
                        onClick={() => removeSkill(s)}
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
              <Button
                className="rounded-xl gradient-primary border-0 text-primary-foreground"
                onClick={() => toast.success("Profile saved")}
              >
                <Save className="mr-2 h-4 w-4" /> Save changes
              </Button>
            </div>

            <div className="space-y-3">
              <Stat k="Courses" v={stats.enrolled} />
              <Stat k="Completed" v={stats.completed} />
              <Stat k="Certificates" v={stats.certificates} />
              <Stat k="Learning hours" v={stats.hours} />
              <Stat k="Quiz average" v={`${stats.quizAvg}%`} />
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
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder="e.g. GraphQL"
              className="mt-1 rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-xl" onClick={() => setSkillDlg(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={addSkill}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function Field({ label, value, onChange }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-xl" />
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

