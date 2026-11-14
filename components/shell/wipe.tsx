"use client";

import { useLenis } from "lenis/react";
import { useAnimate } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useRef, type ComponentProps, type ReactNode } from "react";
import { useIsomorphicLayoutEffect, useReduced } from "@/lib/hooks";
import { setCurtain } from "@/lib/curtain";
import { wipe } from "@/lib/motion";

// M02 burgundy stairs wipe. Five burgundy columns rise from the bottom one
// after another, cover the screen, the new page mounts underneath, then the
// columns leave upward in the same order.
//
// Driven by Motion on a fixed overlay rather than React's <ViewTransition>,
// because it also has to run where no route changes: the end of the intro and
// a menu link to the page already shown. With reduced motion every change is
// an instant cut.

type PlayOptions = {
  /** Runs while the screen is fully covered. */
  onCovered?: () => void | Promise<void>;
};

type WipeApi = {
  /** Wipe to another route. A link to the current page only runs `onCovered`. */
  navigate: (href: string, options?: PlayOptions) => void;
  /** Cover and uncover the screen without changing route. */
  play: (options?: PlayOptions) => Promise<void>;
};

const WipeContext = createContext<WipeApi | null>(null);

export function useWipe(): WipeApi {
  const api = useContext(WipeContext);
  if (!api) throw new Error("useWipe must be used inside <WipeProvider>");
  return api;
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const COLUMNS = Array.from({ length: wipe.columns }, (_, i) => i);
/** If a route never arrives, uncover anyway after this long. */
const ARRIVAL_TIMEOUT = 8000;

export function WipeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReduced();
  const lenis = useLenis();
  const [scope, animate] = useAnimate<HTMLDivElement>();

  const busy = useRef(false);
  const pending = useRef<{ path: string; resolve: () => void } | null>(null);
  const shownPath = useRef(pathname);

  const columns = useCallback(() => Array.from(scope.current?.children ?? []) as HTMLElement[], [scope]);

  const run = useCallback(
    (from: string, to: string) =>
      Promise.all(
        columns().map((el, i) =>
          animate(el, { y: [from, to] }, { duration: wipe.duration, ease: wipe.ease, delay: i * wipe.stagger }),
        ),
      ).then(() => undefined),
    [animate, columns],
  );

  const setBlocking = useCallback(
    (on: boolean) => {
      if (scope.current) scope.current.dataset.blocking = on ? "true" : "false";
    },
    [scope],
  );

  const cover = useCallback(async () => {
    setBlocking(true);
    await run("100%", "0%");
    setCurtain("covered");
  }, [run, setBlocking]);

  const uncover = useCallback(async () => {
    setCurtain("clear");
    await run("0%", "-100%");
    await Promise.all(columns().map((el) => animate(el, { y: "100%" }, { duration: 0 })));
    setBlocking(false);
  }, [columns, run, setBlocking]);

  const toTop = useCallback(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [lenis]);

  const play = useCallback(
    async ({ onCovered }: PlayOptions = {}) => {
      if (reduced) {
        await onCovered?.();
        return;
      }
      if (busy.current) return;
      busy.current = true;
      try {
        await cover();
        await onCovered?.();
        await nextFrame();
        await uncover();
      } finally {
        busy.current = false;
      }
    },
    [cover, reduced, uncover],
  );

  const navigate = useCallback(
    (href: string, { onCovered }: PlayOptions = {}) => {
      const target = new URL(href, window.location.href);
      if (target.pathname === window.location.pathname) {
        void play({ onCovered: async () => {
          await onCovered?.();
          toTop();
        } });
        return;
      }
      if (reduced) {
        void Promise.resolve(onCovered?.()).then(() => router.push(href));
        return;
      }
      if (busy.current) return;
      busy.current = true;
      void (async () => {
        try {
          await cover();
          await onCovered?.();
          const arrived = new Promise<void>((resolve) => {
            pending.current = { path: target.pathname, resolve };
            window.setTimeout(resolve, ARRIVAL_TIMEOUT);
          });
          router.push(href, { scroll: false });
          await arrived;
          pending.current = null;
          toTop();
          await nextFrame();
          await nextFrame();
          await uncover();
        } finally {
          busy.current = false;
        }
      })();
    },
    [cover, play, reduced, router, toTop, uncover],
  );

  // A route arrived. Either one we asked for, or the browser's back and
  // forward buttons, which cannot be delayed: cover instantly before this
  // frame paints, then uncover.
  useIsomorphicLayoutEffect(() => {
    if (pathname === shownPath.current) return;
    shownPath.current = pathname;
    if (pending.current?.path === pathname) {
      pending.current.resolve();
      return;
    }
    if (reduced || busy.current) return;
    busy.current = true;
    columns().forEach((el) => void animate(el, { y: "0%" }, { duration: 0 }));
    setBlocking(true);
    setCurtain("covered");
    toTop();
    void (async () => {
      try {
        await nextFrame();
        await uncover();
      } finally {
        busy.current = false;
      }
    })();
  }, [pathname]);

  const api = useMemo<WipeApi>(() => ({ navigate, play }), [navigate, play]);

  return (
    <WipeContext.Provider value={api}>
      {children}
      <div
        ref={scope}
        aria-hidden="true"
        data-blocking="false"
        className="pointer-events-none fixed inset-0 z-80 flex overflow-hidden data-[blocking=true]:pointer-events-auto"
      >
        {COLUMNS.map((i) => (
          <div key={i} className="h-full flex-1 bg-burgundy" style={{ transform: "translateY(100%)" }} />
        ))}
      </div>
    </WipeContext.Provider>
  );
}

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/** An internal link that plays the wipe. Use for every link to a page on this site. */
export function TransitionLink({ href, onNavigate, ...props }: TransitionLinkProps) {
  const { navigate } = useWipe();
  return (
    <Link
      href={href}
      onNavigate={(event) => {
        onNavigate?.(event);
        event.preventDefault();
        navigate(href);
      }}
      {...props}
    />
  );
}

/** True for links that leave the site or open the mail client. */
export const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);
