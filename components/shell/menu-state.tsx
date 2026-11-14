"use client";

import { createContext, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";

type MenuState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Close without the closing animation, under the wipe. */
  closeInstantly: () => void;
  /** True when the last close should skip its animation. */
  instant: boolean;
  buttonRef: RefObject<HTMLButtonElement | null>;
};

const MenuContext = createContext<MenuState | null>(null);

export function useMenu(): MenuState {
  const state = useContext(MenuContext);
  if (!state) throw new Error("useMenu must be used inside <MenuProvider>");
  return state;
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const [instant, setInstant] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const value = useMemo<MenuState>(
    () => ({
      open,
      instant,
      buttonRef,
      setOpen: (next) => {
        setInstant(false);
        setOpenState(next);
      },
      closeInstantly: () => {
        setInstant(true);
        setOpenState(false);
      },
    }),
    [open, instant],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
