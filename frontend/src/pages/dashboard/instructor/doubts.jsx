import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MessageSquare, RefreshCcw, Send } from "lucide-react";
import { toast } from "sonner";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/features/shared/components/StatusBadge";
import { EmptyPanel, PageLoader, formatDateTime } from "@/pages/dashboard/_dynamic/LumaDynamicUtils";
import { communityApi } from "@/services/communityApi";

export default function InstructorDoubts() {
  const [tab, setTab] = useState("open");
  const [reply, setReply] = useState(null);
  const [answer, setAnswer] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setList(await communityApi.instructorDoubts());
    } catch (error) {
      toast.error(error.message || "Unable to load doubts.");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(
    () => list.filter((doubt) => tab === "all" || doubt.status === tab),
    [list, tab],
  );

  async function postAnswer() {
    if (!reply || !answer.trim()) {
      toast.error("Please write an answer first.");
      return;
    }
    try {
      setPosting(true);
      await communityApi.createAnswer(reply.id, answer.trim());
      setList((items) =>
        items.map((item) =>
          item.id === reply.id
            ? { ...item, answerCount: item.answerCount + 1, status: "answered" }
            : item,
        ),
      );
      toast.success("Answer posted successfully.");
      setAnswer("");
      setReply(null);
    } catch (error) {
      toast.error(error.message || "Unable to post answer.");
    } finally {
      setPosting(false);
    }
  }

  if (loading) return <PageLoader label="Loading doubts" />;

  return (
    <div className="mx-auto max-w-[1200px]">
      <LmsPageHeader
        eyebrow="Learners"
        title="Doubts / Q&A"
        description="Student questions from your courses."
        actions={
          <Button variant="outline" className="rounded-xl border-border/60" onClick={load}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-5">
        <TabsList className="rounded-xl bg-muted/60 p-1">
          {["open", "answered", "all"].map((status) => (
            <TabsTrigger key={status} value={status} className="rounded-lg capitalize">
              {status}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {rows.length ? (
        <div className="space-y-3">
          {rows.map((doubt, index) => (
            <motion.div
              key={doubt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl card-premium p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={doubt.avatar} />
                    <AvatarFallback>{doubt.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{doubt.authorName}</div>
                    <div className="text-xs text-muted-foreground">
                      {doubt.courseTitle} · {formatDateTime(doubt.createdAt)}
                    </div>
                  </div>
                </div>
                <StatusBadge status={doubt.status} />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{doubt.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{doubt.body}</p>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant="outline" className="border-border/60">
                  <MessageSquare className="mr-1 h-3 w-3" /> {doubt.answerCount} answers
                </Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-lg gradient-primary border-0 text-primary-foreground"
                    onClick={() => setReply(doubt)}
                  >
                    Answer
                  </Button>
                  {doubt.status === "answered" && (
                    <Button size="sm" variant="outline" className="rounded-lg border-border/60" disabled>
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Answered
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyPanel
          title="No doubts found"
          description={tab === "all" ? "No student has asked a course question yet." : `No ${tab} doubts right now.`}
        />
      )}

      <Sheet open={!!reply} onOpenChange={(open) => !open && setReply(null)}>
        <SheetContent className="w-full sm:max-w-xl">
          {reply && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display">Reply to {reply.authorName}</SheetTitle>
              </SheetHeader>
              <div className="mt-2 text-xs text-muted-foreground">{reply.courseTitle}</div>
              <div className="mt-4 rounded-xl bg-muted/30 p-4">
                <div className="font-medium">{reply.title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{reply.body}</p>
              </div>
              <div className="mt-4">
                <Textarea
                  rows={7}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Write a clear answer for the student..."
                  className="rounded-xl"
                />
                <Button
                  className="mt-3 w-full rounded-xl gradient-primary border-0 text-primary-foreground"
                  onClick={postAnswer}
                  disabled={posting || !answer.trim()}
                >
                  <Send className="mr-1.5 h-4 w-4" /> {posting ? "Posting..." : "Post answer"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
