import fs from "fs";
import path from "path";

export default async function download(url, output) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });
  fs.writeFileSync(output, Buffer.from(await response.arrayBuffer()));
  return path.basename(output);
}
