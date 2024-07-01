"use client";

import { useEffect, useState } from "react";
import "./styles.css";

export default function Home() {
  const [encodedWord, setEncodedWord] = useState<string>("");
  const [finalRowInput, setFinalRowInput] = useState<string>("");

  useEffect(() => {
    fetch("/api/generate")
      .then((res) => res.json())
      .then((data) => setEncodedWord(data.encodedWord));
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.length === 1 && finalRowInput.length < 6) {
        setFinalRowInput((prev) => prev + event.key);
      } else if (event.key === "Backspace" && finalRowInput.length > 0) {
        setFinalRowInput((prev) => prev.slice(0, -1));
      } else if (event.key === "Enter" && finalRowInput.length === 6) {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [finalRowInput]);

  const handleSubmit = async () => {
    const response = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ encodedWord, userInput: finalRowInput }),
    });
    const result = await response.json();
    alert(result.message);
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
          <div
            className="Board-module_board__jeoPS"
            style={{ width: "350px; height: 490px" }}
          >
            {Array.from({ length: 6 }, (_, rowIndex) => (
              <div
                key={rowIndex}
                className="Row-module_row__pwpBq"
                role="group"
                aria-label={`Row ${rowIndex + 1}`}
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
                      >
                        {char}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
            <div className="Final-row" role="group" aria-label="input row">
              {Array.from({ length: 6 }, (_, colIndex) => (
                <div
                  key={colIndex}
                  className=""
                  style={{ animationDelay: `${colIndex * 100}ms` }}
                >
                  <div
                    className="Tile-module_tile__UWEHN"
                    role="img"
                    aria-roledescription="tile"
                    aria-label={`${colIndex + 1}st letter, ${
                      finalRowInput[colIndex]
                        ? finalRowInput[colIndex]
                        : "empty"
                    }`}
                    data-state={finalRowInput[colIndex] ? "tbd" : "empty"}
                    data-animation="idle"
                    data-testid="tile"
                    aria-live="off"
                  >
                    {finalRowInput[colIndex] || ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
