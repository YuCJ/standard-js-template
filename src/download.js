import fs from "fs";
import path from "path";

export default function download(url, output) {
  return new Promise((resolve, reject) => {
    const response = fetch(url);
    const fileStream = fs.createWriteStream(output);
    response.body.pipe(fileStream);
    response.body.on("error", (err) => {
      reject(err);
    });
    fileStream.on("finish", () => {
      resolve(path.basename(output));
    });
  });
}
