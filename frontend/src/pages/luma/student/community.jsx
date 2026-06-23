import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, MessageSquare, Send } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { communityPosts, student } from "@/features/student/data/mock";
import { toast } from "sonner";
const SEED_REPLIES = {
  p1: [
    {
      author: "Sara Lin",
      avatar: "https://i.pravatar.cc/80?img=44",
      text: "Use a context + slot pattern. Keep state in the parent.",
      time: "1h",
    },
    {
      author: "Mia Tanaka",
      avatar: "https://i.pravatar.cc/80?img=21",
      text: "asChild via Radix is great for headless composition.",
      time: "30m",
    },
  ],
};
export default function CommunityPage() {
  const [posts, setPosts] = useState(communityPosts);
  const [voted, setVoted] = useState({});
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState(SEED_REPLIES);
  const [reply, setReply] = useState("");
  const [draft, setDraft] = useState({ title: "", tag: "React", body: "" });
  const upvote = (id) => {
    if (voted[id]) {
      setVoted((v) => {
        const n = { ...v };
        delete n[id];
        return n;
      });
      setPosts((p) => p.map((x) => (x.id === id ? { ...x, upvotes: x.upvotes - 1 } : x)));
    } else {
      setVoted((v) => ({ ...v, [id]: true }));
      setPosts((p) => p.map((x) => (x.id === id ? { ...x, upvotes: x.upvotes + 1 } : x)));
    }
  };
  const startThread = () => setOpen(true);
  const submitThread = () => {
    if (!draft.title.trim()) {
      toast.error("Title required");
      return;
    }
    const id = `p${Date.now()}`;
    setPosts((p) => [
      {
        id,
        author: student.name,
        avatar: student.avatar,
        title: draft.title,
        replies: 0,
        upvotes: 1,
        tag: draft.tag,
        mine: true,
      },
      ...p,
    ]);
    setDraft({ title: "", tag: "React", body: "" });
    setOpen(false);
    toast.success("Discussion started");
  };
  const sendReply = () => {
    if (!thread || !reply.trim()) return;
    const r = {
      author: student.name,
      avatar: student.avatar,
      text: reply.trim(),
      time: "now",
    };
    setReplies((rs) => ({ ...rs, [thread.id]: [...(rs[thread.id] ?? []), r] }));
    setPosts((p) => p.map((x) => (x.id === thread.id ? { ...x, replies: x.replies + 1 } : x)));
    setReply("");
  };
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        eyebrow="Together"
        title="Community"
        description="Ask, answer, and learn out loud with thousands of curious minds."
        actions={
          <Button
            className="rounded-xl gradient-primary border-0 text-primary-foreground"
            onClick={startThread}
          >
            Start discussion
          </Button>
        }
      />

      <div className="space-y-3">
        {posts.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl card-premium p-5 hover-lift"
          >
            <div className="flex gap-4">
              <button
                onClick={() => upvote(p.id)}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 transition-all ${voted[p.id] ? "border-primary/60 text-primary bg-primary/10" : "border-border/60 bg-muted/30 hover:border-primary/60 hover:text-primary"}`}
              >
                <ChevronUp className="h-4 w-4" />
                <span className="text-xs font-semibold">{p.upvotes}</span>
              </button>
              <button onClick={() => setThread(p)} className="min-w-0 flex-1 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={p.avatar} alt={p.author} />
                    <AvatarFallback>{p.author[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{p.author}</span>
                  <Badge className="border-0 bg-primary/15 text-primary">{p.tag}</Badge>
                  {p.mine && (
                    <Badge variant="outline" className="border-border/60 text-[10px]">
                      You
                    </Badge>
                  )}
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold">{p.title}</h3>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> {p.replies} replies
                  </span>
                  <span>· tap to open thread</span>
                </div>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Start a discussion</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Title</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="mt-1 rounded-xl"
                placeholder="What's your question?"
              />
            </div>
            <div>
              <Label>Tag</Label>
              <Select value={draft.tag} onValueChange={(v) => setDraft({ ...draft, tag: v })}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["React", "TypeScript", "ML", "Design", "DevOps", "Career"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Body</Label>
              <Textarea
                rows={4}
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                className="mt-1 rounded-xl"
                placeholder="Share context, what you tried…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={submitThread}
            >
              Post discussion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!thread} onOpenChange={(o) => !o && setThread(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {thread && (
            <>
              <SheetHeader>
                <Badge className="w-fit border-0 bg-primary/15 text-primary">{thread.tag}</Badge>
                <SheetTitle className="font-display text-xl mt-2">{thread.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={thread.avatar} />
                  <AvatarFallback>{thread.author[0]}</AvatarFallback>
                </Avatar>
                {thread.author} · {thread.upvotes} upvotes
              </div>
              <div className="mt-6 space-y-3">
                {(replies[thread.id] ?? []).map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border/60 bg-muted/20 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={r.avatar} />
                        <AvatarFallback>{r.author[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{r.author}</span>
                      <span className="text-xs text-muted-foreground">· {r.time}</span>
                    </div>
                    <div className="mt-2 text-sm">{r.text}</div>
                  </motion.div>
                ))}
                {(replies[thread.id] ?? []).length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                    Be the first to reply.
                  </div>
                )}
              </div>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendReply();
                }}
              >
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply…"
                  className="h-10 rounded-xl"
                />
                <Button
                  type="submit"
                  className="h-10 rounded-xl gradient-primary border-0 text-primary-foreground"
                  disabled={!reply.trim()}
                >
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

