import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { getAndSaveSpeechThrottled } from "./getAndSaveSpeech";
import { getVoice } from "./googleTtsOptions";
import getAnkiSoundTag from "./getAnkiSoundTag";

const VOICE_NAME = process.env.VOICE_NAME || "RANDOM";

const VOICE_SOURCE_INDEX = process.env.VOICE_SOURCE_INDEX;
if (!VOICE_SOURCE_INDEX) {
  throw new Error("No voice source index provided");
}

const INPUT_FILE = process.env.INPUT_FILE;
if (!INPUT_FILE) {
  throw new Error("No input file provided");
}

const WORD_INDEX = process.env.WORD_INDEX;

const getHash = (text) =>
  createHash("md5").update(text).digest("hex").slice(0, 8);
const padNumber = (num, size) => {
  return num.toString().padStart(size.toString().length, "0");
};
const getHashedFileName = (text, i, size) =>
  `${path.basename(INPUT_FILE).replace(".cards.txt", "")}-${padNumber(
    i,
    size
  )}-${getHash(text)}.mp3`;

const inputFileObj = path.parse(INPUT_FILE);
const OUTPUT_CARDS_FILE = `${inputFileObj.name}.ex-voice-cards.txt`;
const ERROR_LOG_FILE = `${inputFileObj.name}.error-logs.txt`;
const ERROR_CARDS_FILE = `${inputFileObj.name}.error-cards.txt`;

/*  
card
[
  'nonetheless',
  '[adv.] Although the situation seems negative: despite that; even so.',
  'Many companies fail, but {{c1::nonetheless}} some succeed.',
  '儘管許多公司都失敗，但仍有一些公司成功。'
]
*/
const cards = fs
  .readFileSync(INPUT_FILE, "utf-8")
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("|").map((cell) => cell.trim()));

const getVoiceSourceText = (card) =>
  card[VOICE_SOURCE_INDEX]?.replace("{{c1::", "").replace("}}", "");

const getWord = (card) => card[WORD_INDEX];

async function main() {
  const cardsStream = fs.createWriteStream(OUTPUT_CARDS_FILE, {
    flags: "a",
  });
  const errorlogStream = fs.createWriteStream(ERROR_LOG_FILE, { flags: "a" });
  const errorCardsStream = fs.createWriteStream(ERROR_CARDS_FILE, {
    flags: "a",
  });

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const text = getVoiceSourceText(card);
    if (!text) {
      continue;
    }
    try {
      const voice = getVoice(VOICE_NAME);
      const output = WORD_INDEX
        ? `./mp3/${getWord(card)}-ex-${voice.name}.mp3`
        : `./mp3/${getHashedFileName(text, i + 1, cards.length)}`;
      const exampleSound = await getAndSaveSpeechThrottled({
        text,
        output,
        voice,
      });
      cardsStream.write(
        card.concat(getAnkiSoundTag(exampleSound)).join("|") + "\n"
      );
    } catch (err) {
      errorlogStream.write(`${i}: ` + err.stack + "\n");
      errorCardsStream.write(card.join("|") + "\n");
    }
  }
}

main();
