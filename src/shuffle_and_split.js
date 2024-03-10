const fs = require("fs");
const _ = require("lodash");
const path = require("path");

function getWordChunks() {
  const file = fs.readFileSync(
    path.resolve("./src/American_Oxford_5000_by_CEFR_level.txt"),
    "utf-8"
  );
  const words = file
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const shuffledWords = _.shuffle(words);
  return _.chunk(shuffledWords, Math.ceil(shuffledWords.length / 3));
}

function main() {
  const wordChunks = getWordChunks();
  for (let i = 0; i < wordChunks.length; i++) {
    const words = wordChunks[i];
    fs.writeFileSync(`American_Oxford_${i}.txt`, words.join("\n"), {
      encoding: "utf-8",
    });
  }
}

main();
