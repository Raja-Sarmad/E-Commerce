const PRODUCTION_API_URL =
  "https://e-commerce-backend-sigma-rose.vercel.app/api/v1";
const LOCAL_API_URL = "http://localhost:5000/api/v1";
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

/** Backend base URL; blank env uses production URL on Vercel builds, localhost otherwise. */
export const API_URL =
  configuredApiUrl ||
  (process.env.NODE_ENV === "production" ? PRODUCTION_API_URL : LOCAL_API_URL);

export const API_TIMEOUT_MS = 30_000;
