import { JSDOM } from "jsdom";

const getPage = (word) =>
  `https://dictionary.cambridge.org/de/worterbuch/englisch/${word}`;

export default async function getCambridgeSound(word) {
  const response = await fetch(getPage(word), {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });
  const {
    window: { document },
  } = new JSDOM(await response.text());
  const pre = word.slice(0, 3);
  const soundPath = document.querySelectorAll(
    `.entry-body .us [src$=".mp3"][src*="${pre}"]`
  )?.[0]?.src;
  return soundPath ? "https://dictionary.cambridge.org" + soundPath : null;
}

// getCambridgeSound("proper").then(console.log).catch(console.error);
