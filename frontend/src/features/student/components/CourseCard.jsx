import { motion } from "framer-motion";
import { Clock, PlayCircle, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
export function CourseCard({ course, index = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-2xl card-premium transition-all hover:shadow-elegant"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={course.cover}
          alt={course.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
        <Badge className="absolute left-3 top-3 border-0 bg-background/80 text-foreground backdrop-blur-md">
          {course.category}
        </Badge>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs backdrop-blur-md">
          <Star className="h-3 w-3 fill-primary text-primary" /> {course.rating}
        </div>
        <button
          className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="Play"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full gradient-primary shadow-glow">
            <PlayCircle className="h-7 w-7 text-primary-foreground" />
          </span>
        </button>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-1 font-display text-lg font-semibold">{course.title}</h3>
        <div className="mt-1 text-xs text-muted-foreground">by {course.instructor}</div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {course.completed}/{course.lectures} lectures
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {course.duration}
          </span>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Progress</span>
            <span className="text-primary font-semibold">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-1.5" />
        </div>

        <Button className="mt-4 w-full rounded-xl gradient-primary text-primary-foreground border-0 hover:opacity-90">
          {course.status === "completed"
            ? "Review"
            : course.status === "not-started"
              ? "Start"
              : "Continue"}
        </Button>
      </div>
    </motion.article>
  );
}
