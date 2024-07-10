import type { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { kv } from "@vercel/kv";
import middleware from "../../middleware";

export async function POST(req: NextRequest) {
  const { userEmail, encodedWord, userInput } = await req.json();

  const middlewareResponse = await middleware(req, userEmail);
  if (middlewareResponse.status !== 200) {
    const errorMessage = await middlewareResponse.json();
    return new Response(JSON.stringify(errorMessage), {
      status: middlewareResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const hashEmail = createHash("sha256").update(userEmail).digest("hex");

  const currentEncodedWord = await kv.hget(hashEmail, "currentEncodedWord");
  const decodedWord: string | null = await kv.hget(hashEmail, "currentWord");

  if (
    !decodedWord ||
    decodedWord.length === 0 ||
    encodedWord !== currentEncodedWord
  ) {
    return new Response(
      JSON.stringify({ message: "This is not the current word." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  await kv.hset(hashEmail, { currentWord: "" });
  await kv.hset(hashEmail, { currentEncodedWord: "" });

  let feedback = Array(6).fill("absent");

  for (let i = 0; i < 6; i++) {
    if (userInput[i] === decodedWord[i]) {
      feedback[i] = "correct";
    }
  }

  for (let i = 0; i < 6; i++) {
    if (feedback[i] === "absent") {
      const countInDecodedWord = decodedWord.split(userInput[i]).length - 1;
      const countCorrectFeedback = feedback.filter(
        (f, index) => f === "correct" && userInput[index] === userInput[i]
      ).length;
      const countPresentFeedback = feedback.filter(
        (f, index) => f === "present" && userInput[index] === userInput[i]
      ).length;

      if (countInDecodedWord > countCorrectFeedback + countPresentFeedback) {
        feedback[i] = "present";
      }
    }
  }

  let secretMessage = null;
  if (feedback.every((f) => f === "correct")) {
    secretMessage = createHash("sha256")
      .update(userEmail + "bugus314")
      .digest("hex");
  }

  return new Response(JSON.stringify({ feedback, secretMessage }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// export async function handler(req: NextRequest) {
//   return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
//     status: 405,
//     headers: { "Content-Type": "application/json" },
//   });
// }
