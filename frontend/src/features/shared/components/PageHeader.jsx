import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
export function LmsPageHeader({ eyebrow, title, description, actions }) {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8"
    >
      <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="flex items-center gap-1 hover:text-foreground">
          <Home className="h-3 w-3" /> Home
        </Link>
        {parts.map((p) => (
          <span key={p} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 opacity-50" />
            <span className="capitalize">{p.replace(/-/g, " ")}</span>
          </span>
        ))}
      </nav>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </div>
          )}
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </motion.div>
  );
}
