import fs from "fs";
import path from "path";
import { getAndSaveSpeechThrottled } from "./getAndSaveSpeech";
import { pickRandomWavenetVoice } from "./googleTtsOptions";
import getCambridgeSound from "./getCambridgeSound";
import getOxfordSound from "./getOxfordSound";
import getAnkiSoundTag from "./getAnkiSoundTag";
import download from "./download";

const INPUT_FILE = process.env.INPUT_FILE;
if (!INPUT_FILE) {
  throw new Error("No input file provided");
}

const inputFileObj = path.parse(INPUT_FILE);
const OUTPUT_CARDS_FILE = `${inputFileObj.name}.word-voice-cards.txt`;
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
  .map((line) => line.split("|").map((cell) => cell.trim()))
  .filter(Boolean);

const getVoiceSourceText = (card) =>
  card[2].replace("{{c1::", "").replace("}}", "");

const getWord = (card) => card[0];

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    const word = getWord(card);

    let wordSound;
    const allErrors = {};

    try {
      const cambridgeSound = await getCambridgeSound(word);
      if (cambridgeSound) {
        const filename = await download(
          cambridgeSound,
          `./mp3/${word}-word-cambridge.mp3`
        );
        wordSound = filename;
      }
    } catch (error) {
      console.error(error);
      allErrors.cambridge = error.message;
    }

    try {
      if (!wordSound) {
        const oxfordSound = await getOxfordSound(word);
        if (oxfordSound) {
          const filename = await download(
            oxfordSound,
            `./mp3/${word}-word-oxford.mp3`
          );
          wordSound = filename;
        }
      }
    } catch (error) {
      console.error(error);
      allErrors.oxford = error.message;
    }

    try {
      if (!wordSound) {
        const voice = pickRandomWavenetVoice();
        wordSound = await getAndSaveSpeechThrottled({
          text: getVoiceSourceText(card),
          output: `./mp3/${getWord(card)}-word-${voice.name}.mp3`,
          voice,
        });
      }
    } catch (error) {
      console.error(error);
      allErrors.google = error.message;
    }

    if (Object.keys(allErrors).length > 0) {
      errorlogStream.write(
        `${i}: Error for ${word}\n ${JSON.stringify(allErrors, undefined, 2)}\n`
      );
      errorCardsStream.write(card.join("|") + "\n");
    }

    if (wordSound) {
      cardsStream.write(
        card.concat(getAnkiSoundTag(wordSound)).join("|") + "\n"
      );
    } else {
      errorlogStream.write(`${i}: No sound found for ${word}\n`);
      errorCardsStream.write(card.join("|") + "\n");
    }

    wait(350);
  }
}

main();
