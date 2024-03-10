const fs = require("fs");
const textToSpeech = require("@google-cloud/text-to-speech");
const throttle = require("./throttle").default;

const LANGUAGE_CODE = {
  enUS: "en-US",
};

const SSML_VOICE_GENDER = {
  SSML_VOICE_GENDER_UNSPECIFIED: "SSML_VOICE_GENDER_UNSPECIFIED",
  MALE: "MALE",
  FEMALE: "FEMALE",
  NEUTRAL: "NEUTRAL",
};

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

const AUDIO_ENCODING = {
  AUDIO_ENCODING_UNSPECIFIED: "AUDIO_ENCODING_UNSPECIFIED",
  LINEAR16: "LINEAR16",
  MP3: "MP3",
  OGG_OPUS: "OGG_OPUS",
  MULAW: "MULAW",
  ALAW: "ALAW",
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
  .readFileSync("oxford_anki_cards.txt", "utf-8")
  .split("\n")
  .map((line) => line.split("|").map((cell) => cell.trim()));

const getVoiceSourceText = (card) =>
  card[2].replace("{{c1::", "").replace("}}", "");

const client = new textToSpeech.TextToSpeechClient();

const getAndSaveSpeech = async (card) => {
  const request = {
    input: {
      text: getVoiceSourceText(card),
    },
    // Select the language and SSML voice gender (optional)
    voice: pickRandomVoice(),
    // select the type of audio encoding
    audioConfig: { audioEncoding: AUDIO_ENCODING.MP3 },
  };
  const filename = `${card[0]}-ex-${request.voice.name}.mp3`;
  const [response] = await client.synthesizeSpeech(request);
  fs.writeFileSync(`./mp3/${filename}`, response.audioContent);
  return filename;
};

const getAndSaveSpeechThrottled = throttle(getAndSaveSpeech, {
  limit: 150,
  interval: 60 * 1000,
});

async function main() {
  const cardsStream = fs.createWriteStream(
    "oxford_anki_cards_with_example_sounds.txt",
    {
      flags: "a",
    }
  );
  const errorlogStream = fs.createWriteStream(
    "oxford_anki_cards_with_example_sounds.error_logs.txt",
    { flags: "a" }
  );
  const errorCardsStream = fs.createWriteStream(
    "oxford_anki_cards_with_example_sounds.error_words.txt",
    { flags: "a" }
  );

  const i = 0;
  const card = cards[i];
  try {
    const soundFilename = await getAndSaveSpeechThrottled(card);
    cardsStream.write(
      card.concat(getAnkiSoundTag(soundFilename)).join("|") + "\n"
    );
  } catch (err) {
    errorlogStream.write(`${i}: ` + err.message + "\n");
    errorCardsStream.write(card.join("|") + "\n");
  }
}

main();
