import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, MessageSquare, Plus, RefreshCcw, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { EmptyPanel, PageLoader, formatDateTime } from "@/pages/dashboard/_dynamic/LumaDynamicUtils";
import { useAuth } from "@/context/AuthContext";
import { communityApi } from "@/services/communityApi";
import { learningApi } from "@/services/learningApi";

export default function StudentDoubtsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [reply, setReply] = useState("");
  const [draft, setDraft] = useState({ title: "", body: "", course: "general", tag: "Course" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [questionList, enrolled] = await Promise.all([
        communityApi.questions(),
        learningApi.getMyCourses().catch(() => []),
      ]);
      setQuestions(questionList);
      setCourses(
        (enrolled || [])
          .map((item) => item.course)
          .filter((course) => course?._id),
      );
    } catch (error) {
      toast.error(error.message || "Unable to load Q&A.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const myQuestionIds = useMemo(
    () => {
      const currentUserId = user?._id || user?.id;
      return new Set(questions.filter((item) => item.user?._id === currentUserId).map((item) => item.id));
    },
    [questions, user],
  );

  async function openThread(question) {
    try {
      const details = await communityApi.questionDetails(question.id);
      setThread(details.question);
      setAnswers(details.answers);
    } catch (error) {
      toast.error(error.message || "Unable to open this thread.");
    }
  }

  async function submitQuestion() {
    if (!draft.title.trim() || !draft.body.trim()) {
      toast.error("Please add a title and description.");
      return;
    }
    try {
      setSubmitting(true);
      const created = await communityApi.createQuestion({
        title: draft.title.trim(),
        body: draft.body.trim(),
        course: draft.course === "general" ? undefined : draft.course,
        tags: [draft.tag].filter(Boolean),
      });
      setQuestions((items) => [created, ...items]);
      setDraft({ title: "", body: "", course: "general", tag: "Course" });
      setOpen(false);
      toast.success("Question posted successfully.");
    } catch (error) {
      toast.error(error.message || "Unable to post question.");
    } finally {
      setSubmitting(false);
    }
  }

  async function sendReply(event) {
    event.preventDefault();
    if (!thread || !reply.trim()) return;
    try {
      const created = await communityApi.createAnswer(thread.id, reply.trim());
      setAnswers((items) => [...items, created]);
      setQuestions((items) =>
        items.map((item) =>
          item.id === thread.id
            ? { ...item, answerCount: item.answerCount + 1, status: "answered" }
            : item,
        ),
      );
      setThread((current) => current ? { ...current, answerCount: current.answerCount + 1, status: "answered" } : current);
      setReply("");
      toast.success("Reply posted.");
    } catch (error) {
      toast.error(error.message || "Unable to post reply.");
    }
  }

  if (loading) return <PageLoader label="Loading Q&A" />;

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        eyebrow="Support"
        title="Doubts / Q&A"
        description="Ask course questions and follow answers from instructors and learners."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-xl border-border/60" onClick={load}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Ask question
            </Button>
          </div>
        }
      />

      {questions.length ? (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-2xl card-premium p-5 hover-lift"
            >
              <div className="flex gap-4">
                <div className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
                  <ChevronUp className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold">{question.answerCount}</span>
                </div>
                <button onClick={() => openThread(question)} className="min-w-0 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={question.avatar} alt={question.authorName} />
                      <AvatarFallback>{question.authorName[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{question.authorName}</span>
                    <Badge className="border-0 bg-primary/15 text-primary">{question.courseTitle}</Badge>
                    {myQuestionIds.has(question.id) && (
                      <Badge variant="outline" className="border-border/60 text-[10px]">You</Badge>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold">{question.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{question.body}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {question.answerCount} answers
                    </span>
                    <span>· {formatDateTime(question.createdAt)}</span>
                  </div>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyPanel
          title="No questions yet"
          description="Ask the first question for your courses."
          action={<Button onClick={() => setOpen(true)}>Ask question</Button>}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Ask a question</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Course</Label>
              <Select value={draft.course} onValueChange={(course) => setDraft((current) => ({ ...current, course }))}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Q&A</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                className="mt-1 rounded-xl"
                placeholder="What do you need help with?"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={5}
                value={draft.body}
                onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
                className="mt-1 rounded-xl"
                placeholder="Add context, code, or what you already tried..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={submitQuestion}
              disabled={submitting}
            >
              {submitting ? "Posting..." : "Post question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!thread} onOpenChange={(openSheet) => !openSheet && setThread(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {thread && (
            <>
              <SheetHeader>
                <Badge className="w-fit border-0 bg-primary/15 text-primary">{thread.courseTitle}</Badge>
                <SheetTitle className="mt-2 font-display text-xl">{thread.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={thread.avatar} />
                  <AvatarFallback>{thread.authorName[0]}</AvatarFallback>
                </Avatar>
                {thread.authorName} · {formatDateTime(thread.createdAt)}
              </div>
              <div className="mt-4 rounded-xl bg-muted/30 p-4 text-sm">{thread.body}</div>
              <div className="mt-6 space-y-3">
                {answers.map((answerItem, index) => (
                  <motion.div
                    key={answerItem.id || index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border/60 bg-muted/20 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={answerItem.avatar} />
                        <AvatarFallback>{answerItem.authorName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{answerItem.authorName}</span>
                      <span className="text-xs text-muted-foreground">· {formatDateTime(answerItem.createdAt)}</span>
                    </div>
                    <div className="mt-2 text-sm">{answerItem.body}</div>
                  </motion.div>
                ))}
                {!answers.length && (
                  <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                    No answers yet.
                  </div>
                )}
              </div>
              <form className="mt-4 flex gap-2" onSubmit={sendReply}>
                <Input
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Write a reply..."
                  className="h-10 rounded-xl"
                />
                <Button type="submit" className="h-10 rounded-xl gradient-primary border-0 text-primary-foreground" disabled={!reply.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
