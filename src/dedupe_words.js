const _ = require("lodash");
const fs = require("fs");

const INPUT_FILE = "./src/American_Oxford_5000_by_CEFR_level.txt";
const OUTPUT_FILE = "oxford_words.txt";

const oxfordWords = fs
  .readFileSync(INPUT_FILE, "utf-8")
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const newWords = _.reverse(_.uniq(oxfordWords));

fs.writeFileSync(OUTPUT_FILE, newWords.join("\n"), { encoding: "utf-8" });
