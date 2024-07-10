"use client";

import { useEffect, useState } from "react";
import "./styles.css";
import { useParams, useRouter } from "next/navigation";
import { createHash } from "crypto";

export default function Home() {
  const params = useParams();
  const emailParam = params.email;
  const userEmail = Array.isArray(emailParam) ? emailParam[0] : emailParam;
  const [encodedWord, setEncodedWord] = useState<string>("");
  const [finalRowInput, setFinalRowInput] = useState<string>("");
  const [feedback, setFeedback] = useState<string[]>(Array(6).fill("tbd"));
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [secretMessage, setSecretMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const links = [
    "https://hackmit.org/",
    "https://hackmit.org/",
    "https://hackmit.org/",
    "https://www.google.com",
    "https://hackmit.org/",
    "https://www.bing.com",
    "https://www.yahoo.com",
    "https://hackmit.org/",
    "https://www.baidu.com",
    "https://www.youtube.com",
    "https://en.wikipedia.org/wiki/Caesar_cipher",
    "https://en.wikipedia.org/wiki/Francis_Bacon",
    "https://hackmit.org/",
    "https://en.wikipedia.org/wiki/RSA_(cryptosystem)",
    "https://en.wikipedia.org/wiki/Morse_code",
    "https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher",
    "https://en.wikipedia.org/wiki/Chinese_character_strokes",
    "https://www.youtube.com/watch?v=exzQkvv7g1w",
    "https://en.wikipedia.org/wiki/Japanese_writing_system",
    "https://simple.wikipedia.org/wiki/Chinese_characters",
    "https://hackmit.org/",
    "https://www.dictionary.com/",
    "https://www.nytimes.com/games/wordle/index.html",
    "https://www.nytimes.com/games/connections",
    "https://www.nytimes.com/puzzles/sudoku",
    "https://www.nytimes.com/games/strands",
    "https://www.nytimes.com/crosswords/game/mini",
    "https://www.nytimes.com/",
    "https://www.nytimes.com/",
    "https://www.nytimes.com/",
  ];

  useEffect(() => {
    fetchNewWord();
  }, []);

  const fetchNewWord = async () => {
    try {
      const response = await fetch(
        `/api/generate?userEmail=${encodeURIComponent(userEmail)}`
      );

      if (response.redirected) {
        // If the response is redirected, navigate to the new location
        window.location.href = response.url;
        return; // Exit the function early
      }

      if (response.ok) {
        const data = await response.json();
        setEncodedWord(data.encodedWord);
        setFinalRowInput("");
        setHasSubmitted(false);
        setFeedback(Array(6).fill("tbd"));
        setSecretMessage(null);
        setErrorMessage(null);
      } else if (response.status === 429) {
        console.error("chill out");
        setErrorMessage("Please wait a bit :D");
      } else {
        console.error("Failed to fetch new word:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching new word:", error);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const isLetter = /^[a-zA-Z]$/.test(event.key);
      const isModifierKey =
        event.shiftKey || event.ctrlKey || event.metaKey || event.altKey;

      if (isLetter && !isModifierKey && finalRowInput.length < 6) {
        setFinalRowInput((prev) => prev + event.key);
      } else if (event.key === "Backspace" && finalRowInput.length > 0) {
        setFinalRowInput((prev) => prev.slice(0, -1));
      } else if (event.key === "Enter") {
        if (hasSubmitted) {
          fetchNewWord();
        } else if (finalRowInput.length === 6) {
          handleSubmit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [finalRowInput, hasSubmitted]);

  const handleSubmit = async () => {
    const response = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail,
        encodedWord,
        userInput: finalRowInput,
      }),
    });

    if (response.status === 429) {
      console.log("chill out");
      setErrorMessage("Please wait a bit :D");
    } else {
      const result = await response.json();
      if (result.feedback) {
        setHasSubmitted(true);
        setFeedback(result.feedback);
        setErrorMessage(null);
        if (result.secretMessage) {
          setSecretMessage(result.secretMessage);
        }
      } else {
        console.log("nice try");
        setErrorMessage(null);
      }
    }
  };

  return (
    <div
      className="App-module_gameContainer__K_CBh"
      data-testid="game-wrapper"
      style={{ minHeight: "100vh" }}
    >
      <header className="AppHeader-module_appHeader__Jn4R7">
        <h1 className="AppHeader-module_title__EQr6V">wodou</h1>
      </header>
      <main className="App-module_game__yruqo">
        <div className="Board-module_boardContainer__TBHNL">
          <div style={{ height: "auto" }}>
            You are currently playing as {userEmail.replace("%40", "@")}.
          </div>
          <div
            className="Board-module_board__jeoPS"
            style={{ width: "350px", height: "490px" }}
          >
            {Array.from({ length: 6 }, (_, rowIndex) => (
              <div
                key={rowIndex}
                className="Row-module_row__pwpBq"
                role="group"
                aria-label={`Row ${rowIndex + 1}`}
                style={{ width: "330px" }}
              >
                {encodedWord
                  .slice(rowIndex * 5, rowIndex * 5 + 5)
                  .split("")
                  .map((char, colIndex) => (
                    <div
                      key={colIndex}
                      className=""
                      style={{ animationDelay: `${colIndex * 100}ms` }}
                    >
                      <div
                        className="Tile-module_tile__UWEHN"
                        role="img"
                        aria-roledescription="tile"
                        aria-label={`${colIndex + 1}st letter`}
                        data-state="tbd"
                        data-animation="idle"
                        data-testid="tile"
                        aria-live="polite"
                        onClick={() =>
                          window.open(links[rowIndex * 5 + colIndex], "_blank")
                        }
                      >
                        {char}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
            <div
              className="Final-row"
              role="group"
              aria-label="input row"
              style={{ width: "330px" }}
            >
              {Array.from({ length: 6 }, (_, colIndex) => (
                <div
                  key={colIndex}
                  className=""
                  style={{ animationDelay: `${colIndex * 200}ms` }}
                >
                  <div
                    className={`Tile-module_tile__UWEHN ${
                      hasSubmitted && feedback[colIndex]
                        ? feedback[colIndex]
                        : ""
                    }`}
                    role="img"
                    aria-roledescription="tile"
                    aria-label={`${colIndex + 1}st letter, ${
                      finalRowInput[colIndex]
                        ? finalRowInput[colIndex]
                        : "empty"
                    }`}
                    data-state={
                      hasSubmitted && feedback[colIndex]
                        ? feedback[colIndex]
                        : "tbd"
                    }
                    data-animation={hasSubmitted ? "flip-in" : "idle"}
                    data-testid="tile"
                    aria-live="off"
                    style={{ animationDelay: `${colIndex * 200}ms` }}
                  >
                    {finalRowInput[colIndex] || ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {hasSubmitted && (
          <div
            className="caption"
            style={{ textAlign: "center", padding: "10px" }}
          >
            {secretMessage ? (
              <div>Secret: {secretMessage}</div>
            ) : (
              <div>Press Enter to restart.</div>
            )}
          </div>
        )}
        {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      </main>
    </div>
  );
}
