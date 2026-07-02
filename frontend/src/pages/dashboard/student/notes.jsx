import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, StickyNote, Trash2, Pencil } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/services/api";
import { toast } from "sonner";

const mapNote = (note = {}) => ({
  id: note._id || note.id,
  course: note.course?.title || note.courseTitle || "General",
  courseId: note.course?._id || note.course || "",
  title: note.title || "Untitled note",
  body: note.content || note.body || "",
  updated: note.updatedAt ? new Date(note.updatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Recently",
});

export default function NotesPage() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ course: "", title: "", body: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/notes")
      .then((result) => setList((result.data || []).map(mapNote)))
      .catch((error) => toast.error(error.message || "Notes load zale nahit."))
      .finally(() => setLoading(false));
  }, []);

  const startNew = () => {
    setEditing(null);
    setDraft({ course: "General", title: "", body: "" });
    setOpen(true);
  };

  const startEdit = (note) => {
    setEditing(note);
    setDraft({ course: note.course, title: note.title, body: note.body });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.title.trim()) {
      toast.error("Title required");
      return;
    }
    const payload = { title: draft.title.trim(), content: draft.body, courseTitle: draft.course || "General" };
    try {
      if (editing) {
        const result = await apiRequest(`/api/notes/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) });
        const updated = mapNote(result.data);
        setList((items) => items.map((item) => item.id === editing.id ? updated : item));
        toast.success("Note updated");
      } else {
        const result = await apiRequest("/api/notes", { method: "POST", body: JSON.stringify(payload) });
        setList((items) => [mapNote(result.data), ...items]);
        toast.success("Note created");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error.message || "Note save zali nahi.");
    }
  };

  const remove = async (id) => {
    try {
      await apiRequest(`/api/notes/${id}`, { method: "DELETE" });
      setList((items) => items.filter((item) => item.id !== id));
      toast("Note deleted");
    } catch (error) {
      toast.error(error.message || "Note delete zali nahi.");
    }
  };

  return (
    <div className="mx-auto max-w-[1300px]">
      <PageHeader
        eyebrow="Capture"
        title="Notes"
        description={loading ? "Loading notes..." : `${list.length} note${list.length === 1 ? "" : "s"} from your account.`}
        actions={
          <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={startNew}>
            <Plus className="mr-2 h-4 w-4" /> New note
          </Button>
        }
      />
      {list.length === 0 ? (
        <div className="rounded-2xl card-premium p-16 text-center text-sm text-muted-foreground">No notes yet.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((note, i) => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -4 }} className="group rounded-2xl card-premium p-5">
              <div className="flex items-start justify-between">
                <Badge className="border-0 bg-accent/15 text-accent">{note.course}</Badge>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(note)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(note.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <button onClick={() => startEdit(note)} className="mt-3 block w-full text-left">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-lg font-semibold">{note.title}</h3>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{note.body}</p>
                <div className="mt-4 text-xs text-muted-foreground">Updated {note.updated}</div>
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
              <Input value={draft.course} onChange={(event) => setDraft({ ...draft, course: event.target.value })} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="mt-1 rounded-xl" placeholder="e.g. useEffect cleanup patterns" />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea rows={6} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} className="mt-1 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="rounded-xl gradient-primary border-0 text-primary-foreground" onClick={save}>{editing ? "Save changes" : "Create note"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
