export const OWNER_GITHUB_ID = "63797040";

export function isOwner(id: unknown): boolean {
  return typeof id === "string" && id === OWNER_GITHUB_ID;
}

export function authConfigured(): boolean {
  return !!(process.env.AUTH_SECRET && process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);
}

export function isLocalDevelopment(url: URL): boolean {
  return process.env.NODE_ENV === "development" && ["localhost", "127.0.0.1"].includes(url.hostname);
}
