const LANGUAGE_CODE = {
  enUS: "en-US",
};

const SSML_VOICE_GENDER = {
  SSML_VOICE_GENDER_UNSPECIFIED: "SSML_VOICE_GENDER_UNSPECIFIED",
  MALE: "MALE",
  FEMALE: "FEMALE",
  NEUTRAL: "NEUTRAL",
};

export const VOICES = {
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

export const pickRandomVoice = () => {
  const allVoices = VOICES.wavenet.concat(VOICES.standard, VOICES.neural2);
  return allVoices[Math.floor(Math.random() * allVoices.length)];
};

export const pickRandomWavenetVoice = () => {
  return VOICES.wavenet[Math.floor(Math.random() * VOICES.wavenet.length)];
};
