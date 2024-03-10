import { GoogleGenerativeAI } from "@google/generative-ai";

// Access your API key (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(require("./gemini_k.json").key);

const instruction = `I will give you a list of vocabularies. To each vocabulary, please:

1. Briefly explain the word to an English learner (with CEFR B2 level). If the word has multiple meaning, just choose the most common one. Use abbreviation for part of speech, ex: [n.], [adj.], [adv.], [vi.], [vt.].... 

2. Write an example sentence for the word with that meaning. It would be great if the sentence can help learner to learn that in which context is the word suitable to be used, so you can write up to two sentences in an example to demonstrate the context if the only sentence you can figured out has too few context provided. Use Anki cloze template to wrap the word in the example.

3. Translate the example into Traditional Chinese. Do not put any <em> tag wrapping the word in the translation. Prefer use words that used in Taiwan rather than in China or Hong Kong. For example, "影片" is better than "視頻" for "video", "高品質" is better than "高質量" for "high quality", and "馬鈴薯" is better than "土豆" for "potato."

List one vocabulary per line. Separate the word, the explanation, the translation of the example with "|".

Here's some example:
assign | [vt.] To give something (like a task) as a part of a set, or for a particular purpose. | The teacher {{c1::assigned}} each student a different country to research. |老師分別指派給學生不同的國家做研究。
assistance | [n.] Help or support. | If you need any {{c1::assistance}}, please don't hesitate to ask. | 如有任何需要協助的地方，請別客氣直接說。
astonishing | [adj.]  Very surprising or impressive. | The magician performed some {{c1::astonishing}} tricks. | 魔術師表演了幾個令人驚嘆的把戲。
arrow | [n.] A projectile with a pointed tip and feathers at the opposite end, shot from a bow. | In old stories, archers would shoot {{c1::arrows}} at their enemies in battle. | 在古老的故事裡，弓箭手會在戰鬥中對敵人射箭。

Please reply the result only, no greetings or any other words.

Here is the list of vocabularies:
`;

const getPrompt = (words = []) => {
  return instruction + " " + words.join("\n");
};

const _ = require("lodash");
const fs = require("fs");

const oxfordWordChunks = _.chunk(
  fs
    .readFileSync("oxford_anki_cards.error_words_retry.txt", "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
  25
);

function throttle(_function, config = { limit: 55, interval: 65 * 1000 }) {
  let currentRoundStartTime = 0;
  let activeCount = 0;
  let limit = config.limit;
  let roundDuration = config.interval;
  const queue = new Map();

  const getDelay = () => {
    const now = Date.now();
    if (now - currentRoundStartTime > roundDuration) {
      currentRoundStartTime = now;
      activeCount = 1;
      return 0;
    }

    if (activeCount < limit) {
      activeCount++;
    } else {
      currentRoundStartTime += roundDuration;
      activeCount = 1;
    }

    return currentRoundStartTime - now;
  };

  return (..._arguments) => {
    return new Promise((resolve, reject) => {
      let timeoutId;
      const execute = () => {
        resolve(_function.apply(this, _arguments));
        queue.delete(timeoutId);
      };
      const delay = getDelay();
      if (delay > 0) {
        timeoutId = setTimeout(execute, delay);
        queue.set(timeoutId, reject);
      } else {
        execute();
      }
    });
  };
}

async function run() {
  const cardsStream = fs.createWriteStream("oxford_anki_cards.txt", {
    flags: "a",
  });
  const errorlogStream = fs.createWriteStream(
    "oxford_anki_cards.error_logs.txt",
    { flags: "a" }
  );
  const errorWordsStream = fs.createWriteStream(
    "oxford_anki_cards.error_words.txt",
    { flags: "a" }
  );
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  // For text-only input, use the gemini-pro model
  const getCards = async (words) => {
    const result = await model.generateContent(getPrompt(words));
    const response = await result.response;
    return response.text();
  };

  const getCardsThrottled = throttle(getCards);

  for (let i = 0; i < oxfordWordChunks.length; i++) {
    const words = oxfordWordChunks[i];
    try {
      const text = await getCardsThrottled(words);
      if (!text) {
        throw new Error("No text returned");
      }
      cardsStream.write(text + "\n");
    } catch (err) {
      errorlogStream.write(`${i}: ` + err.message + "\n");
      errorWordsStream.write(words.join("\n") + "\n");
    }
  }
}

run();
