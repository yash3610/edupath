import React from "react";
import useApiResource from "../../hooks/useApiResource.js";

export default function ApiResourceGrid({ resource, Card, className = "" }) {
  const { data, loading, error } = useApiResource(resource);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="app-form-status error text-center">{error}</p>;

  return (
    <div className={className}>
      {data.map((item) => (
        <Card key={item._id || item.slug} {...{ [resource === "team" ? "member" : resource.slice(0, -1)]: item }} />
      ))}
    </div>
  );
}
