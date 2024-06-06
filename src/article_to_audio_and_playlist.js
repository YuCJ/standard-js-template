import path from "path";
import fs from "fs";
import { createHash } from "crypto";
import { getAndSaveSpeechThrottled } from "./getAndSaveSpeech";
import { getVoice } from "./googleTtsOptions";

const INPUT_FILE = process.env.INPUT_FILE;
const VOICE_NAME = process.env.VOICE_NAME || "RANDOM";
const REPEAT_TIMES = process.env.REPEAT_TIMES
  ? parseInt(process.env.REPEAT_TIMES, 10)
  : 3;

if (!INPUT_FILE) {
  throw new Error("No input file provided");
}

const inputFileObj = path.parse(INPUT_FILE);

const OUTPUT_FILE = `${inputFileObj.name}.m3u`;

const getHash = (text) =>
  createHash("md5").update(text).digest("hex").slice(0, 8);

const padNumber = (num, size) => {
  return num.toString().padStart(size.toString().length, "0");
};

const sourceName = path.basename(INPUT_FILE, path.extname(INPUT_FILE));

const getHashedFileName = (text, i, size) =>
  `${sourceName}-${padNumber(i, size)}-${getHash(text)}.mp3`;

const sentences = fs
  .readFileSync(INPUT_FILE, "utf-8")
  .replace(/\n/g, " ")
  .split(/(?<=[.!?])/g)
  .map((sentence) => sentence.trim())
  .filter(Boolean);

async function main() {
  const playlistStream = fs.createWriteStream(OUTPUT_FILE, {
    flags: "a",
  });

  try {
    fs.mkdirSync(`./mp3/${sourceName}`);
  } catch (err) {
    console.error(err);
  }

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    if (!sentence) {
      continue;
    }
    try {
      const voice = getVoice(VOICE_NAME);
      const filename = `${getHashedFileName(
        sentence,
        i + 1,
        sentences.length
      )}`;
      const output = `./mp3/${sourceName}/${filename}`;
      const audio = await getAndSaveSpeechThrottled({
        text: sentence,
        output,
        voice,
      });
      for (let j = 0; j < REPEAT_TIMES; j++) {
        playlistStream.write(audio + "\n");
      }
    } catch (err) {
      console.log("---------ERROR LOG START-----------------------");
      console.log(i, sentence);
      console.error(err);
      console.log("---------ERROR LOG END  -----------------------");
    }
  }
}

main();
