import { motion } from "framer-motion";
import { ChevronRight, PlayCircle, FileText, Video, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { adminCourses } from "@/features/admin/data/admin";
const MODULES = [
  {
    id: "m1",
    title: "Introduction",
    lectures: [
      {
        id: "l1",
        title: "Welcome",
        type: "video",
        duration: "08:24",
        preview: true,
      },
      {
        id: "l2",
        title: "Setup your environment",
        type: "video",
        duration: "14:10",
        preview: true,
      },
      {
        id: "l3",
        title: "Reading list",
        type: "pdf",
        duration: "—",
        preview: false,
      },
    ],
  },
  {
    id: "m2",
    title: "Foundations",
    lectures: [
      {
        id: "l4",
        title: "Core concepts",
        type: "video",
        duration: "22:45",
        preview: false,
      },
      {
        id: "l5",
        title: "Live walkthrough",
        type: "live",
        duration: "60:00",
        preview: false,
      },
      {
        id: "l6",
        title: "External reference",
        type: "link",
        duration: "—",
        preview: false,
      },
    ],
  },
  {
    id: "m3",
    title: "Advanced patterns",
    lectures: [
      {
        id: "l7",
        title: "Compound components",
        type: "video",
        duration: "31:12",
        preview: false,
      },
      {
        id: "l8",
        title: "Testing patterns",
        type: "video",
        duration: "18:48",
        preview: false,
      },
    ],
  },
];
const ICONS = { video: Video, pdf: FileText, live: PlayCircle, link: LinkIcon };
export default function ModulesPage() {
  const [course, setCourse] = useState(adminCourses[0].id);
  return (
    <div className="mx-auto max-w-[1400px]">
      <LmsPageHeader
        eyebrow="Catalog"
        title="Modules & Lectures"
        description="Browse and audit course content across the platform."
      />

      <div className="mb-5 max-w-sm">
        <Select value={course} onValueChange={setCourse}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {adminCourses.slice(0, 10).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {MODULES.map((m, i) => (
          <motion.details
            key={m.id}
            open={i === 0}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group rounded-2xl card-premium overflow-hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                <div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary shadow-glow font-mono text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <div>
                  <div className="font-display text-base font-semibold">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.lectures.length} lectures</div>
                </div>
              </div>
              <Badge variant="outline" className="border-border/60">
                Published
              </Badge>
            </summary>
            <div className="border-t border-border/60 bg-muted/10 p-3">
              {m.lectures.map((l) => {
                const Icon = ICONS[l.type];
                return (
                  <div
                    key={l.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/30"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{l.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.type.toUpperCase()} · {l.duration}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Free preview</span>
                      <Switch defaultChecked={l.preview} />
                    </div>
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

