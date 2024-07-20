import path from "path";
import fs from "fs";

const INPUT_FILE = process.env.INPUT_FILE;
if (!INPUT_FILE) {
  throw new Error("No input file provided");
}

const inputFileObj = path.parse(INPUT_FILE);

const OUTPUT_FILE = `${inputFileObj.name}.notes.txt`;
const ERROR_LOG_FILE = `${inputFileObj.name}.error-logs.txt`;

const notes = fs
  .readFileSync(INPUT_FILE, "utf-8")
  .split("\n")
  .map((line) =>
    line
      .trim()
      .split("\t")
      .map((cell) => cell.trim())
  )
  .filter(Boolean);

async function run() {
  const cardsStream = fs.createWriteStream(OUTPUT_FILE, {
    flags: "a",
  });
  const errorlogStream = fs.createWriteStream(ERROR_LOG_FILE, { flags: "a" });
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    const parenthesesRegex = /\(([^)]+)\)|【([^】]+)】/g;
    const front = note[0].replace(parenthesesRegex, "").trim();
    const addition = parenthesesRegex.exec(note[0])?.[1]?.trim() || "";
    const back = note[1];
    try {
      cardsStream.write([front, back, addition].join("\t") + "\n");
    } catch (err) {
      errorlogStream.write(`${i}: ` + err.message + "\n");
    }
  }
}

run();
