import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Play, Star, Trash2 } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { wishlist } from "@/features/student/data/mock";
import { toast } from "sonner";
import usePersistedDashboardState from "@/hooks/usePersistedDashboardState";
export default function WishlistPage() {
  const [list, setList] = usePersistedDashboardState("student", "wishlist", wishlist);
  const remove = (id) => {
    setList((l) => l.filter((x) => x.id !== id));
    toast("Removed from wishlist");
  };
  const enroll = (title, id) => {
    setList((l) => l.filter((x) => x.id !== id));
    toast.success(`Enrolled in ${title}`);
  };
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Saved"
        title="Wishlist"
        description={`${list.length} course${list.length === 1 ? "" : "s"} you're eyeing for the next sprint.`}
        actions={
          list.length > 0 ? (
            <Button
              variant="outline"
              className="rounded-xl border-border/60"
              onClick={() => {
                setList([]);
                toast("Wishlist cleared");
              }}
            >
              Clear all
            </Button>
          ) : undefined
        }
      />

      {list.length === 0 ? (
        <div className="rounded-2xl card-premium p-16 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl gradient-primary shadow-glow">
            <Heart className="h-7 w-7 text-primary-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold">Your wishlist is empty</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse the library and tap the heart on any course.
          </p>
          <Link to="/dashboard/courses">
            <Button className="mt-4 rounded-xl gradient-primary border-0 text-primary-foreground">
              Browse courses
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="group overflow-hidden rounded-2xl card-premium"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={c.cover}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <Badge className="absolute left-3 top-3 border-0 bg-background/80 text-foreground">
                  {c.category}
                </Badge>
                <button
                  onClick={() => remove(c.id)}
                  className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-destructive backdrop-blur transition hover:bg-background"
                  aria-label="Remove"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 font-display text-base font-semibold">{c.title}</h3>
                <div className="mt-0.5 text-xs text-muted-foreground">{c.instructor}</div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {c.lectures} lectures · {c.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-warning" /> {c.rating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="h-9 flex-1 rounded-lg gradient-primary border-0 text-primary-foreground text-xs"
                    onClick={() => enroll(c.title, c.id)}
                  >
                    <Play className="mr-1 h-3.5 w-3.5" /> Enroll
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-lg border-border/60 text-xs"
                    onClick={() => remove(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

