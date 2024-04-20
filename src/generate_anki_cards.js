import { GoogleGenerativeAI } from "@google/generative-ai";
import throttle from "./throttle";

const MAX_WORDS_PER_REQUEST = 25;
const INPUT_FILE = "oxford_anki_cards.error_words_retry.txt";
const OUTPUT_FILE = "oxford_anki_cards_retry.txt";
const ERROR_LOG_FILE = "oxford_anki_cards.error_logs_retry.txt";
const ERROR_WORDS_FILE = "oxford_anki_cards.error_words_retry.txt";

// Access your API key (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(require("./gemini_k.json").key);

const instruction = `I will give you a list of vocabularies. To each vocabulary, please:

1. Briefly explain the word to an English learner with CEFR B2 level. If the word has multiple meaning, just choose the most common one. Use abbreviation for part of speech, ex: [n.], [adj.], [adv.], [vi.], [vt.].... 

2. Write an example sentence for the word with that meaning. It would be great if the sentence can help learner to learn that in which context is the word suitable to be used, so there can up to two sentences in an example, in order to demonstrate the context. Do not use uncommon expressions or words found in modern English to make the sentence. Please use Anki cloze template to wrap the word in the example sentence.

3. Translate the example into Traditional Chinese. Do not put any <em> tag wrapping the word in the translation. Prefer use words that used in Taiwan rather than in China or Hong Kong. For example, "影片" is better than "視頻" for "video", "高品質" is better than "高質量" for "high quality", and "馬鈴薯" is better than "土豆" for "potato."

Please list one vocabulary per line. Separate the word, the explanation, the example sentence, and the translation of the example with "|".

Please reply the output result only. No greetings or any other words in your response.

I'm giving you an example to help you understand the task better. Here is an example input and output:

The example input is:
assign
assistance
astonishing
inquire
hostility
altogether

The example output (your response) should be:
assign | [vt.] To give something (like a task) as a part of a set, or for a particular purpose. | The teacher {{c1::assigned}} each student a different country to research. |老師分別指派給學生不同的國家做研究。
assistance | [n.] Help or support. | If you need any {{c1::assistance}}, please don't hesitate to ask. | 如有任何需要協助的地方，請別客氣直接說。
astonishing | [adj.]  Very surprising or impressive. | The magician performed some {{c1::astonishing}} tricks. | 魔術師表演了幾個令人驚嘆的把戲。
inquire | [vt.] To ask about something. | I {{c1::inquired}} about the price of the car, but the salesman didn't know. | 我詢問了車子的價格，但業務員不知道。
hostility | [n.] Unfriendliness or opposition. | There is a lot of {{c1::hostility}} between the two countries. | 這兩個國家之間存在著許多敵意。
altogether | [adv.] In total; completely. | The project took us {{c1::altogether}} three months to complete. | 這個專案總共花了我們三個月的時間才完成。

Ok. Now here's the list of vocabularies for you to work on:
`;

const getPrompt = (words = []) => {
  return instruction + " " + words.join("\n");
};

const _ = require("lodash");
const fs = require("fs");

const oxfordWordChunks = _.chunk(
  fs
    .readFileSync(INPUT_FILE, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
  MAX_WORDS_PER_REQUEST
);

async function run() {
  const cardsStream = fs.createWriteStream(OUTPUT_FILE, {
    flags: "a",
  });
  const errorlogStream = fs.createWriteStream(ERROR_LOG_FILE, { flags: "a" });
  const errorWordsStream = fs.createWriteStream(ERROR_WORDS_FILE, {
    flags: "a",
  });
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
