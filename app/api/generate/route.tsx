import type { NextRequest, NextResponse } from "next/server";
import { generate } from "random-words";
import { encodeMessage } from "../utils/encoder";

export async function GET(req: NextRequest) {
  const randomWordArr = generate({ minLength: 6, maxLength: 6, exactly: 1 });
  const randomWord = Array.isArray(randomWordArr)
    ? randomWordArr[0]
    : randomWordArr;
  const encodedWord = encodeMessage(randomWord);
  return new Response(JSON.stringify({ encodedWord }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handler(req: NextRequest) {
  return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
