"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { titleForPath } from "./nav";

function Title() {
  const title = titleForPath(usePathname());
  return <>{title}</>;
}

/** Current page title for the TopBar (H2 22/30 Bold). Suspense: see NavItem. */
export function PageTitle() {
  return (
    <h1 className="truncate text-[22px] leading-[30px] font-bold text-text-primary">
      <Suspense fallback={null}>
        <Title />
      </Suspense>
    </h1>
  );
}
