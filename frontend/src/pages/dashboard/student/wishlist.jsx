import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, Trash2 } from "lucide-react";
import { PageHeader } from "@/features/student/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, assetUrl } from "@/services/api";
import { toast } from "sonner";

const fallbackCover = "/assets/images/course/course-1/1.png";

const mapWishlistItem = (item = {}) => {
  const course = item.course || item;
  const instructor = course.instructor;
  return {
    id: course._id || course.id || item._id,
    wishlistId: item._id,
    slug: course.slug || course._id || course.id,
    title: course.title || "Course",
    cover: assetUrl(course.thumbnail) || fallbackCover,
    category: course.category || "Uncategorized",
    instructor: typeof instructor === "object" && instructor ? instructor.name : course.instructorName || "Instructor",
    lectures: Number(course.totalLectures || course.lectures || 0),
    duration: course.duration || course.durationText || "Self paced",
    rating: Number(course.rating || 0),
  };
};

export default function WishlistPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/api/wishlist")
      .then((result) => setList((result.data || []).map(mapWishlistItem).filter((item) => item.id)))
      .catch((error) => toast.error(error.message || "Unable to load your wishlist."))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    try {
      await apiRequest(`/api/wishlist/${id}`, { method: "DELETE" });
      setList((items) => items.filter((item) => item.id !== id));
      toast("Removed from wishlist");
    } catch (error) {
      toast.error(error.message || "Unable to remove this item from your wishlist.");
    }
  };

  const clearAll = async () => {
    await Promise.allSettled(list.map((item) => apiRequest(`/api/wishlist/${item.id}`, { method: "DELETE" })));
    setList([]);
    toast("Wishlist cleared");
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Saved"
        title="Wishlist"
        description={loading ? "Loading saved courses..." : `${list.length} saved course${list.length === 1 ? "" : "s"}.`}
        actions={
          list.length > 0 ? (
            <Button variant="outline" className="rounded-xl border-border/60" onClick={clearAll}>
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
          <p className="mt-2 text-sm text-muted-foreground">Browse the library and save courses you like.</p>
          <Link to="/courses">
            <Button className="mt-4 rounded-xl gradient-primary border-0 text-primary-foreground">Browse courses</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {list.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="group overflow-hidden rounded-2xl card-premium"
            >
              <div className="relative h-44 overflow-hidden">
                <img src={course.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <Badge className="absolute left-3 top-3 border-0 bg-background/80 text-foreground">{course.category}</Badge>
                <button
                  onClick={() => remove(course.id)}
                  className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-background/80 text-destructive backdrop-blur transition hover:bg-background"
                  aria-label="Remove"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 font-display text-base font-semibold">{course.title}</h3>
                <div className="mt-0.5 text-xs text-muted-foreground">{course.instructor}</div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{course.lectures} lectures · {course.duration}</span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-warning" /> {course.rating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link to={`/courses/${course.slug}`} className="flex-1">
                    <Button size="sm" className="h-9 w-full rounded-lg gradient-primary border-0 text-primary-foreground text-xs">View course</Button>
                  </Link>
                  <Button size="sm" variant="outline" className="h-9 rounded-lg border-border/60 text-xs" onClick={() => remove(course.id)}>
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
