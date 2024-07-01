import type { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { encodedWord, userInput } = await req.json();

  // Decode the encodedWord (this is a placeholder, replace with actual decoding logic)
  const decodedWord = decodeWord(encodedWord);

  if (userInput === decodedWord) {
    return new Response(JSON.stringify({ message: "Correct!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify({ message: "Incorrect, try again." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function handler(req: NextRequest) {
  return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

function decodeWord(encodedWord: string): string {
  // Replace this with your actual decoding logic
  return encodedWord.split("").reverse().join("");
}
