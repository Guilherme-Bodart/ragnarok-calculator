/**
 * Normalizes the backend API base URL across local development and production (Vercel / Render).
 * Ensures `/api` prefix is always present even if `NEXT_PUBLIC_API_URL` was set to the root domain.
 */
export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:4000/api";

  const trimmed = raw.trim().replace(/\/+$/, "");

  if (!trimmed.endsWith("/api")) {
    return `${trimmed}/api`;
  }

  return trimmed;
}

export const apiBaseUrl = getApiBaseUrl();
