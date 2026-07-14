import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, RefreshCcw, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { LmsPageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyPanel, PageLoader, formatDateTime } from "@/pages/dashboard/_dynamic/LumaDynamicUtils";
import { communityApi } from "@/services/communityApi";

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState([]);
  const [thread, setThread] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setPosts(await communityApi.adminCommunity());
    } catch (error) {
      toast.error(error.message || "Unable to load community posts.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function openThread(post) {
    try {
      const details = await communityApi.questionDetails(post.id);
      setThread(details.question);
      setAnswers(details.answers);
    } catch (error) {
      toast.error(error.message || "Unable to open thread.");
    }
  }

  async function removePost(post) {
    try {
      await communityApi.deleteQuestion(post.id);
      setPosts((items) => items.filter((item) => item.id !== post.id));
      if (thread?.id === post.id) setThread(null);
      toast.success("Discussion removed.");
    } catch (error) {
      toast.error(error.message || "Unable to remove discussion.");
    }
  }

  if (loading) return <PageLoader label="Loading community" />;

  return (
    <div className="mx-auto max-w-[1100px]">
      <LmsPageHeader
        eyebrow="People"
        title="Community Moderation"
        description="Review live discussion questions across the platform."
        actions={
          <Button variant="outline" className="rounded-xl border-border/60" onClick={load}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        }
      />

      {posts.length ? (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl card-premium p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.avatar} />
                    <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{post.authorName}</div>
                    <div className="text-xs text-muted-foreground">
                      {post.courseTitle} · {formatDateTime(post.createdAt)}
                    </div>
                  </div>
                </div>
                <Badge className="border-0 bg-primary/15 text-primary">
                  {post.answerCount} answers
                </Badge>
              </div>
              <div className="mt-3 font-display text-lg font-medium">{post.title}</div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-border/60"
                  onClick={() => openThread(post)}
                >
                  <MessageSquare className="mr-1 h-3.5 w-3.5" /> Open thread
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => removePost(post)}
                >
                  <ShieldX className="mr-1 h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyPanel title="No discussions found" description="Community moderation is clean right now." />
      )}

      <Sheet open={!!thread} onOpenChange={(open) => !open && setThread(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {thread && (
            <>
              <SheetHeader>
                <Badge className="w-fit border-0 bg-primary/15 text-primary">{thread.courseTitle}</Badge>
                <SheetTitle className="mt-2 font-display text-xl">{thread.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-2 text-xs text-muted-foreground">
                {thread.authorName} · {formatDateTime(thread.createdAt)}
              </div>
              <div className="mt-4 rounded-xl bg-muted/30 p-4 text-sm">{thread.body}</div>
              <div className="mt-6 space-y-3">
                {answers.map((answer) => (
                  <div key={answer.id} className="rounded-xl border border-border/60 bg-muted/20 p-3">
                    <div className="text-sm font-medium">{answer.authorName}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{answer.body}</div>
                  </div>
                ))}
                {!answers.length && (
                  <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                    No answers in this thread.
                  </div>
                )}
              </div>
              <Button
                className="mt-5 w-full rounded-xl"
                variant="destructive"
                onClick={() => removePost(thread)}
              >
                Remove discussion
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
