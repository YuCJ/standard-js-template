import fs from "fs";
import path from "path";
import { getAndSaveSpeechThrottled } from "./getAndSaveSpeech";

const LANGUAGE_CODE = {
  enUS: "en-US",
};

const SSML_VOICE_GENDER = {
  SSML_VOICE_GENDER_UNSPECIFIED: "SSML_VOICE_GENDER_UNSPECIFIED",
  MALE: "MALE",
  FEMALE: "FEMALE",
  NEUTRAL: "NEUTRAL",
};

const INPUT_FILE = process.env.INPUT_FILE;
if (!INPUT_FILE) {
  throw new Error("No input file provided");
}

const inputFileObj = path.parse(INPUT_FILE);
const OUTPUT_CARDS_FILE = `${inputFileObj.name}.voice-cards.txt`;
const ERROR_LOG_FILE = `${inputFileObj.name}.error-logs.txt`;
const ERROR_CARDS_FILE = `${inputFileObj.name}.error-cards.txt`;

const voices = {
  wavenet: [
    {
      name: "en-US-Wavenet-J",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.MALE,
    },
    {
      name: "en-US-Wavenet-I",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.MALE,
    },
    {
      name: "en-US-Wavenet-G",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.FEMALE,
    },
    {
      name: "en-US-Wavenet-F",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.FEMALE,
    },
    {
      name: "en-US-Wavenet-D",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.MALE,
    },
    {
      name: "en-US-Wavenet-B",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.MALE,
    },
  ],
  standard: [
    {
      name: "en-US-Journey-F",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.FEMALE,
    },
    {
      name: "en-US-Journey-D",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.MALE,
    },
    {
      name: "en-US-Standard-J",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.MALE,
    },
    {
      name: "en-US-Standard-F",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.FEMALE,
    },
  ],
  neural2: [
    {
      name: "en-US-Neural2-I",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.MALE,
    },
    {
      name: "en-US-Neural2-J",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.MALE,
    },
    {
      name: "en-US-Neural2-F",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.FEMALE,
    },
    {
      name: "en-US-Neural2-D",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.MALE,
    },
    {
      name: "en-US-Neural2-H",
      languageCode: LANGUAGE_CODE.enUS,
      ssmlGender: SSML_VOICE_GENDER.FEMALE,
    },
  ],
};

const pickRandomVoice = () => {
  const allVoices = voices.wavenet.concat(voices.standard, voices.neural2);
  return allVoices[Math.floor(Math.random() * allVoices.length)];
};
const getAnkiSoundTag = (filename) => `[sound:${filename}]`;

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
    try {
      const voice = pickRandomVoice();
      const soundFilename = await getAndSaveSpeechThrottled({
        text: getVoiceSourceText(card),
        output: `./mp3/${getWord(card)}-ex-${voice.name}.mp3`,
        voice,
      });
      cardsStream.write(
        card.concat(getAnkiSoundTag(soundFilename)).join("|") + "\n"
      );
    } catch (err) {
      errorlogStream.write(`${i}: ` + err.message + "\n");
      errorCardsStream.write(card.join("|") + "\n");
    }
  }
}

main();
