import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Star } from "lucide-react";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { instructorReviews, ratingDistribution } from "@/features/instructor/data/instructor";
import { toast } from "sonner";
export default function ReviewsPage() {
  const [list, setList] = useState(instructorReviews);
  const [reply, setReply] = useState(null);
  const [text, setText] = useState("");
  const total = ratingDistribution.reduce((s, x) => s + x.count, 0);
  const avg = ratingDistribution.reduce((s, x, i) => s + (5 - i) * x.count, 0) / total;
  const submitReply = () => {
    if (!reply || !text.trim()) return;
    setList((l) => l.map((r) => (r.id === reply.id ? { ...r, replied: true } : r)));
    toast.success("Reply posted");
    setReply(null);
    setText("");
  };
  return (
    <div className="mx-auto max-w-[1200px]">
      <LmsPageHeader
        eyebrow="Learners"
        title="Reviews"
        description="What your students think — reply, and improve."
      />

      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl card-premium p-6 text-center">
          <div className="font-display text-5xl font-semibold">{avg.toFixed(2)}</div>
          <div className="mt-1 flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, k) => (
              <Star
                key={k}
                className={`h-4 w-4 ${k < Math.round(avg) ? "fill-current text-warning" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{total.toLocaleString()} reviews</div>
        </div>
        <div className="rounded-2xl card-premium p-6 md:col-span-2">
          <div className="space-y-2.5">
            {ratingDistribution.map((r) => {
              const pct = (r.count / total) * 100;
              return (
                <div key={r.star} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-medium text-muted-foreground">{r.star}</span>
                  <Progress value={pct} className="h-2 flex-1" />
                  <span className="w-12 text-right text-xs text-muted-foreground">
                    {r.count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl card-premium p-5"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={r.avatar} />
                <AvatarFallback>{r.student[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{r.student}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {r.course} · {r.date}
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star
                    key={k}
                    className={`h-3 w-3 ${k < r.rating ? "fill-current text-warning" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm">{r.text}</p>
            <div className="mt-3 flex items-center justify-between">
              {r.replied ? (
                <Badge className="border-0 bg-success/15 text-success">Replied</Badge>
              ) : (
                <span />
              )}
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg border-border/60"
                onClick={() => setReply(r)}
              >
                {r.replied ? "Edit reply" : "Reply"}
              </Button>
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
                {reply.course} · {reply.date}
              </div>
              <div className="mt-4 rounded-xl bg-muted/30 p-4 text-sm">{reply.text}</div>
              <div className="mt-4">
                <Textarea
                  rows={6}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Thank them, address their feedback…"
                  className="rounded-xl"
                />
                <Button
                  className="mt-3 w-full rounded-xl gradient-primary border-0 text-primary-foreground"
                  onClick={submitReply}
                  disabled={!text.trim()}
                >
                  <Send className="mr-1.5 h-4 w-4" /> Post reply
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

