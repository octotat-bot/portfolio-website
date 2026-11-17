"use client";

// Button: a square block with a mono label, 48px tall.
//   primary: burgundy field, ivory label. One per screen.
//   ghost: 1px ivory line.
//   on-burgundy: ivory field, midnight label.
// M07 button fill: on hover or focus the fill colour grows from the left in
// dur-roll, the label changes colour 120ms later, a press moves it down 1px.
// The on-burgundy button fills midnight with an ivory label (decision 8).
// The fill is a scaleX pseudo-element; see .button in globals.css.

import type { MouseEventHandler } from "react";
import { TransitionLink, isExternal, isFile } from "@/components/shell/wipe";

export type ButtonVariant = "primary" | "ghost" | "on-burgundy";

type Props = {
  children: string;
  variant?: ButtonVariant;
  href?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit";
  className?: string;
  /** Show a state without interaction (styleguide). */
  force?: "hover" | "pressed";
};

export function Button({ children, variant = "primary", href, onClick, type = "button", className = "", force }: Props) {
  const classes = `button button-${variant} label ${className}`;
  const label = <span className="relative">{children}</span>;

  if (href && isExternal(href)) {
    // Files (the resume PDF) open in a new tab.
    const file = isFile(href);
    return (
      <a href={href} className={classes} data-force={force} {...(file ? { target: "_blank", rel: "noopener" } : {})}>
        {label}
      </a>
    );
  }
  if (href) {
    return (
      <TransitionLink href={href} className={classes} data-force={force}>
        {label}
      </TransitionLink>
    );
  }
  return (
    <button type={type} onClick={onClick} className={classes} data-force={force}>
      {label}
    </button>
  );
}
