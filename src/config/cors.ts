/**
 * Allowed browser origins for CORS. Extend via CORS_ORIGINS (comma-separated) in env.
 */

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, "");
}

function parseList(raw?: string): string[] {
  if (!raw?.trim()) return [];
  return raw.split(",").map((item) => normalizeOrigin(item)).filter(Boolean);
}

export function getAllowedOrigins(): Set<string> {
  const defaults = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://service-hub-client.vercel.app",
  ];
  const fromClient = process.env.CLIENT_URL ? [normalizeOrigin(process.env.CLIENT_URL)] : [];
  const fromEnv = parseList(process.env.CORS_ORIGINS);

  return new Set([...defaults, ...fromClient, ...fromEnv].map(normalizeOrigin));
}

/** Returns the request Origin header value if it is allowed; otherwise false. */
export function resolveAllowedOrigin(originHeader: string | undefined): string | false {
  if (!originHeader) return false;
  const allowed = getAllowedOrigins();
  if (allowed.has(normalizeOrigin(originHeader))) {
    return originHeader.trim();
  }
  return false;
}

export function applyCorsHeaders(
  originHeader: string | undefined,
  requestHeaders: Record<string, string | string[] | undefined> | undefined,
  setHeader: (name: string, value: string) => void
): void {
  const allowOrigin = resolveAllowedOrigin(
    typeof originHeader === "string" ? originHeader : undefined
  );

  if (allowOrigin) {
    setHeader("Access-Control-Allow-Origin", allowOrigin);
    setHeader("Vary", "Origin");
  }

  setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  setHeader("Access-Control-Allow-Headers", "*");
  setHeader("Access-Control-Max-Age", "86400");

  const raw = requestHeaders as Record<string, string | string[] | undefined> | undefined;
  const requested =
    typeof raw?.["access-control-request-headers"] === "string"
      ? raw["access-control-request-headers"]
      : Array.isArray(raw?.["access-control-request-headers"])
        ? raw["access-control-request-headers"].join(", ")
        : undefined;
  if (requested) {
    setHeader("Access-Control-Allow-Headers", requested);
  }
}
