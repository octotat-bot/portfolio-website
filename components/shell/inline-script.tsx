// An inline script that runs while the HTML is parsed, before first paint.
// From the Next.js guide "Preventing flash before hydration": the type is
// text/plain on the client so React does not warn about rendering a script.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
