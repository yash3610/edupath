import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Download, FileArchive, FileText, FileVideo, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { learningApi } from "@/services/learningApi";
import { assetUrl } from "@/services/api";
import { toast } from "sonner";

const iconFor = {
  pdf: FileText,
  document: FileText,
  doc: FileText,
  docx: FileText,
  vtt: FileText,
  zip: FileArchive,
  video: FileVideo,
};

function typeFrom(item = {}) {
  const raw = String(item.type || "").toLowerCase();
  const url = String(item.url || "").toLowerCase();
  if (raw.includes("pdf") || url.endsWith(".pdf")) return "pdf";
  if (raw.includes("zip") || url.endsWith(".zip")) return "zip";
  if (raw.includes("video") || /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url)) return "video";
  if (raw.includes("word") || url.endsWith(".doc") || url.endsWith(".docx")) return "document";
  if (raw.includes("vtt") || url.endsWith(".vtt")) return "vtt";
  return raw || "resource";
}

function formatDate(value) {
  if (!value) return "Recently";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function mapDownload(item = {}) {
  const url = assetUrl(item.url);
  const type = typeFrom({ ...item, url });
  return {
    ...item,
    id: item.id || `${item.lectureId || "download"}-${item.name || item.url}`,
    name: item.name || item.title || "Download",
    course: item.course || "Course",
    lecture: item.lecture || "Lecture",
    module: item.module || "Module",
    type,
    url,
    updated: formatDate(item.updatedAt || item.uploaded || item.createdAt),
  };
}

export default function DownloadsPage() {
  const [list, setList] = useState([]);
  const [hidden, setHidden] = useState(() => new Set());
  const [done, setDone] = useState({});
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  const loadDownloads = async () => {
    setLoading(true);
    try {
      const result = await learningApi.getDownloads();
      setList((result || []).map(mapDownload));
    } catch (error) {
      toast.error(error.message || "Unable to load downloads.");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDownloads();
  }, []);

  const visibleList = useMemo(() => list.filter((item) => !hidden.has(item.id)), [hidden, list]);

  const download = (file) => {
    if (!file.url) {
      toast.error("This file does not have a download URL.");
      return;
    }
    if (progress[file.id] !== undefined) return;
    setProgress((p) => ({ ...p, [file.id]: 0 }));

    let pct = 0;
    const timer = setInterval(() => {
      pct += 18 + Math.random() * 22;
      if (pct >= 100) {
        clearInterval(timer);
        setProgress((p) => {
          const next = { ...p };
          delete next[file.id];
          return next;
        });
        setDone((d) => ({ ...d, [file.id]: true }));
        window.open(file.url, "_blank", "noopener,noreferrer");
        toast.success(`${file.name} is ready to download.`);
      } else {
        setProgress((p) => ({ ...p, [file.id]: Math.min(99, pct) }));
      }
    }, 180);
  };

  const remove = (id) => {
    setHidden((current) => new Set([...current, id]));
    toast("File removed from this list.");
  };

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        eyebrow="Offline"
        title="Downloads"
        description="Downloadable files from your enrolled courses."
        actions={
          <Button variant="outline" className="rounded-xl border-border/60" onClick={loadDownloads} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="grid h-64 place-items-center rounded-2xl card-premium">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : visibleList.length === 0 ? (
        <div className="rounded-2xl card-premium p-16 text-center text-sm text-muted-foreground">
          No downloadable files are available for your enrolled courses yet.
        </div>
      ) : (
        <div className="rounded-2xl card-premium overflow-hidden">
          {visibleList.map((file, index) => {
            const Icon = iconFor[file.type] || FileText;
            const pct = progress[file.id];
            const isDone = done[file.id];
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex items-center gap-4 border-b border-border/60 p-4 last:border-0 hover:bg-muted/30"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-primary shadow-soft">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{file.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {file.course} · {file.lecture} · {file.updated}
                  </div>
                  {pct !== undefined && <Progress value={pct} className="mt-2 h-1.5" />}
                </div>
                {isDone ? (
                  <Button variant="outline" className="rounded-xl border-success/40 text-success" disabled>
                    <Check className="mr-2 h-4 w-4" /> Downloaded
                  </Button>
                ) : (
                  <Button variant="outline" className="rounded-xl" disabled={pct !== undefined} onClick={() => download(file)}>
                    <Download className="mr-2 h-4 w-4" />
                    {pct !== undefined ? `${Math.round(pct)}%` : "Download"}
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 rounded-lg text-destructive"
                  onClick={() => remove(file.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
