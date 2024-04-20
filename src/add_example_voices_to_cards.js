import fs from "fs";
import path from "path";
import { getAndSaveSpeechThrottled } from "./getAndSaveSpeech";
import { pickRandomVoice } from "./googleTtsOptions";
import getAnkiSoundTag from "./getAnkiSoundTag";

const INPUT_FILE = process.env.INPUT_FILE;
if (!INPUT_FILE) {
  throw new Error("No input file provided");
}

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
  card[2]?.replace("{{c1::", "").replace("}}", "");

const getWord = (card) => card[0];

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
      const voice = pickRandomVoice();
      const exampleSound = await getAndSaveSpeechThrottled({
        text,
        output: `./mp3/${getWord(card)}-ex-${voice.name}.mp3`,
        voice,
      });
      cardsStream.write(
        card.concat(getAnkiSoundTag(exampleSound)).join("|") + "\n"
      );
    } catch (err) {
      errorlogStream.write(`${i}: ` + err.message + "\n");
      errorCardsStream.write(card.join("|") + "\n");
    }
  }
}

main();
