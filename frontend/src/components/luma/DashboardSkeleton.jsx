import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton({ variant = "dashboard", rows = 6 }) {
  const isMessages = variant === "messages";

  if (isMessages) {
    return (
      <div className="mx-auto grid h-[calc(100vh-7rem)] max-w-[1500px] gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl card-premium p-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/5" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex min-h-0 flex-col rounded-2xl card-premium">
          <div className="flex items-center gap-3 border-b border-border/60 p-4">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex-1 space-y-5 p-5">
            <Skeleton className="h-12 w-2/5 rounded-2xl" />
            <Skeleton className="ml-auto h-12 w-1/3 rounded-2xl" />
            <Skeleton className="h-12 w-1/2 rounded-2xl" />
            <Skeleton className="ml-auto h-12 w-2/5 rounded-2xl" />
          </div>
          <div className="border-t border-border/60 p-4">
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-9 w-64 rounded-xl" />
          <Skeleton className="h-4 w-[min(520px,80vw)] rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl card-premium p-5">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="mt-5 h-3 w-28 rounded-full" />
            <Skeleton className="mt-3 h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl card-premium p-4">
        <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="grid gap-4 py-4 md:grid-cols-[2fr_1fr_1fr_120px] md:items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/5 rounded-full" />
                  <Skeleton className="h-3 w-4/5 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
