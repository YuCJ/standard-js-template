const fs = require("fs");
const axios = require("axios");

// Function to read the file and process words
function readWordsFromFile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) {
        reject(err); // Reject the promise if error occurs
      } else {
        // Split the content by newline character to get lines
        const lines = data.split("\n");
        // Trim words and remove empty lines
        const words = lines.map((line) => line.trim()).filter(Boolean);
        resolve(words); // Resolve the promise with the words array
      }
    });
  });
}

function addCard(word) {
  const lessonId = "922acde1-9d60-42ea-acde-0482e08d1a34";
  // https://api.lingvist.com/2.0/lessons/31e5ee28-b4f5-4a3a-92e9-f296239b1ab4/add-cards
  const origin = "https://api.lingvist.com";

  const token =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1dWlkIjoiMzQ3Y2ZmZDAtNDhiYi00MTEwLWJhNTktOGM3NGJhMzE2ZTRlIiwic2VyIjowLCJkYXQiOjE3MDkwMjI5NjUsImV4cCI6MTcxMTYxNDk2NSwiYXVkIjoiS0VFTDI0LUFQSS1SRUFMTSIsInVpZCI6Njk1MTExNywidmVyIjoyfQ.fTPU4dBLplj9Bwj74IlJeth3laMWV205l50-2nMiXxk";

  return axios({
    method: "post",
    url: `${origin}/2.0/lessons/${lessonId}/add-cards`,
    headers: {
      authorization: `Bearer ${token}`,
      Origin: origin,
      Referer: origin,
      TE: "trailers",
      "x-client-type": "web",
      "x-client-version": "2024.01.30.082211",
    },
    data: {
      manual: true,
      seed_text: word,
      seed_file: null,
      intent: "vocabulary",
      include_known: true,
    },
  });
}

const runTime = new Date();
const logFilePath = `${runTime
  .toISOString()
  .replace(/[^a-zA-Z0-9]/g, "_")}.log.txt`;
function log(...messages) {
  for (const message of messages) {
    try {
      // Try to append to the file (flags: 'a' opens the file for appending)
      fs.appendFileSync(logFilePath, message + "\n", { flag: "a" });
    } catch (err) {
      if (err.code === "ENOENT") {
        // File doesn't exist
        // Create the file and then append the message
        fs.writeFileSync(logFilePath, message + "\n");
      } else {
        // Re-throw other errors
        throw err;
      }
    }
  }
}

async function main() {
  const words = await readWordsFromFile("American_Oxford_3.txt");
  const counts = words.length;
  for (let i = 0; i < counts; i++) {
    const word = words[i];
    try {
      await new Promise((resolve, reject) => {
        addCard(word)
          .then((res) => {
            log(`Adding word '${word}' (${i}) completed`);
            log(res.status, JSON.stringify(res.data, undefined, 2));
            setTimeout(() => {
              resolve(res);
            }, 378);
          })
          .catch(reject);
      });
    } catch (error) {
      log(`Adding word '${word}' (${i}) failed`, error);
    }
  }
}

main();
