import { NextResponse } from "next/server";
import { auth } from "./auth";

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
