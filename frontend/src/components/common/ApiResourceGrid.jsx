import React from "react";
import useApiResource from "../../hooks/useApiResource.js";
import { Skeleton } from "../ui/skeleton.jsx";

export default function ApiResourceGrid({ resource, Card, className = "" }) {
  const { data, loading, error } = useApiResource(resource);

  if (loading) return (
    <div className={className}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <Skeleton className="mt-4 h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
  if (error) return <p className="app-form-status error text-center">{error}</p>;

  return (
    <div className={className}>
      {data.map((item) => (
        <Card key={item._id || item.slug} {...{ [resource === "team" ? "member" : resource.slice(0, -1)]: item }} />
      ))}
    </div>
  );
}
