import fs from "fs";
import path from "path";
import textToSpeech from "@google-cloud/text-to-speech";
import throttle from "./throttle";

const AUDIO_ENCODING = {
  AUDIO_ENCODING_UNSPECIFIED: "AUDIO_ENCODING_UNSPECIFIED",
  LINEAR16: "LINEAR16",
  MP3: "MP3",
  OGG_OPUS: "OGG_OPUS",
  MULAW: "MULAW",
  ALAW: "ALAW",
};

const client = new textToSpeech.TextToSpeechClient();

const pitch = process.env.PITCH ? parseFloat(process.env.PITCH) : 0; // [-20.0, 20.0]
const speakingRate = process.env.SPEAKING_RATE
  ? parseFloat(process.env.SPEAKING_RATE)
  : 1; // [0.25, 4.0]

const getAndSaveSpeech = async ({ text, output, voice }) => {
  const request = {
    input: {
      text,
    },
    voice,
    audioConfig: { audioEncoding: AUDIO_ENCODING.MP3 },
    pitch,
    speakingRate,
  };
  const [response] = await client.synthesizeSpeech(request);
  fs.writeFileSync(output, response.audioContent);
  return path.basename(output);
};

export const getAndSaveSpeechThrottled = throttle(getAndSaveSpeech, {
  limit: 150,
  interval: 60 * 1000,
});

export default getAndSaveSpeech;
