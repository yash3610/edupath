import React from "react";

const pageModules = import.meta.glob("../pages/luma/**/*.jsx");
const pageComponents = Object.fromEntries(
  Object.entries(pageModules).map(([path, loader]) => [path, React.lazy(loader)]),
);

export default function LumaPage({ role, name = "index" }) {
  const path = `../pages/luma/${role}/${name}.jsx`;
  const Component = pageComponents[path];

  if (!Component) {
    throw new Error(`Luma dashboard page not found: ${path}`);
  }

  return <Component />;
}
