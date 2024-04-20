import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import throttle from "./throttle";

const MAX_WORDS_PER_REQUEST = 25;

const INPUT_FILE = process.env.INPUT_FILE;
if (!INPUT_FILE) {
  throw new Error("No input file provided");
}

const inputFileObj = path.parse(INPUT_FILE);

const OUTPUT_FILE = `${inputFileObj.name}.cards.txt`;
const ERROR_LOG_FILE = `${inputFileObj.name}.error-logs.txt`;
const ERROR_WORDS_FILE = `${inputFileObj.name}.error-words.txt`;

// Access your API key (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(require("./gemini_k.json").key);

const instruction = `I will give you a list. Each line of the list will be a vocabulary, or a vocabulary with a sentence with it ('|' as separator). Please follow the instructions below to transform the list:

1. Write brief explanation of the vocabulary to an English learner with CEFR B2 level. If the vocabulary has multiple meanings and there is accompanying sentence in the source data, please choose the meaning of the vocabulary as it is represented in the sentence. If there are no accompanying sentences, please choose the most common meaning. And please use abbreviation to note the part of speech of the meaning, ex: [n.], [adj.], [adv.], [vi.], [vt.].... 

2. Write an example sentence for the word with the meaning. It would be great if the sentence can help learner to learn that in which context is the word suitable to be used, so there can up to 3 sentences in an example, in order to demonstrate the context. Do not use uncommon expressions or words found in modern English to make the sentence. Please use Anki cloze template to wrap the word in the example sentence.

3. Translate the example sentence into Traditional Chinese. Do not put any <em> tag wrapping the word in the translation. Prefer use words that used in Taiwan rather than in China or Hong Kong. For example, "影片" is better than "視頻" for "video", "高品質" is better than "高質量" for "high quality", and "馬鈴薯" is better than "土豆" for "potato."

Please list one vocabulary per line. Separate the word, the explanation, the example sentence, and the translation of the example with "|".

Please reply the output result only. No greetings or any other words in your response.

I'm giving you an example to help you understand the task better. Here is an example input and output:

The example input is:
assign  
assistance|I sought assistance from my friends when I moved into my new apartment, and they helped me unpack and settle in.
astonishing
inquire
hostility|Despite my attempts to reconcile, there was an underlying atmosphere of hostility between us, making it challenging to resolve our differences.
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
