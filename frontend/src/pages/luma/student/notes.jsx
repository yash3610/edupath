import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, StickyNote, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notes as seed } from "@/features/student/data/mock";
import { toast } from "sonner";
export default function NotesPage() {
  const [list, setList] = useState(seed);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ course: "", title: "", body: "" });
  const startNew = () => {
    setEditing(null);
    setDraft({ course: "Advanced React", title: "", body: "" });
    setOpen(true);
  };
  const startEdit = (n) => {
    setEditing(n);
    setDraft({ course: n.course, title: n.title, body: n.body });
    setOpen(true);
  };
  const save = () => {
    if (!draft.title.trim()) {
      toast.error("Title required");
      return;
    }
    if (editing) {
      setList((l) =>
        l.map((x) => (x.id === editing.id ? { ...x, ...draft, updated: "Just now" } : x)),
      );
      toast.success("Note updated");
    } else {
      setList((l) => [{ id: `nt${Date.now()}`, ...draft, updated: "Just now" }, ...l]);
      toast.success("Note created");
    }
    setOpen(false);
  };
  const remove = (id) => {
    setList((l) => l.filter((x) => x.id !== id));
    toast("Note deleted");
  };
  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader
        eyebrow="Capture"
        title="Notes"
        description={`${list.length} note${list.length === 1 ? "" : "s"} · organized by course, searchable, beautiful.`}
        actions={
          <Button
            className="rounded-xl gradient-primary border-0 text-primary-foreground"
            onClick={startNew}
          >
            <Plus className="mr-2 h-4 w-4" /> New note
          </Button>
        }
      />
      {list.length === 0 ? (
        <div className="rounded-2xl card-premium p-16 text-center text-sm text-muted-foreground">
          No notes yet — click "New note" to capture your first idea.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="group rounded-2xl card-premium p-5"
            >
              <div className="flex items-start justify-between">
                <Badge className="border-0 bg-accent/15 text-accent">{n.course}</Badge>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => startEdit(n)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={() => remove(n.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <button onClick={() => startEdit(n)} className="mt-3 block w-full text-left">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-lg font-semibold">{n.title}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{n.body}</p>
                <div className="mt-4 text-xs text-muted-foreground">Updated {n.updated}</div>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit note" : "New note"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Course</Label>
              <Input
                value={draft.course}
                onChange={(e) => setDraft({ ...draft, course: e.target.value })}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="mt-1 rounded-xl"
                placeholder="e.g. useEffect cleanup patterns"
              />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea
                rows={6}
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl gradient-primary border-0 text-primary-foreground"
              onClick={save}
            >
              {editing ? "Save changes" : "Create note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

