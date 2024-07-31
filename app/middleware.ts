import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { createHash } from "crypto";
import { kv } from "@vercel/kv";

const shortTermRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(6, "60 s"),
});

const longTermRatelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(800, "24 h"),
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

  const shortTermResult = await shortTermRatelimit.limit(userEmail);
  const longTermResult = await longTermRatelimit.limit(userEmail);

  if (!shortTermResult.success || !longTermResult.success) {
    return new NextResponse(JSON.stringify({ message: "Wait a bit :D" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  return NextResponse.next();
}
