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
  .map((line) => line.split("|").map((cell) => cell.trim()));

const getVoiceSourceText = (card) =>
  card[2].replace("{{c1::", "").replace("}}", "");

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
    const word = getWord(card);

    let wordSound;
    const error = {};

    try {
      const cambridgeSound = await getCambridgeSound(word);
      if (cambridgeSound) {
        wordSound = await download(
          cambridgeSound,
          `./mp3/${word}-word-cambridge.mp3`
        );
      }
    } catch (error) {
      error.cambridge = error.message;
    }

    try {
      if (!wordSound) {
        const oxfordSound = await getOxfordSound(word);
        if (oxfordSound) {
          wordSound = await download(
            oxfordSound,
            `./mp3/${word}-word-oxford.mp3`
          );
        }
      }
    } catch (error) {
      error.oxford = error.message;
    }

    try {
      if (!wordSound) {
        const voice = pickRandomWavenetVoice();
        wordSound = await getAndSaveSpeechThrottled({
          text: getVoiceSourceText(card),
          output: `./mp3/${getWord(card)}-ex-${voice.name}.mp3`,
          voice,
        });
      }
    } catch (error) {
      error.google = error.message;
    }

    if (wordSound) {
      cardsStream.write(
        card.concat(getAnkiSoundTag(wordSound)).join("|") + "\n"
      );
    } else {
      errorlogStream.write(
        `${i}: No sound found for ${word}\n ${JSON.stringify(
          error,
          undefined,
          2
        )}\n`
      );
      errorCardsStream.write(card.join("|") + "\n");
    }
  }
}

main();
