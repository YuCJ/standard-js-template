import path from "path";
import fs from "fs";

const CONTEXT_COUNT = process.env.CONTEXT_COUNT || 1;

const INPUT_FILE = process.env.INPUT_FILE;
if (!INPUT_FILE) {
  throw new Error("No input file provided");
}

const inputFileObj = path.parse(INPUT_FILE);

const OUTPUT_FILE = `${inputFileObj.name}.cards.txt`;

const buildCard = ({ sentences, contextCount, currentIndex }) => {
  const currentSentence = sentences[currentIndex];
  const context = sentences.slice(
    Math.max(0, currentIndex - contextCount),
    currentIndex
  );
  const contextText = context.join("<br>");
  const sentencesCount = sentences.length;
  const currentIndexString = (currentIndex + 1)
    .toString(10)
    .padStart(sentencesCount.toString(10).length, "0");
  const card = `${currentIndexString}/${sentencesCount}|${
    contextText || "[START]"
  }|{{c1::${currentSentence}}}`;
  return card;
};

const sentences = fs
  .readFileSync(INPUT_FILE, "utf-8")
  .replace(/\n/g, " ")
  .split(/(?<=[.!?])/g)
  .map((sentence) => sentence.trim())
  .filter(Boolean);

async function main() {
  const cardsStream = fs.createWriteStream(OUTPUT_FILE, {
    flags: "a",
  });

  for (let i = 0; i < sentences.length; i++) {
    const card = buildCard({
      sentences,
      contextCount: CONTEXT_COUNT,
      currentIndex: i,
    });
    cardsStream.write(card + "\n");
  }
}

main();
