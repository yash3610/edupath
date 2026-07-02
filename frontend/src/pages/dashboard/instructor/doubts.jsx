import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MessageSquare, Send } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { doubts } from "@/features/instructor/data/instructor";
import { toast } from "sonner";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";

export default function InstructorDoubts() {
  const [tab, setTab] = useState("open");
  const [reply, setReply] = useState(null);
  const [list, setList] = usePersistedDashboardState("instructor", "doubts", doubts);
  const rows = list.filter((d) => tab === "all" || d.status === tab);
  const resolve = (doubt) => {
    setList((items) => items.map((item) => item.id === doubt.id ? { ...item, status: "resolved" } : item));
    toast.success("Marked resolved");
  };
  return (
    <div className="mx-auto max-w-[1200px]">
      <LmsPageHeader
        eyebrow="Learners"
        title="Doubts / Q&A"
        description="Student questions across your courses."
      />
      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList className="rounded-xl bg-muted/60 p-1">
          {["open", "resolved", "all"].map((s) => (
            <TabsTrigger key={s} value={s} className="rounded-lg capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {rows.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl card-premium p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={d.avatar} />
                  <AvatarFallback>{d.student[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{d.student}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.course} · {d.lecture} · {d.time}
                  </div>
                </div>
              </div>
              <StatusBadge status={d.status} />
            </div>
            <p className="mt-3 text-sm">{d.text}</p>
            <div className="mt-3 flex items-center justify-between">
              <Badge variant="outline" className="border-border/60">
                <MessageSquare className="mr-1 h-3 w-3" /> {d.replies} replies
              </Badge>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="rounded-lg gradient-primary border-0 text-primary-foreground"
                  onClick={() => setReply(d)}
                >
                  Answer
                </Button>
                {d.status === "open" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-border/60"
                    onClick={() => resolve(d)}
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Resolve
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Sheet open={!!reply} onOpenChange={(o) => !o && setReply(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          {reply && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">Reply to {reply.student}</SheetTitle>
              </SheetHeader>
              <div className="mt-2 text-xs text-muted-foreground">
                {reply.course} · {reply.lecture}
              </div>
              <div className="mt-4 rounded-xl bg-muted/30 p-4 text-sm">{reply.text}</div>
              <div className="mt-4">
                <Textarea rows={6} placeholder="Write your answer…" className="rounded-xl" />
                <Button
                  className="mt-3 w-full rounded-xl gradient-primary border-0 text-primary-foreground"
                  onClick={() => {
                    setList((items) => items.map((item) => item.id === reply.id ? { ...item, replies: item.replies + 1 } : item));
                    toast.success("Answer posted");
                    setReply(null);
                  }}
                >
                  <Send className="mr-1.5 h-4 w-4" /> Post answer
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

