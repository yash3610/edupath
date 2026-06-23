import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { instructorCourses } from "@/features/instructor/data/instructor";
import { toast } from "sonner";
const INITIAL = [
  {
    id: "m1",
    title: "Introduction",
    lectures: [
      {
        id: "l1",
        title: "Welcome to the course",
        type: "video",
        duration: "08:24",
        preview: true,
      },
      { id: "l2", title: "Course resources", type: "pdf" },
      { id: "l3", title: "Module 1 quiz", type: "quiz" },
    ],
  },
  {
    id: "m2",
    title: "Foundations",
    lectures: [
      {
        id: "l4",
        title: "Compound components",
        type: "video",
        duration: "22:45",
      },
      { id: "l5", title: "Render props", type: "video", duration: "18:10" },
      { id: "l6", title: "Build a popover", type: "assignment" },
    ],
  },
];
const ICONS = {
  video: Video,
  pdf: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
};
export default function BuilderPage() {
  const [course, setCourse] = useState(instructorCourses[0].id);
  const [modules, setModules] = useState(INITIAL);
  const addModule = () =>
    setModules([...modules, { id: `m${Date.now()}`, title: "Untitled module", lectures: [] }]);
  const addLecture = (mid) =>
    setModules(
      modules.map((m) =>
        m.id === mid
          ? {
              ...m,
              lectures: [
                ...m.lectures,
                {
                  id: `l${Date.now()}`,
                  title: "New lecture",
                  type: "video",
                  duration: "00:00",
                },
              ],
            }
          : m,
      ),
    );
  return (
    <div className="mx-auto max-w-[1400px]">
      <LmsPageHeader
        eyebrow="Teaching"
        title="Course Builder"
        description="Build your course like Lego — modules, lectures, quizzes, and assignments."
        actions={
          <Button
            className="rounded-xl gradient-primary border-0 text-primary-foreground"
            onClick={addModule}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add module
          </Button>
        }
      />

      <div className="mb-5 max-w-sm">
        <Select value={course} onValueChange={setCourse}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {instructorCourses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {modules.map((m, i) => (
          <motion.details
            key={m.id}
            open
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group rounded-2xl card-premium overflow-hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                <div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary shadow-glow font-mono text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <Input
                  defaultValue={m.title}
                  className="h-9 w-80 rounded-lg"
                  onClick={(e) => e.preventDefault()}
                />
                <Badge variant="outline" className="border-border/60">
                  {m.lectures.length} lectures
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-border/60"
                  onClick={(e) => {
                    e.preventDefault();
                    addLecture(m.id);
                  }}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Lecture
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.preventDefault();
                    setModules(modules.filter((x) => x.id !== m.id));
                    toast.error("Module deleted");
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </summary>
            <div className="border-t border-border/60 bg-muted/10 p-3 space-y-1">
              {m.lectures.map((l) => {
                const Icon = ICONS[l.type];
                return (
                  <div
                    key={l.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/30"
                  >
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    <Icon className="h-4 w-4 text-primary" />
                    <Input defaultValue={l.title} className="h-9 flex-1 max-w-md rounded-lg" />
                    <Badge variant="outline" className="border-border/60 capitalize">
                      {l.type}
                      {l.duration ? ` · ${l.duration}` : ""}
                    </Badge>
                    {l.type === "video" && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Preview</span>
                        <Switch defaultChecked={l.preview} />
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => {
                        setModules(
                          modules.map((mm) =>
                            mm.id === m.id
                              ? {
                                  ...mm,
                                  lectures: mm.lectures.filter((x) => x.id !== l.id),
                                }
                              : mm,
                          ),
                        );
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </motion.details>
        ))}
      </div>
    </div>
  );
}

