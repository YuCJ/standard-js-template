const _ = require("lodash");
const fs = require("fs");

const INPUT_FILE = "file.txt";
const OUTPUT_FILE = "file.dedupe.txt";

const oxfordWords = fs
  .readFileSync(INPUT_FILE, "utf-8")
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const newWords = _.reverse(_.uniq(oxfordWords));

fs.writeFileSync(OUTPUT_FILE, newWords.join("\n"), { encoding: "utf-8" });
