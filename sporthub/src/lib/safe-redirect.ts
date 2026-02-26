/**
 * Sanitize a redirect path from query params (e.g. ?next=) to prevent open redirects.
 * Allows only internal paths: single leading "/", no "//", no protocol.
 * Use for auth callback and code-exchange redirects.
 */
export function sanitizeNextPath(next: string | null | undefined): string {
  const s = String(next ?? "").trim();
  if (!s) return "/";
  const pathOnly = s.includes("?") ? s.slice(0, s.indexOf("?")) : s;
  if (!pathOnly.startsWith("/") || pathOnly.startsWith("//") || pathOnly.includes(":")) {
    return "/";
  }
  return pathOnly;
}
