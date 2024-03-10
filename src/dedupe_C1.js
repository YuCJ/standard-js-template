// const wordsB2 = require("./B2.json").words;
const _ = require("lodash");
const path = require("path");
const fs = require("fs");

const oxfordWords = fs
  .readFileSync(
    path.resolve("./src/American_Oxford_5000_by_CEFR_level.txt"),
    "utf-8"
  )
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

const newWords = _.reverse(_.uniq(oxfordWords));

fs.writeFileSync(`oxford_words.txt`, newWords.join("\n"), {
  encoding: "utf-8",
});
