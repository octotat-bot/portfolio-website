"use client";

import type { ReactNode } from "react";
import { useMenu } from "./menu-state";

/** Everything behind the menu. Inert while the menu is open. */
export function PageFrame({ children }: { children: ReactNode }) {
  const { open } = useMenu();
  return <div inert={open}>{children}</div>;
}
