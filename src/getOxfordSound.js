import { JSDOM } from "jsdom";

const getPage = (word) =>
  `https://www.oxfordlearnersdictionaries.com/definition/english/${word}`;

export default async function getOxfordSound(word) {
  const response = await fetch(getPage(word), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });
  const {
    window: { document },
  } = new JSDOM(await response.text());
  const soundUrl = document.querySelectorAll(
    '#entryContent .pron-us[data-src-mp3$=".mp3"]'
  )?.[0]?.dataset?.srcMp3;
  return soundUrl || null;
}

// getOxfordSound("hello").then(console.log).catch(console.error);
