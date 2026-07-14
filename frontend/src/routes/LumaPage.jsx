import React from "react";
import DashboardSkeleton from "../components/luma/DashboardSkeleton.jsx";

const pageModules = import.meta.glob("../pages/dashboard/**/*.jsx");
const pageComponents = Object.fromEntries(
  Object.entries(pageModules).map(([path, loader]) => [path, React.lazy(loader)]),
);

export default function LumaPage({ role, name = "index" }) {
  const path = `../pages/dashboard/${role}/${name}.jsx`;
  const Component = pageComponents[path];

  if (!Component) {
    throw new Error(`Dashboard page not found: ${path}`);
  }

  return (
    <React.Suspense fallback={<DashboardSkeleton variant={name === "messages" ? "messages" : "dashboard"} />}>
      <Component />
    </React.Suspense>
  );
}
