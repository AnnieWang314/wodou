import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { createHash } from "crypto";
import { kv } from "@vercel/kv";

const ratelimit = new Ratelimit({
  redis: kv,
  // 5 requests from the same IP in 10 seconds
  limiter: Ratelimit.slidingWindow(5, "30 s"),
});

// Define which routes you want to rate limit
export const config = {
  matcher: "/",
};

export default async function middleware(
  request: NextRequest,
  userEmail: string | null
) {
  if (
    !userEmail ||
    !userEmail.includes("_") ||
    userEmail.split("_").length != 2
  ) {
    return new NextResponse(JSON.stringify({ message: "Please log in." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parts = userEmail.split("_");

  if (
    createHash("sha256")
      .update(`${parts[0]}_${process.env.SECRET_KEY}`)
      .digest("hex")
      .substring(0, 8) != parts[1]
  ) {
    return new NextResponse(JSON.stringify({ message: "Please log in." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { success, pending, limit, reset, remaining } = await ratelimit.limit(
    userEmail
  );
  return success
    ? NextResponse.next()
    : new NextResponse(JSON.stringify({ message: "Wait a bit :D" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
}
