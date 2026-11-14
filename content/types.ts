/**
 * A value that may still be a blank. Every square-bracket placeholder in
 * docs/CONTENT.md is stored as `null`; the UI hides it or shows `site.blank`.
 * Filling one in is a data change only.
 */
export type Maybe<T> = T | null;

export type ExternalLink = {
  label: string;
  /** A URL, or a bare address when `kind` is "email". */
  value: Maybe<string>;
  kind: "url" | "email";
};

export type Cta = { label: string; href: string };
