import { NextResponse } from "next/server";
import { auth } from "./auth";
import { checkRateLimit, RATE_LIMITS, type RateLimitConfig } from "./rate-limit";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
};

export function apiOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    { success: true, data } satisfies ApiResponse<T>,
    init,
  );
}

export function apiError(
  status: number,
  error: string,
  details?: unknown,
) {
  return NextResponse.json(
    { success: false, error, details } satisfies ApiResponse,
    { status },
  );
}

/**
 * Apply rate limiting. Returns an error response if rate-limited, or null to proceed.
 */
export function applyRateLimit(
  key: string,
  config?: RateLimitConfig,
): NextResponse | null {
  const result = checkRateLimit(key, config);
  if (!result.allowed) {
    const res = NextResponse.json(
      { success: false, error: "Too many requests. Try again shortly." },
      { status: 429 },
    );
    res.headers.set("Retry-After", String(result.resetInSeconds));
    res.headers.set("X-RateLimit-Remaining", "0");
    res.headers.set("X-RateLimit-Reset", String(result.resetInSeconds));
    return res;
  }
  return null;
}

/**
 * Require an authenticated session. Returns the session object or throws a 401.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError(401, "Authentication required");
  }
  return session;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return apiError(error.status, error.message, error.details);
  }
  console.error("Unhandled API error:", error);
  return apiError(500, "Internal server error");
}
